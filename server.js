const express = require('express');
const pool = require('./db')

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = 3000;

app.get('/api/flights', async(req, res) => {
    try {
        const query = `
        SELECT f.id, f.depart_from, f.destination, f.departure_time, f.arrival_time, p.model as plane, string_agg(c.name || ' ' || c.surname, ', ') AS crew_member
        FROM Flights f
        JOIN Planes p on f.plane_id = p.id
        JOIN crew_flight cf on f.id = cf.flight_id
        JOIN Crew c on cf.crew_id = c.id
        GROUP BY f.id, p.id`;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error", err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/planes/:id', async(req, res) => {
    const plane_id = req.params.id;
    try {
        const query = `SELECT p.model, p.capacity
        FROM Planes p
        WHERE p.id = $1`;
        const result = await pool.query(query, [plane_id]);
        console.log(res.status);
        console.log(res.ok);
        if (!result.rows.length) {
            return res.status(404).send("No plane with such ID.");
        }
        
        console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/api/planes', async(req, res) => {
    try {
        const query = `SELECT * FROM Planes`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json("Server error");
    }
});

app.get('/api/flights/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const query = 
        `SELECT * 
        FROM Flights
        WHERE id = $1`;
        const result = await pool.query(query, [id]);
        if (!result.rows.length) {
            res.status(400).send("No flight with such ID.");
            return;
        }
        res.json(result.rows);
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).send("Server error:");
    }
});

app.get('/api/crew', async(req, res) => {
    try {
        const query = 'SELECT * FROM Crew';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).send("Server error");
    }
});

app.post('/api/flights', async(req, res) => {
    const {depart_from, destination, departure_time, arrival_time, plane_id, crew_id} = req.body;
    try {
        // console.log(Array.isArray(crew_id));
        // console.log(typeof(crew_id[0]));
        const query = 
        `
        WITH inserted_flight AS (
            INSERT INTO Flights 
            (depart_from, destination, departure_time, arrival_time, plane_id) VALUES
            ($1, $2, $3, $4, $5)
            RETURNING id
        )
        INSERT INTO crew_flight (flight_id, crew_id)
        SELECT id, unnest($6::int[])
        FROM inserted_flight
        RETURNING *;
        `;

        const result = await pool.query(query, [depart_from, destination, departure_time, arrival_time, plane_id, crew_id]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log("Error: ", err);
        if (err.code == '23514') {
            return res.status(400).json({
                code: 23514,
                message: "Arrival time must be greater than departure time."
            })
        }
        if (err.code == '23505') {
            return res.status(400).json({
                code: 23505,
                message: "Crew members must be unique."
            })
        }
        res.status(500).send("Server error");
    }
});

app.put('/api/flights/:id', async(req, res) => {
    const id = req.params.id;
    const newData = req.body;
    try {
        const oldData = await pool.query('SELECT departure_time, arrival_time FROM Flights WHERE id = $1', [id]);
        if (oldData.rows.length === 0) {
            return res.status(400).send("No flight with such ID.");
        }
        const oldRows = oldData.rows[0];
        
        const finalDeparture = newData.departure_time || oldRows.departure_time;
        const finalArrival = newData.arrival_time || oldRows.arrival_time;
        const query = 
        `UPDATE Flights
        SET departure_time = $1, arrival_time = $2
        WHERE id = $3
        RETURNING *`;

        const result = await pool.query(query, [finalDeparture, finalArrival, id]);

        res.json(result);
    } catch (err) {
        console.log("Error: ", err);
        if (err.code == '23514') {
            return res.status(400).send("Arrival time must be greater than departure time.")
        }
        res.status(500).send("Server error)");
    }
});

app.delete('/api/flights/:id', async(req, res) => {
    const id = req.params.id;
    try {
        await pool.query('BEGIN');
        await pool.query('DELETE FROM crew_flight WHERE flight_id = $1', [id]);

        const result = await pool.query('DELETE FROM Flights WHERE id = $1 RETURNING *', [id]);

        await pool.query('COMMIT');

        if (result.rows.length == 0) {
            return res.status(400).send("No flight with such ID.");
        }

        res.json({
            message: "Flights successfully deleted",
            data: result.rows[0]
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).send("Server error");
    }
});