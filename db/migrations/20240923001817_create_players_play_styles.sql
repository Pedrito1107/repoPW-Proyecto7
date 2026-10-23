-- migrate:up

CREATE TABLE players_play_styles (
  id	SERIAL PRIMARY KEY,
  play_style_id	INTEGER NOT NULL,
  player_id	INTEGER NOT NULL,
  FOREIGN KEY (play_style_id) REFERENCES play_styles (id),
  FOREIGN KEY (player_id) REFERENCES players (id)
);

-- migrate:down

DROP TABLE IF EXISTS players_play_styles;
