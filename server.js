const express = require('express');
const pool = require('./db')

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/api/flights', async(req, res) => {
    try {
        const request = `
        SELECT f.id, f.depart_from, f.destination, f.departure_time, f.arrival_time, p.model, string_agg(c.name || ' ' || c.surname, ', ') AS crew_member
        FROM Flights f
        JOIN Planes p on f.plane_id = p.id
        JOIN crew_flight cf on f.id = cf.flight_id
        JOIN Crew c on cf.crew_id = c.id
        GROUP BY f.id, p.id`;

        const result = await pool.query(request);
        res.json(result.rows);
    } catch (err) {
        console.error("Error", err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/planes/:id', async(req, res) => {
    const plane_id = req.params.id;
    try {
        const request = `SELECT p.model, p.capacity
        FROM Planes p
        WHERE p.id = $1`;
        const result = await pool.query(request, [plane_id]);
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
        const request = `SELECT * FROM Planes`;
        const result = await pool.query(request);
        res.json(result.rows);
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json("Server error");
    }
});

app.get('/api/flights/:id', async(req, res) => {
    try {
        const id = req.params.id;
        const request = 
        `SELECT * 
        FROM Flights
        WHERE id = $1`;
        const result = await pool.query(request, [id]);
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

app.post('/api/flights', async(req, res) => {
    const {depart_from, destination, departure_time, arrival_time, plane_id } = req.body;
    try {
        const request = 
        `INSERT INTO Flights 
        (depart_from, destination, departure_time, arrival_time, plane_id) VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *`;
        const result = await pool.query(request, [depart_from, destination, departure_time, arrival_time, plane_id]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log("Error: ", err);
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
        // console.log("AAAAA ", finalDeparture, finalArrival, id);
        const request = 
        `UPDATE Flights
        SET departure_time = $1, arrival_time = $2
        WHERE id = $3
        RETURNING *`;

        const result = await pool.query(request, [finalDeparture, finalArrival, id]);

        res.json(result);
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).send("Server error)");
    }
});