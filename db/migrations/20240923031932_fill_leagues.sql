-- migrate:up 

INSERT INTO leagues (id, name, nation_id) VALUES (1, '1A Pro League', 13);
INSERT INTO leagues (id, name, nation_id) VALUES (2, '3. Liga', 55);
INSERT INTO leagues (id, name, nation_id) VALUES (3, '3F Superliga', 40);
INSERT INTO leagues (id, name, nation_id) VALUES (4, 'A-League', 8);
INSERT INTO leagues (id, name, nation_id) VALUES (5, 'Allsvenskan', 135);
INSERT INTO leagues (id, name, nation_id) VALUES (6, 'Arkema PL', 51);
INSERT INTO leagues (id, name, nation_id) VALUES (7, 'Barclays WSL', 45);
INSERT INTO leagues (id, name, nation_id) VALUES (8, 'Bundesliga', 55);
INSERT INTO leagues (id, name, nation_id) VALUES (9, 'Bundesliga 2', 55);
INSERT INTO leagues (id, name, nation_id) VALUES (10, 'CSL', 28);
INSERT INTO leagues (id, name, nation_id) VALUES (11, 'CSSL', 43);
INSERT INTO leagues (id, name, nation_id) VALUES (12, 'Calcio A Femminile', 74);
INSERT INTO leagues (id, name, nation_id) VALUES (13, 'Ceska Liga Žen', 38);
INSERT INTO leagues (id, name, nation_id) VALUES (14, 'EFL Championship', 45);
INSERT INTO leagues (id, name, nation_id) VALUES (15, 'EFL League One', 45);
INSERT INTO leagues (id, name, nation_id) VALUES (16, 'EFL League Two', 45);
INSERT INTO leagues (id, name, nation_id) VALUES (17, 'Eliteserien', 107);
INSERT INTO leagues (id, name, nation_id) VALUES (18, 'Eredivisie', 102);
INSERT INTO leagues (id, name, nation_id) VALUES (19, 'Finnliiga', 50);
INSERT INTO leagues (id, name, nation_id) VALUES (20, 'GPFBL', 54);
INSERT INTO leagues (id, name, nation_id) VALUES (21, 'Hellas Liga', 57);
INSERT INTO leagues (id, name, nation_id) VALUES (22, 'ISL', 68);
INSERT INTO leagues (id, name, nation_id) VALUES (23, 'K League 1', 81);
INSERT INTO leagues (id, name, nation_id) VALUES (24, 'LALIGA EA SPORTS', 129);
INSERT INTO leagues (id, name, nation_id) VALUES (25, 'LALIGA HYPERMOTION', 129);
INSERT INTO leagues (id, name, nation_id) VALUES (26, 'Libertadores', 111);
INSERT INTO leagues (id, name, nation_id) VALUES (27, 'Liga Azerbaijan', 10);
INSERT INTO leagues (id, name, nation_id) VALUES (28, 'Liga Colombia', 30);
INSERT INTO leagues (id, name, nation_id) VALUES (29, 'Liga Cyprus', 37);
INSERT INTO leagues (id, name, nation_id) VALUES (30, 'Liga F', 129);
INSERT INTO leagues (id, name, nation_id) VALUES (31, 'Liga Hrvatska', 34);
INSERT INTO leagues (id, name, nation_id) VALUES (32, 'Liga Portugal', 114);
INSERT INTO leagues (id, name, nation_id) VALUES (33, 'Liga Portugal Feminino', 114);
INSERT INTO leagues (id, name, nation_id) VALUES (34, 'Ligue 1 McDonald''s', 51);
INSERT INTO leagues (id, name, nation_id) VALUES (35, 'Ligue 2 BKT', 51);
INSERT INTO leagues (id, name, nation_id) VALUES (36, 'MLS', 147);
INSERT INTO leagues (id, name, nation_id) VALUES (37, 'Magyar Liga', 67);
INSERT INTO leagues (id, name, nation_id) VALUES (38, 'NWSL', 147);
INSERT INTO leagues (id, name, nation_id) VALUES (39, 'Nederland Vrouwen Liga', 102);
INSERT INTO leagues (id, name, nation_id) VALUES (40, 'PKO BP Ekstraklasa', 113);
INSERT INTO leagues (id, name, nation_id) VALUES (41, 'Premier League', 45);
INSERT INTO leagues (id, name, nation_id) VALUES (42, 'Primera División', 129);
INSERT INTO leagues (id, name, nation_id) VALUES (43, 'ROSHN Saudi League', 120);
INSERT INTO leagues (id, name, nation_id) VALUES (44, 'SSE Airtricity PD', 116);
INSERT INTO leagues (id, name, nation_id) VALUES (45, 'SUPERLIGA', 123);
INSERT INTO leagues (id, name, nation_id) VALUES (46, 'Schweizer Damen Liga', 136);
INSERT INTO leagues (id, name, nation_id) VALUES (47, 'Scottish Prem', 121);
INSERT INTO leagues (id, name, nation_id) VALUES (48, 'Scottish Women''s League', 121);
INSERT INTO leagues (id, name, nation_id) VALUES (49, 'Serie A Enilive', 74);
INSERT INTO leagues (id, name, nation_id) VALUES (50, 'Serie BKT', 74);
INSERT INTO leagues (id, name, nation_id) VALUES (51, 'Sudamericana', 111);
INSERT INTO leagues (id, name, nation_id) VALUES (52, 'Sverige Liga', 135);
INSERT INTO leagues (id, name, nation_id) VALUES (53, 'Trendyol Süper Lig', 143);
INSERT INTO leagues (id, name, nation_id) VALUES (54, 'Ukrayina Liha', 145);
INSERT INTO leagues (id, name, nation_id) VALUES (55, 'United Emirates League', 146);
INSERT INTO leagues (id, name, nation_id) VALUES (56, 'Ö. Bundesliga', 55);
INSERT INTO leagues (id, name, nation_id) VALUES (57, 'Česká Liga', 38);

SELECT setval(pg_get_serial_sequence('leagues', 'id'), 58, false);

-- migrate:down 

DELETE FROM leagues;

SELECT setval(pg_get_serial_sequence('leagues', 'id'), 1, false);