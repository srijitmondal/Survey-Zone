let locations = [];

document.addEventListener("DOMContentLoaded", function () {
    fetch('assets/empdata.json')
        .then(response => response.json())
        .then(data => {
            const employees = data.employees;
            const employeeListDiv = document.getElementById('employeeList');

            employees.forEach(employee => {
                const employeeLink = document.createElement('div');
                employeeLink.className = 'employee-link';
                employeeLink.innerText = employee.name;
                employeeLink.onclick = () => showMap(employee.locations);
                employeeListDiv.appendChild(employeeLink);
            });
        })
        .catch(error => console.error('Error loading employee data:', error));

    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("mapPopup").style.display = 'none';
    });
});

function showMap(employeeLocations) {
    locations = employeeLocations;
    document.getElementById('mapPopup').style.display = 'flex';
    initMap();
}

function initMap() {
    if (!locations || locations.length === 0) return;

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: locations[0].latitude, lng: locations[0].longitude },
        disableDefaultUI: false
    });

    const directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
    const directionsService = new google.maps.DirectionsService();
    
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("sidebar"));

    populateDropdowns(locations);

    document.getElementById("calculateRoute").onclick = function () {
        calculateAndDisplayRoute(directionsService, directionsRenderer);
    };
}

function populateDropdowns(locations) {
    const startSelect = document.getElementById("start");
    const endSelect = document.getElementById("end");

    startSelect.innerHTML = "";
    endSelect.innerHTML = "";

    locations.forEach((loc, index) => {
        const option = new Option(`Point ${index + 1} - ${new Date(loc.timestamp).toLocaleTimeString()}`, `${loc.latitude},${loc.longitude}`);
        startSelect.appendChild(option.cloneNode(true));
        endSelect.appendChild(option.cloneNode(true));
    });

    startSelect.selectedIndex = 0;
    endSelect.selectedIndex = locations.length - 1;
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    const startValue = document.getElementById("start").value;
    const endValue = document.getElementById("end").value;
    const selectedMode = document.getElementById("mode").value;

    if (!startValue || !endValue) {
        alert("Start or End location is missing");
        return;
    }

    const startCoords = startValue.split(",").map(Number);
    const endCoords = endValue.split(",").map(Number);

    const request = {
        origin: { lat: startCoords[0], lng: startCoords[1] },
        destination: { lat: endCoords[0], lng: endCoords[1] },
        travelMode: google.maps.TravelMode[selectedMode],
        waypoints: locations.slice(1, -1).map(loc => ({
            location: new google.maps.LatLng(loc.latitude, loc.longitude),
            stopover: true
        }))
    };

    directionsService
        .route(request)
        .then(response => {
            directionsRenderer.setDirections(response);
            calculateTotalDistance(response);
        })
        .catch(error => {
            alert("Directions request failed: " + error);
        });
}

function calculateTotalDistance(response) {
    let totalDistance = 0;
    const route = response.routes[0];

    if (!route || !route.legs) {
        console.error("Invalid route response");
        document.getElementById("totalDistance").innerText = "Total Distance: Error calculating";
        return;
    }

    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
    });

    document.getElementById("totalDistance").innerText = `Total Distance: ${(totalDistance / 1000).toFixed(2)} km`;
}
