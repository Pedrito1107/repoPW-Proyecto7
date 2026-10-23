-- migrate:up

CREATE TABLE common_details (
  id	SERIAL PRIMARY KEY,
  overall INTEGER,
  velocity INTEGER,
  shooting INTEGER,
  passing INTEGER,
  dribbling INTEGER,
  defending INTEGER,
  physicality INTEGER,
  player_id	INTEGER NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players (id)
);

-- migrate:down

DROP TABLE IF EXISTS common_details;
