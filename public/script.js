async function refresh_flights() {
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
            <td><button onclick = 'delete_flight(${flight.id})'>Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Frontend error: ', err);
    }
}

async function delete_flight(id) {
    if (!confirm(`Are you sure you want to delete flight #${id}?`)) {
        return;
    }
    try {
        const response = await fetch(`/api/flights/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Flight deleted!');
            refresh_flights();
        } else {
            const errorData = await response.json();
            alert(`Error ${errorData.message || 'Could not delete'}`);
        }
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Frontend error: ', err);
    }
}

document.getElementById('add_flight_btn').addEventListener('click', function() {
    document.getElementById('add_form').style.display = 'block';
});

document.getElementById('add_flight_btn').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'block';
});

document.getElementById('close_btn').addEventListener('click', function() {
    close_form();
});
document.getElementById('close_btn').addEventListener('click', function() {
    close_form();
});

document.getElementById('overlay').addEventListener('click', function() {
    close_form();
});

document.getElementById('add_btn').addEventListener('click', function() {
    add_flight();
});

async function close_form() {
    document.getElementById('add_form').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function add_flight() {
    try {
        const depart_from_input = document.getElementById('depart_from_input').value;
        const destination_input = document.getElementById('destination_input').value;
        const departure_time_input = document.getElementById('departure_time_input').value;
        const arrival_time_input = document.getElementById('arrival_time_input').value;
        const plane_id_input = document.getElementById('plane_id_input').value;
        const crew_id_input = document.getElementById('crew_id_input').value;
        console.log("AAAA", depart_from_input, crew_id_input);
        const response = await fetch('/api/flights', {
            method: 'POST',
            headers: new Headers({'Content-Type':'application/json'}),
            body: JSON.stringify({
                'depart_from': depart_from_input,
                'destination': destination_input,
                'departure_time': departure_time_input,
                'arrival_time': arrival_time_input,
                'plane_id': plane_id_input,
                'crew_id': crew_id_input
            })
        });
        if (response.ok) {
            alert("Flight added.");
            refresh_flights();
            close_form();
        }
            else {
                console.error("Frontend error.");
            }
    } catch (err) {
        console.log("Error: ", err);
    }
}

refresh_flights();

// TODO: change delete_btn to eventListener, let POST take multiple crew members, add error messages to add_flight