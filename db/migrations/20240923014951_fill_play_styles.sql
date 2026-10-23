-- migrate:up 

INSERT INTO play_styles (id, name) VALUES (1, 'Quick Step+');
INSERT INTO play_styles (id, name) VALUES (2, 'Acrobatic');
INSERT INTO play_styles (id, name) VALUES (3, 'Finesse Shot');
INSERT INTO play_styles (id, name) VALUES (4, 'Flair');
INSERT INTO play_styles (id, name) VALUES (5, 'Rapid');
INSERT INTO play_styles (id, name) VALUES (6, 'Trivela');
INSERT INTO play_styles (id, name) VALUES (7, 'Tiki Taka+');
INSERT INTO play_styles (id, name) VALUES (8, 'Aerial');
INSERT INTO play_styles (id, name) VALUES (9, 'Bruiser');
INSERT INTO play_styles (id, name) VALUES (10, 'Long Ball Pass');
INSERT INTO play_styles (id, name) VALUES (11, 'Power Shot'); -- tambien conocido como pulpo
INSERT INTO play_styles (id, name) VALUES (12, 'Press Proven');
INSERT INTO play_styles (id, name) VALUES (13, 'Acrobatic+');
INSERT INTO play_styles (id, name) VALUES (14, 'Power Header');
INSERT INTO play_styles (id, name) VALUES (15, 'Relentless+');
INSERT INTO play_styles (id, name) VALUES (16, 'Intercept');
INSERT INTO play_styles (id, name) VALUES (17, 'Slide Tackle');
INSERT INTO play_styles (id, name) VALUES (18, 'Technical');
INSERT INTO play_styles (id, name) VALUES (19, 'Chip Shot');
INSERT INTO play_styles (id, name) VALUES (20, 'First Touch');
INSERT INTO play_styles (id, name) VALUES (21, 'Incisive Pass+');
INSERT INTO play_styles (id, name) VALUES (22, 'Dead Ball');
INSERT INTO play_styles (id, name) VALUES (23, 'Pinged Pass');
INSERT INTO play_styles (id, name) VALUES (24, 'Whipped Pass');
INSERT INTO play_styles (id, name) VALUES (25, 'Finesse Shot+');
INSERT INTO play_styles (id, name) VALUES (26, 'Incisive Pass');
INSERT INTO play_styles (id, name) VALUES (27, 'Deflector+');
INSERT INTO play_styles (id, name) VALUES (28, 'Footwork');
INSERT INTO play_styles (id, name) VALUES (29, '1v1 Close Down');
INSERT INTO play_styles (id, name) VALUES (30, 'Far Throw');
INSERT INTO play_styles (id, name) VALUES (31, '1v1 Close Down+');
INSERT INTO play_styles (id, name) VALUES (32, 'Cross Claimer');
INSERT INTO play_styles (id, name) VALUES (33, 'Relentless');
INSERT INTO play_styles (id, name) VALUES (34, 'Aerial+');
INSERT INTO play_styles (id, name) VALUES (35, 'Anticipate');
INSERT INTO play_styles (id, name) VALUES (36, 'Block');
INSERT INTO play_styles (id, name) VALUES (37, 'Jockey');
INSERT INTO play_styles (id, name) VALUES (38, 'Footwork+');
INSERT INTO play_styles (id, name) VALUES (39, 'Technical+');
INSERT INTO play_styles (id, name) VALUES (40, 'Quick Step');
INSERT INTO play_styles (id, name) VALUES (41, 'Tiki Taka');
INSERT INTO play_styles (id, name) VALUES (42, 'Bruiser+');
INSERT INTO play_styles (id, name) VALUES (43, 'Chip Shot+');
INSERT INTO play_styles (id, name) VALUES (44, 'Power Shot+');
INSERT INTO play_styles (id, name) VALUES (45, 'Long Ball Pass+');
INSERT INTO play_styles (id, name) VALUES (46, 'Far Reach+');
INSERT INTO play_styles (id, name) VALUES (47, 'Deflector');
INSERT INTO play_styles (id, name) VALUES (48, 'Anticipate+');
INSERT INTO play_styles (id, name) VALUES (49, 'Trickster');
INSERT INTO play_styles (id, name) VALUES (50, 'First Touch+');
INSERT INTO play_styles (id, name) VALUES (51, 'Long Throw');
INSERT INTO play_styles (id, name) VALUES (52, 'Trickster+');
INSERT INTO play_styles (id, name) VALUES (53, 'Trivela+');
INSERT INTO play_styles (id, name) VALUES (54, 'Intercept+');
INSERT INTO play_styles (id, name) VALUES (55, 'Rapid+');
INSERT INTO play_styles (id, name) VALUES (56, 'Whipped Pass+');
INSERT INTO play_styles (id, name) VALUES (57, 'Pinged Pass+');
INSERT INTO play_styles (id, name) VALUES (58, 'Block+');
INSERT INTO play_styles (id, name) VALUES (59, 'Jockey+');
INSERT INTO play_styles (id, name) VALUES (60, 'Slide Tackle+');
INSERT INTO play_styles (id, name) VALUES (61, 'Press Proven+');
INSERT INTO play_styles (id, name) VALUES (62, 'Far Throw+');
INSERT INTO play_styles (id, name) VALUES (63, 'Power Header+');
INSERT INTO play_styles (id, name) VALUES (64, 'Dead Ball+');
INSERT INTO play_styles (id, name) VALUES (65, 'Far Reach');
INSERT INTO play_styles (id, name) VALUES (66, 'Long Throw+');
INSERT INTO play_styles (id, name) VALUES (67, 'Flair+');
INSERT INTO play_styles (id, name) VALUES (68, 'Cross Claimer+');

SELECT setval(pg_get_serial_sequence('play_styles', 'id'), 69, false);

-- migrate:down 

DELETE FROM play_styles;
SELECT setval(pg_get_serial_sequence('play_styles', 'id'), 1, false);