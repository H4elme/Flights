const pool = require('./db')

async function testConnection() {
    try {
        const res = await pool.query('SELECT * FROM FLIGHTS')
        console.log("Connected!");
        console.log(res.rows);
        pool.end();
    } catch (err) {
        console.error("Error: ", err);
    }
}

testConnection()