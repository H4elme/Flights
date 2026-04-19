CREATE TABLE Planes (
    id SERIAL PRIMARY KEY,
    model TEXT NOT NULL,
    capacity INTEGER NOT NULL
);

CREATE TABLE Flights (
    id SERIAL PRIMARY KEY,
    depart_from TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    plane_id INTEGER REFERENCES Planes(id) NOT NULL
);

CREATE TABLE Crew (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT,
    position TEXT NOT NULL
);

CREATE TABLE crew_flight (
    crew_id INTEGER REFERENCES Crew(id) NOT NULL,
    flight_id INTEGER REFERENCES Flights(id) NOT NULL,
    PRIMARY KEY (crew_id, flight_id)
);

CREATE TABLE Bookings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT,
    flight_id INTEGER REFERENCES Flights(id) NOT NULL,
    seat INTEGER NOT NULL
);

ALTER TABLE Bookings
ADD CONSTRAINT unique_flight_seat UNIQUE (flight_id, seat);

ALTER TABLE Flights
ADD CONSTRAINT check_flight_time CHECK (departure_time < arrival_time);