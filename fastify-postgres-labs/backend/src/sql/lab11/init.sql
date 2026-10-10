CREATE SCHEMA IF NOT EXISTS lab11;

CREATE TABLE IF NOT EXISTS lab11.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS lab11.users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    role_id INTEGER NOT NULL REFERENCES lab11.roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO lab11.roles (name, title)
VALUES
    ('user', 'Authenticated user'),
    ('admin', 'Administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lab11.users (login, password_hash, full_name, email, role_id)
SELECT
    'admin',
    '$2b$10$CH7shqe.KE9Vb1CCNj.Giu4y3k6Osiy/WzdiizzHX/Dm.67dXiA3m',
    'Lab11 administrator',
    'admin@example.local',
    r.id
FROM lab11.roles r
WHERE r.name = 'admin'
  AND NOT EXISTS (
      SELECT 1 FROM lab11.users WHERE login = 'admin'
  );

UPDATE lab11.users u
SET password_hash = '$2b$10$CH7shqe.KE9Vb1CCNj.Giu4y3k6Osiy/WzdiizzHX/Dm.67dXiA3m',
    full_name = 'Lab11 administrator',
    email = 'admin@example.local',
    role_id = r.id,
    updated_at = NOW()
FROM lab11.roles r
WHERE u.login = 'admin'
  AND r.name = 'admin';
