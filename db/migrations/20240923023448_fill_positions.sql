-- migrate:up 

INSERT INTO positions (id, name) VALUES (1, 'CAM');
INSERT INTO positions (id, name) VALUES (2, 'CB');
INSERT INTO positions (id, name) VALUES (3, 'CDM');
INSERT INTO positions (id, name) VALUES (4, 'CM');
INSERT INTO positions (id, name) VALUES (5, 'GK');
INSERT INTO positions (id, name) VALUES (6, 'LB');
INSERT INTO positions (id, name) VALUES (7, 'LM');
INSERT INTO positions (id, name) VALUES (8, 'LW');
INSERT INTO positions (id, name) VALUES (9, 'RB');
INSERT INTO positions (id, name) VALUES (10, 'RM');
INSERT INTO positions (id, name) VALUES (11, 'RW');
INSERT INTO positions (id, name) VALUES (12, 'ST');

SELECT setval(pg_get_serial_sequence('positions', 'id'), 13, false);

-- migrate:down 

DELETE FROM positions;

SELECT setval(pg_get_serial_sequence('positions', 'id'), 13, false);