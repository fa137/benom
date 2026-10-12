-- Example SQL for the Benom theme.
--
-- Exercises comments, strings, escapes, numbers, keywords,
-- types, functions, properties and operators.

CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  background CHAR(7) NOT NULL DEFAULT '#000000',
  released_on DATE NOT NULL,
  downloads BIGINT DEFAULT 0,
  rating REAL DEFAULT 0.0
);

CREATE INDEX idx_themes_name ON themes (lower(name));

INSERT INTO themes (name, background, released_on, downloads, rating)
VALUES
  ('Benom', '#000000', '2026-01-01', 1000, 4.5),
  ('Benom Alt', '#211816', '2026-01-01', 500, 4.75);

-- A string with an escaped quote: 'It''s dark'.
SELECT
  t.name,
  t.background,
  t.downloads * 2 AS doubled,
  t.rating + 0.25 AS boosted
FROM themes AS t
WHERE t.downloads > 100
  AND t.name LIKE 'Benom%'
ORDER BY t.rating DESC, t.name ASC
LIMIT 10 OFFSET 0;

UPDATE themes
SET downloads = downloads + 1
WHERE id = (SELECT id FROM themes WHERE name = 'Benom');

DELETE FROM themes
WHERE rating < 1.0 AND released_on < '2020-01-01';

SELECT count(*), coalesce(max(rating), 0.0), sum(downloads) FILTER (WHERE id > 0)
FROM themes;
