-- しおりアプリ 目標スキーマ（フロント準拠）
-- PostgreSQL
--
-- 【使い分け】
--   空の DB           → このファイル (schema.sql) をそのまま実行
--   既存テーブルあり  → migrate_from_legacy.sql を実行（users 既存エラー回避）
--   開発で作り直し    → reset_dev.sql → schema.sql の順

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username        varchar(50)  NOT NULL,
    email           varchar(255) NOT NULL,
    password_hash   varchar(255) NOT NULL,
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_key UNIQUE (email)
);

-- ---------------------------------------------------------------------------
-- shioris
-- is_editable / is_comment_open は「旅行計画」ページの権限
-- ---------------------------------------------------------------------------
CREATE TABLE shioris (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id          uuid         NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    title             varchar(255) NOT NULL,
    password_hash     varchar(255) NOT NULL,
    description       text,
    start_date        date,
    end_date          date,
    is_editable       boolean      NOT NULL DEFAULT true,
    is_comment_open   boolean      NOT NULL DEFAULT true,
    promises          text,
    created_at        timestamptz  NOT NULL DEFAULT now(),
    updated_at        timestamptz  NOT NULL DEFAULT now(),
    deleted_at        timestamptz,
    CONSTRAINT shioris_period_chk CHECK (
        start_date IS NULL OR end_date IS NULL OR end_date >= start_date
    )
);

CREATE INDEX shioris_owner_id_idx ON shioris (owner_id);
CREATE INDEX shioris_created_at_idx ON shioris (created_at);

-- ---------------------------------------------------------------------------
-- shiori_members
-- ---------------------------------------------------------------------------
CREATE TABLE shiori_members (
    id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id              uuid        NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    user_id                uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    role                   varchar(20) NOT NULL,
    status                 varchar(20) NOT NULL,
    password_verified_at   timestamptz,
    joined_at              timestamptz,
    left_at                timestamptz,
    CONSTRAINT shiori_members_shiori_user_key UNIQUE (shiori_id, user_id),
    CONSTRAINT shiori_members_role_chk CHECK (role IN ('owner', 'member')),
    CONSTRAINT shiori_members_status_chk CHECK (status IN ('active', 'left', 'banned'))
);

CREATE INDEX shiori_members_user_status_idx ON shiori_members (user_id, status);

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
CREATE TABLE invitations (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id          uuid         NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    inviter_id         uuid         NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    invitee_email      varchar(255) NOT NULL,
    message            text,
    token              varchar(255) NOT NULL,
    status             varchar(20)  NOT NULL,
    created_at         timestamptz  NOT NULL DEFAULT now(),
    accepted_at        timestamptz,
    accepted_user_id   uuid REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT invitations_token_key UNIQUE (token),
    CONSTRAINT invitations_status_chk CHECK (status IN ('pending', 'accepted', 'expired'))
);

CREATE INDEX invitations_shiori_id_idx ON invitations (shiori_id);

-- ---------------------------------------------------------------------------
-- shiori_days
-- is_editable / is_comment_open はその日の権限
-- ---------------------------------------------------------------------------
CREATE TABLE shiori_days (
    id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id                  uuid        NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    trip_date                  date        NOT NULL,
    day_number                 integer     NOT NULL,
    title                      varchar(255),
    notes                      text,
    estimated_cost             numeric(12, 0),
    representative_photo_id    uuid,
    is_editable                boolean     NOT NULL DEFAULT true,
    is_comment_open            boolean     NOT NULL DEFAULT true,
    created_at                 timestamptz NOT NULL DEFAULT now(),
    updated_at                 timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT shiori_days_shiori_trip_date_key UNIQUE (shiori_id, trip_date),
    CONSTRAINT shiori_days_shiori_day_number_key UNIQUE (shiori_id, day_number),
    CONSTRAINT shiori_days_day_number_chk CHECK (day_number >= 1)
);

CREATE INDEX shiori_days_shiori_id_idx ON shiori_days (shiori_id);

-- ---------------------------------------------------------------------------
-- roadmap_items
-- ---------------------------------------------------------------------------
CREATE TABLE roadmap_items (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id       uuid         NOT NULL REFERENCES shiori_days (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    starts_at    time         NOT NULL,
    ends_at      time,
    title        varchar(255) NOT NULL DEFAULT '',
    amount       numeric(12, 0),
    sort_order   integer      NOT NULL DEFAULT 0,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT roadmap_items_time_chk CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX roadmap_items_day_id_idx ON roadmap_items (day_id, starts_at, sort_order);

-- ---------------------------------------------------------------------------
-- photos（representative_photo_id の FK は photos 作成後）
-- ---------------------------------------------------------------------------
CREATE TABLE photos (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id     uuid         NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    day_id        uuid         NOT NULL REFERENCES shiori_days (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    user_id       uuid         NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    image_path    varchar(1024) NOT NULL,
    is_deleted    boolean      NOT NULL DEFAULT false,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT photos_day_user_key UNIQUE (day_id, user_id)
);

CREATE INDEX photos_shiori_id_idx ON photos (shiori_id);
CREATE INDEX photos_shiori_user_idx ON photos (shiori_id, user_id);

ALTER TABLE shiori_days
    ADD CONSTRAINT shiori_days_representative_photo_fk
    FOREIGN KEY (representative_photo_id) REFERENCES photos (id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- photo_likes（押下1回=1行。同一ユーザーの重複可。上限999はアプリ）
-- ---------------------------------------------------------------------------
CREATE TABLE photo_likes (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id     uuid        NOT NULL REFERENCES photos (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    user_id      uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX photo_likes_photo_id_idx ON photo_likes (photo_id);
CREATE INDEX photo_likes_photo_user_idx ON photo_likes (photo_id, user_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
CREATE TABLE comments (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id     uuid        NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    author_id     uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    body          text        NOT NULL,
    target_type   varchar(32) NOT NULL,
    target_id     uuid        NOT NULL,
    target_field  varchar(64),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT comments_target_type_chk CHECK (
        target_type IN ('shiori', 'shiori_day', 'roadmap_item', 'photo')
    ),
    CONSTRAINT comments_target_field_chk CHECK (
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
    )
);

CREATE INDEX comments_shiori_created_idx ON comments (shiori_id, created_at);
CREATE INDEX comments_target_idx ON comments (target_type, target_id, target_field);

-- ---------------------------------------------------------------------------
-- packing_items / packing_item_contributions
-- ---------------------------------------------------------------------------
CREATE TABLE packing_items (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shiori_id        uuid         NOT NULL REFERENCES shioris (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    name             varchar(255) NOT NULL DEFAULT '',
    required_count   integer      NOT NULL DEFAULT 1,
    sort_order       integer      NOT NULL DEFAULT 0,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT packing_items_required_count_chk CHECK (required_count >= 1)
);

CREATE INDEX packing_items_shiori_id_idx ON packing_items (shiori_id, sort_order);

CREATE TABLE packing_item_contributions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    packing_item_id   uuid        NOT NULL REFERENCES packing_items (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    user_id           uuid        NOT NULL REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    quantity          integer     NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT packing_item_contributions_item_user_key UNIQUE (packing_item_id, user_id),
    CONSTRAINT packing_item_contributions_quantity_chk CHECK (quantity >= 1)
);

CREATE INDEX packing_item_contributions_item_idx ON packing_item_contributions (packing_item_id);
