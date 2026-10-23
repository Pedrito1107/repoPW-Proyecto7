-- migrate:up 

INSERT INTO foots (id, name) VALUES (1, 'Right');
INSERT INTO foots (id, name) VALUES (2, 'Left');

SELECT setval(pg_get_serial_sequence('foots', 'id'), 3, false);

-- migrate:down 

DELETE FROM foots;

SELECT setval(pg_get_serial_sequence('foots', 'id'), 1, false);