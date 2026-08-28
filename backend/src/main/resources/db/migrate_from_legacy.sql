-- =============================================================================
-- 既存 DB 移行スクリプト（データ保持・追加分のみ）
-- =============================================================================
-- 用途: すでに users / shioris 等がある DB を、フロント準拠スキーマへ揃える。
--       schema.sql は空 DB 用なので、既存 DB ではこちらを使う。
--
-- 実行方法（Supabase SQL Editor 等）:
--   1. このファイル全文を貼り付けて実行
--   2. 末尾の「移行確認クエリ」で結果を確認
--
-- 注意:
--   - 既存行は消えない（DROP TABLE しない）
--   - packing_item_checks は contributions へ移行後に DROP する
--   - 何度実行してもよい（IF NOT EXISTS / IF EXISTS を使用）
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. shiori_days: 日次ページの編集・コメント権限
-- ---------------------------------------------------------------------------
ALTER TABLE shiori_days
    ADD COLUMN IF NOT EXISTS is_editable boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS is_comment_open boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN shiori_days.is_editable IS 'その日の編集可否（作成者は常に可）';
COMMENT ON COLUMN shiori_days.is_comment_open IS 'その日のコメント投稿可否';

-- ---------------------------------------------------------------------------
-- 2. roadmap_items: ends_at 任意、title 空文字可、sort_order 必須化
-- ---------------------------------------------------------------------------
ALTER TABLE roadmap_items
    ALTER COLUMN ends_at DROP NOT NULL;

ALTER TABLE roadmap_items
    ALTER COLUMN title SET DEFAULT '';

UPDATE roadmap_items
SET title = ''
WHERE title IS NULL;

ALTER TABLE roadmap_items
    ALTER COLUMN title SET NOT NULL;

-- sort_order 列が無い古い DB 用
ALTER TABLE roadmap_items
    ADD COLUMN IF NOT EXISTS sort_order integer;

UPDATE roadmap_items
SET sort_order = 0
WHERE sort_order IS NULL;

ALTER TABLE roadmap_items
    ALTER COLUMN sort_order SET DEFAULT 0;

ALTER TABLE roadmap_items
    ALTER COLUMN sort_order SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. packing_items: テーブル自体が無い場合は作成、sort_order を追加
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packing_items (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id        uuid         NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    name             varchar(255) NOT NULL DEFAULT '',
    required_count   integer      NOT NULL DEFAULT 1,
    sort_order       integer      NOT NULL DEFAULT 0,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT packing_items_required_count_chk CHECK (required_count >= 1)
);

ALTER TABLE packing_items
    ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS packing_items_shiori_id_idx
    ON packing_items (shiori_id, sort_order);

-- ---------------------------------------------------------------------------
-- 4. comments: target_field に packing / cost_summary を許可
--    （制約名が環境によって異なる場合があるため動的に DROP）
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'comments'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) LIKE '%target_field%'
    LOOP
        EXECUTE format('ALTER TABLE comments DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END LOOP;
END $$;

ALTER TABLE comments
    ADD CONSTRAINT comments_target_field_chk CHECK (
        (
            target_type = 'shiori'
            AND target_field IN (
                'title', 'description', 'period', 'promises', 'packing', 'cost_summary'
            )
        )
        OR (
            target_type = 'shiori_day'
            AND target_field IN (
                'title', 'notes', 'estimated_cost', 'representative_photo'
            )
        )
        OR (
            target_type IN ('roadmap_item', 'photo')
            AND target_field IS NULL
        )
    );

-- ---------------------------------------------------------------------------
-- 5. packing_item_contributions: 新テーブル作成
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packing_item_contributions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    packing_item_id   uuid        NOT NULL REFERENCES packing_items (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    user_id           uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quantity          integer     NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT packing_item_contributions_item_user_key UNIQUE (packing_item_id, user_id),
    CONSTRAINT packing_item_contributions_quantity_chk CHECK (quantity >= 1)
);

CREATE INDEX IF NOT EXISTS packing_item_contributions_item_idx
    ON packing_item_contributions (packing_item_id);

-- ---------------------------------------------------------------------------
-- 6. packing_item_checks → packing_item_contributions へデータ移行
--    （旧テーブルがある場合のみ。quantity=1 として移行）
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'packing_item_checks'
    ) THEN
        INSERT INTO packing_item_contributions (
            id,
            packing_item_id,
            user_id,
            quantity,
            created_at,
            updated_at
        )
        SELECT
            id,
            packing_item_id,
            user_id,
            1,
            created_at,
            created_at
        FROM packing_item_checks
        ON CONFLICT (packing_item_id, user_id) DO NOTHING;

        DROP TABLE packing_item_checks;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 7. 不足しているインデックス（あれば追加）
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS shiori_days_shiori_id_idx
    ON shiori_days (shiori_id);

CREATE INDEX IF NOT EXISTS comments_target_idx
    ON comments (target_type, target_id, target_field);

-- =============================================================================
-- 移行確認クエリ（実行後に結果を目視確認）
-- =============================================================================
-- shiori_days に権限列があるか
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'shiori_days'
  AND column_name IN ('is_editable', 'is_comment_open')
ORDER BY column_name;

-- packing_item_contributions が存在し、旧 checks が無いか
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('packing_item_contributions', 'packing_item_checks')
ORDER BY table_name;

-- 担当データ件数（移行後）
SELECT COUNT(*) AS contribution_count
FROM packing_item_contributions;
