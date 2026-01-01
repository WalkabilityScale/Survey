// 1. Initialize Map
var map = L.map('map').setView([43.6532, -79.3832], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var currentMarker = null;
var currentCircles = [];

function searchPostalCode() {
    var input = document.getElementById('postal-code').value;
    var errorMsg = document.getElementById('error-message');

    // 1. Clean and Format (Force "M4K 1J9" format)
    var raw = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if(raw.length < 3) {
        alert("Please enter a valid postal code.");
        return;
    }
    
    // Auto-format with space if 6 chars provided
    var formattedQuery = raw;
    if (raw.length === 6) {
        formattedQuery = raw.substring(0, 3) + " " + raw.substring(3);
    }
    
    document.getElementById('postal-code').value = formattedQuery;

    // 2. THE FIX: Use 'q' (General Search) instead of 'postalcode'
    // This allows it to find the general "M4K" area if the specific code is missing
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${formattedQuery}, Toronto, Canada`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                errorMsg.style.display = 'none';
                updateMapLocation(lat, lon);
            } else {
                // If specific code fails, try searching just the FSA (first 3 chars)
                if (formattedQuery.length > 3) {
                    searchFSA(formattedQuery.substring(0, 3));
                } else {
                    errorMsg.innerText = "Location not found.";
                    errorMsg.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Fallback function: Search first 3 digits only (e.g. "M4K")
function searchFSA(fsa) {
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${fsa}, Toronto, Canada`;
    fetch(url).then(r => r.json()).then(data => {
        if(data.length > 0) {
            document.getElementById('error-message').innerText = "Exact code not found, showing general area.";
            document.getElementById('error-message').style.display = 'block';
            document.getElementById('error-message').style.color = 'orange';
            updateMapLocation(parseFloat(data[0].lat), parseFloat(data[0].lon));
        } else {
            document.getElementById('error-message').innerText = "Location not found.";
            document.getElementById('error-message').style.display = 'block';
        }
    });
}

function updateMapLocation(lat, lon) {
    // Clear old stuff
    if (currentMarker) map.removeLayer(currentMarker);
    currentCircles.forEach(layer => map.removeLayer(layer));
    currentCircles = []; 

    // Add Marker
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("<b>Start Point</b>").openPopup();

    // Walking times and NEW COLORS
    var minutes = [5, 10, 15, 20, 25];
    var colors = ['blue', 'green', 'red', 'purple', 'black'];

    var circleGroup = L.featureGroup();

    minutes.forEach((min, index) => {
        var radiusMeters = min * 83; 
        
        var circle = L.circle([lat, lon], {
            color: colors[index],       // Border color
            fillOpacity: 0,             // HOLLOW (No fill)
            weight: 2,
            radius: radiusMeters              
        }).addTo(map);

        // Add Label
        circle.bindTooltip(`<b>${min} mins</b>`, {
            permanent: true,      // Force it to stay open
            direction: 'right',   // Put it on the right side
            className: 'my-label', // Custom class for CSS
            offset: [radiusMeters, 0] // Push it to the circle's edge
        });

        circleGroup.addLayer(circle);
        currentCircles.push(circle);
    });

    map.fitBounds(circleGroup.getBounds());
}

// Enter key listener
document.getElementById("postal-code").addEventListener("keypress", function(event) {
    if (event.key === "Enter") searchPostalCode();
});
