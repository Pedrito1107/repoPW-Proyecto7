-- migrate:up

CREATE TABLE nations (
  id	SERIAL PRIMARY KEY,
  name	VARCHAR(40)
);

-- migrate:down

DROP TABLE IF EXISTS nations;
