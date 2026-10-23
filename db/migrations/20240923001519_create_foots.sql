-- migrate:up

CREATE TABLE foots (
  id	SERIAL PRIMARY KEY,
  name	VARCHAR(6)
);

-- migrate:down

DROP TABLE IF EXISTS foots;
