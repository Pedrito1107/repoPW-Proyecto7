-- migrate:up

CREATE TABLE players (
  id	SERIAL PRIMARY KEY,
  name	VARCHAR(60),
  rank INTEGER,
  weak_foot INTEGER,
  skill_moves INTEGER,
  heigth INTEGER,
  weight INTEGER,
  age INTEGER,
  url VARCHAR(120),
  foot_id INTEGER NOT NULL,
  sex_id INTEGER NOT NULL,
  position_id INTEGER NOT NULL,
  nation_id	INTEGER NOT NULL,
  team_id	INTEGER NOT NULL,
  FOREIGN KEY (foot_id) REFERENCES foots (id),
  FOREIGN KEY (sex_id) REFERENCES sexs (id),
  FOREIGN KEY (position_id) REFERENCES positions (id),
  FOREIGN KEY (nation_id) REFERENCES nations (id),
  FOREIGN KEY (team_id) REFERENCES teams (id)
);

-- migrate:down

DROP TABLE IF EXISTS players;
