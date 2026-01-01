// 1. Initialize Map
var map = L.map('map').setView([43.6532, -79.3832], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var currentMarker = null;
var currentCircles = [];
var currentLabels = []; // Store labels so we can remove them later

// 2. The Robust Search Function
function searchPostalCode() {
    var input = document.getElementById('postal-code').value;
    var errorMsg = document.getElementById('error-message');

    // Clean Input
    var raw = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if(raw.length < 3) {
        alert("Please enter a valid postal code.");
        return;
    }

    // Format for display
    var formattedQuery = raw;
    if (raw.length === 6) {
        formattedQuery = raw.substring(0, 3) + " " + raw.substring(3);
    }
    document.getElementById('postal-code').value = formattedQuery;

    // STRATEGY 1: Exact Search
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${formattedQuery}, Toronto, Canada`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Found exact match
                success(data[0].lat, data[0].lon, false);
            } else {
                // STRATEGY 2: Fallback to FSA (First 3 chars)
                var fsa = raw.substring(0, 3);
                console.log("Exact match failed. Trying FSA:", fsa);
                searchFSA(fsa);
            }
        })
        .catch(error => console.error('Error:', error));
}

function searchFSA(fsa) {
    // Try FSA + Toronto first
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${fsa}, Toronto, Canada`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                success(data[0].lat, data[0].lon, true);
            } else {
                // STRATEGY 3: FSA + Canada (Broad search)
                var url2 = `https://nominatim.openstreetmap.org/search?format=json&q=${fsa}, Canada`;
                fetch(url2).then(r => r.json()).then(d2 => {
                    if (d2.length > 0) {
                        success(d2[0].lat, d2[0].lon, true);
                    } else {
                        fail();
                    }
                });
            }
        });
}

// Helper: What to do when we find a location
function success(lat, lon, isApproximate) {
    var errorMsg = document.getElementById('error-message');
    
    if (isApproximate) {
        errorMsg.innerText = "Exact building not found. Showing general neighborhood (FSA).";
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#e67e22'; // Orange warning
    } else {
        errorMsg.style.display = 'none';
    }
    
    updateMapLocation(parseFloat(lat), parseFloat(lon));
}

// Helper: What to do when we fail completely
function fail() {
    var errorMsg = document.getElementById('error-message');
    errorMsg.innerText = "Location not found. Please try a nearby intersection or postal code.";
    errorMsg.style.display = 'block';
    errorMsg.style.color = 'red';
}

// 3. Update Visuals
function updateMapLocation(lat, lon) {
    // A. Clear everything
    if (currentMarker) map.removeLayer(currentMarker);
    currentCircles.forEach(layer => map.removeLayer(layer));
    currentLabels.forEach(layer => map.removeLayer(layer));
    currentCircles = [];
    currentLabels = [];

    // B. Add Center Marker
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("<b>Start Point</b>").openPopup();

    // C. Draw Circles & Labels
    var minutes = [5, 10, 15, 20, 25];
    var colors = ['blue', 'green', 'red', 'purple', 'black'];
    var circleGroup = L.featureGroup(); // To calculate zoom bounds

    minutes.forEach((min, index) => {
        var radiusMeters = min * 83; // 5 mins * 83m/min
        
        // 1. Draw the Hollow Circle
        var circle = L.circle([lat, lon], {
            color: colors[index],
            fillOpacity: 0,  // Hollow
            weight: 2,
            radius: radiusMeters
        }).addTo(map);
        currentCircles.push(circle);
        circleGroup.addLayer(circle);

        // 2. Calculate the position for the label (The "North" point of the circle)
        // 1 degree of latitude is roughly 111,111 meters
        var latOffset = radiusMeters / 111111;
        var labelLat = lat + latOffset;

        // 3. Add a Text Label exactly at that point
        var labelIcon = L.divIcon({
            className: 'walking-label', // We will style this in CSS
            html: `<span style="color:${colors[index]}">${min} mins</span>`,
            iconSize: [60, 20], // Width, Height
            iconAnchor: [30, 10] // Center the text on the line
        });

        var labelMarker = L.marker([labelLat, lon], { icon: labelIcon }).addTo(map);
        currentLabels.push(labelMarker);
    });

    // D. Zoom to fit the largest circle
    map.fitBounds(circleGroup.getBounds());
}

// Enter Key Listener
document.getElementById("postal-code").addEventListener("keypress", function(event) {
    if (event.key === "Enter") searchPostalCode();
});
