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

document.getElementById('add_flight_btn').addEventListener('click', async function() {
    document.getElementById('add_form').style.display = 'block';
    // const planes = document.getElementById('plane_select');
    fill_select(document.getElementById('plane_select'), '/api/planes', (plane) => {
        return `${plane.model} (Cap: ${plane.capacity})`;
    });

    // fill_select(document.getElementById('crew_select'), '/api/crew', (crew) => {
    //     return `${crew.name} ${crew.surname}, ${crew.position}`;
    // });
});

document.getElementById('add_crew_btn').addEventListener('click', async() => {
    const container = document.getElementById('crew_selector_container');

    const newRow = document.createElement('div');

    const new_id = container.childElementCount;

    newRow.innerHTML = `
    <div class = "formRow">
        <label>Crew member: </label><select class = "crew_select" id = crew_select${new_id}></select><button id = delete_crew${new_id}_btn>x</button>
    </div> 
    `;

    container.appendChild(newRow);

    fill_select(document.getElementById(`crew_select${new_id}`), 'api/crew', (crew) => {
        return `${crew.name} ${crew.surname}, ${crew.position}`;
    })

    document.getElementById(`delete_crew${new_id}_btn`).addEventListener('click', () => {
        container.removeChild(newRow)
    });

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

// document.getElementById('plane_id_select').addEventListener('click', async function() {
// });

async function close_form() {
    document.getElementById('add_form').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function add_flight() {
    try {
        const depart_from = document.getElementById('depart_from_input').value;
        const destination = document.getElementById('destination_input').value;
        const departure_time = document.getElementById('departure_time_input').value;
        const arrival_time = document.getElementById('arrival_time_input').value;
        const plane_id = document.getElementById('plane_select').value;

        const crew_nodes = document.querySelectorAll('.crew_select');
        const crew_ids = Array.from(crew_nodes)
                                .map(node => node.value);
        // const crew_id_input = document.getElementById('crew_id_input').value;
        console.log("AAAA", crew_ids);
        const response = await fetch('/api/flights', {
            method: 'POST',
            headers: new Headers({'Content-Type':'application/json'}),
            body: JSON.stringify({
                'depart_from': depart_from,
                'destination': destination,
                'departure_time': departure_time,
                'arrival_time': arrival_time,
                'plane_id': plane_id,
                'crew_id': crew_ids
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

async function clear_options(select) {
    const n = select.options.length - 1;
    for (i = n; i >= 0; i--) {
        select.remove(i);
    }
}

async function fill_select(select, http, display) {
    // console.log(select);
    // console.log(http);
    clear_options(select);
    
    const response = await fetch(http);
    const rows = await response.json();

    console.log(rows, Array.isArray(rows));
    
    rows.forEach(row => {
        const opt = document.createElement('option');
        opt.value = (row.id);
        opt.innerHTML = display(row);
    
        select.appendChild(opt);
    });
}
refresh_flights();

// TODO: change delete_btn to eventListener, let POST take multiple crew members, add error messages to add_flight