async function refreshFlights() {
    try {
        const response = await fetch('/api/flights');
        const flights = await response.json();

        const tableBody = document.getElementById('flight-data');

        tableBody.innerHTML = '';

        flights.forEach(flight => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${flight.id}</td>
            <td>${flight.depart_from}</td>
            <td>${flight.destination}</td>
            <td>${new Date(flight.departure_time).toLocaleString()}</td>
            <td>${new Date(flight.arrival_time).toLocaleString()}</td>
            <td>${flight.plane}</td>
            <td>${flight.crew_member}</td>
            <td><button onclick = "deleteFlight(${flight.id})">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Frontend error: ", err);
    }
}

async function deleteFlight(id) {
    if (!confirm(`Are you sure you want to delete flight #${id}?`)) {
        return;
    }
    try {
        const response = await fetch(`/api/flights/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Flight deleted!");
            refreshFlights();
        } else {
            const errorData = await response.json();
            alert(`Error ${errorData.message || "Could not delete"}`);
        }
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Frontend error: ", err);
    }
}

refreshFlights();