INSERT INTO planes (model, capacity) VALUES
('Airbus A320', 150),
('Boeing 737', 110),
('Airbus A220', 100);

INSERT INTO crew (name, surname, position) VALUES
('Jon', 'Smith', 'Pilot'),
('Emma', 'Johnson', 'Pilot'),
('Noah', 'Brown', 'Flight attendant'),
('Olivia', 'Williams', 'Flight Attendant');

INSERT INTO Flights (depart_from, destination, departure_time, arrival_time, plane_id) VALUES
('Warsaw', 'Berlin', '2026-06-25 13:00:00+02', '2026-06-25 14:30:00+02', (
    SELECT id FROM planes
    WHERE model = 'Airbus A320'
    LIMIT 1
    )),
('London', 'Washington', '2026-05-13 20:00:00+00', '2026-05-14 04:30:00+02',  (
    SELECT id FROM planes
    WHERE model = 'Boeing 737'
    LIMIT 1
    ));

INSERT INTO crew_flight (crew_id, flight_id) VALUES
((SELECT id FROM crew WHERE surname = 'Smith'), 1),
((SELECT id FROM crew WHERE surname = 'Williams'), 2),
((SELECT id FROM crew WHERE surname = 'Johnson'), 2),
((SELECT id FROM crew WHERE surname = 'Brown'), 1);


SELECT f.id, depart_from, destination, departure_time, arrival_time, p.model AS airplane_model, p.id, string_agg(c.name || ' ' || c.surname, ', ') AS crew_members
FROM Flights f
JOIN Planes as p ON f.plane_id = p.id
JOIN crew_flight cf ON f.id = cf.flight_id
JOIN crew c on c.id = cf.crew_id
GROUP BY f.id, p.id