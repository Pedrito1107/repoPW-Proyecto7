-- migrate:up

CREATE TABLE play_styles (
  id	SERIAL PRIMARY KEY,
  name	VARCHAR(30)
);

-- migrate:down

DROP TABLE IF EXISTS play_styles;
