-- 開発 DB を空にして schema.sql を流せるようにするスクリプト
-- 本番では使わないこと。全データが消える。

DROP TABLE IF EXISTS packing_item_contributions CASCADE;
DROP TABLE IF EXISTS packing_item_checks CASCADE;
DROP TABLE IF EXISTS packing_items CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS photo_likes CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS roadmap_items CASCADE;
DROP TABLE IF EXISTS shiori_days CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS shiori_members CASCADE;
DROP TABLE IF EXISTS shioris CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 実行後に schema.sql を流す
