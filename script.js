// 1. Initialize Map
var map = L.map('map').setView([43.6532, -79.3832], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var currentMarker = null;
var currentCircles = [];
var currentLabels = [];

// 2. Postal Code Search
function searchPostalCode() {
    var input = document.getElementById('postal-code').value;

    // Normalize input
    var raw = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (raw.length < 3) {
        showError("Please enter a valid Canadian postal code.", "red");
        return;
    }

    // Format for display
    if (raw.length === 6) {
        document.getElementById('postal-code').value =
            raw.substring(0, 3) + " " + raw.substring(3);
    }

    // STRATEGY 1: Full postal code with Toronto context
    var query = `${raw}, Toronto, Ontario, Canada`;
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca&limit=1`;

    fetch(url, { headers: { "Accept": "application/json" } })
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                success(data[0].lat, data[0].lon, false);
            } else {
                // STRATEGY 2: FSA fallback
                var fsa = raw.substring(0, 3);
                searchFSA(fsa);
            }
        })
        .catch(() => fail());
}

function searchFSA(fsa) {
    var query = `${fsa}, Toronto, Ontario, Canada`;
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca&limit=1`;

    fetch(url, { headers: { "Accept": "application/json" } })
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                success(data[0].lat, data[0].lon, true);
            } else {
                fail();
            }
        })
        .catch(() => fail());
}

function success(lat, lon, isApproximate) {
    var msg = document.getElementById('error-message');

    if (isApproximate) {
        showError("Exact postal code not found. Showing approximate neighborhood center.", "#e67e22");
    } else {
        msg.style.display = "none";
    }

    updateMapLocation(parseFloat(lat), parseFloat(lon));
}

function fail() {
    showError("Location could not be resolved in Toronto. Please check the postal code.", "red");
}

function showError(text, color) {
    var msg = document.getElementById('error-message');
    msg.innerText = text;
    msg.style.color = color;
    msg.style.display = "block";
}

// 3. Map Update
function updateMapLocation(lat, lon) {
    if (currentMarker) map.removeLayer(currentMarker);
    currentCircles.forEach(l => map.removeLayer(l));
    currentLabels.forEach(l => map.removeLayer(l));
    currentCircles = [];
    currentLabels = [];

    currentMarker = L.marker([lat, lon]).addTo(map);

    var minutes = [5, 10, 15, 20, 25];
    var colors = ['blue', 'green', 'red', 'purple', 'black'];
    var group = L.featureGroup();

    minutes.forEach((min, i) => {
        var radius = min * 83;

        var circle = L.circle([lat, lon], {
            color: colors[i],
            fillOpacity: 0,
            weight: 2,
            radius: radius
        }).addTo(map);

        currentCircles.push(circle);
        group.addLayer(circle);

        var labelLat = lat + (radius / 111111);

        var label = L.marker([labelLat, lon], {
            icon: L.divIcon({
                className: 'walking-label',
                html: `<span style="color:${colors[i]}">${min} mins</span>`,
                iconSize: [60, 20],
                iconAnchor: [30, 10]
            })
        }).addTo(map);

        currentLabels.push(label);
    });

    map.fitBounds(group.getBounds());
}

// Enter key
document.getElementById("postal-code")
    .addEventListener("keypress", e => {
        if (e.key === "Enter") searchPostalCode();
    });

