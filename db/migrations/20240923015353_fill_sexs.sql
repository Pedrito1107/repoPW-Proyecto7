-- migrate:up 

INSERT INTO sexs (id, name) VALUES (1, 'Hombre');
INSERT INTO sexs (id, name) VALUES (2, 'Mujer');

SELECT setval(pg_get_serial_sequence('sexs', 'id'), 3, false);

-- migrate:down 

DELETE FROM sexs;
SELECT setval(pg_get_serial_sequence('sexs', 'id'), 1, false);