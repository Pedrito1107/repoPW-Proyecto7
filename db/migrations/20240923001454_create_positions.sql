-- migrate:up

CREATE TABLE positions (
  id	SERIAL PRIMARY KEY,
  name	VARCHAR(10)
);

-- migrate:down

DROP TABLE IF EXISTS positions;
