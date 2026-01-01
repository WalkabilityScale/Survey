// 1. Initialize Map
var map = L.map('map').setView([43.6532, -79.3832], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

var currentMarker = null;
var currentCircles = [];
var currentLabels = [];

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

    // Format for display (M5R3L8 -> M5R 3L8)
    var formattedQuery = raw;
    if (raw.length === 6) {
        formattedQuery = raw.substring(0, 3) + " " + raw.substring(3);
    }
    document.getElementById('postal-code').value = formattedQuery;

    // STRATEGY 1: Exact Search (The specific building)
    // We try looking for the exact string first
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${formattedQuery}, Canada`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Found exact match
                success(data[0].lat, data[0].lon, false);
            } else {
                // STRATEGY 2: FSA Fallback (The General Zone)
                // If specific fails, we search for "Postcode M5R" which is standard in OSM
                var fsa = raw.substring(0, 3);
                console.log("Exact match failed. Trying FSA:", fsa);
                searchFSA(fsa);
            }
        })
        .catch(error => console.error('Error:', error));
}

function searchFSA(fsa) {
    // We search specifically for the postal prefix
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=Postcode ${fsa}, Canada`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Success with FSA
                success(data[0].lat, data[0].lon, true);
            } else {
                fail();
            }
        });
}

function success(lat, lon, isApproximate) {
    var errorMsg = document.getElementById('error-message');
    
    if (isApproximate) {
        // We found the area, but not the exact house. This is good enough for the survey.
        errorMsg.innerText = "Exact address not found, centering on neighborhood.";
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#e67e22'; // Orange warning
    } else {
        errorMsg.style.display = 'none';
    }
    
    updateMapLocation(parseFloat(lat), parseFloat(lon));
}

function fail() {
    var errorMsg = document.getElementById('error-message');
    errorMsg.innerText = "Location not found. Please check the code.";
    errorMsg.style.display = 'block';
    errorMsg.style.color = 'red';
}

function updateMapLocation(lat, lon) {
    // A. Clear previous layers
    if (currentMarker) map.removeLayer(currentMarker);
    currentCircles.forEach(layer => map.removeLayer(layer));
    currentLabels.forEach(layer => map.removeLayer(layer));
    currentCircles = [];
    currentLabels = [];

    // B. Add Center Marker (NO POPUP anymore)
    currentMarker = L.marker([lat, lon]).addTo(map);

    // C. Draw Circles & Labels
    var minutes = [5, 10, 15, 20, 25];
    var colors = ['blue', 'green', 'red', 'purple', 'black'];
    var circleGroup = L.featureGroup();

    minutes.forEach((min, index) => {
        var radiusMeters = min * 83; 
        
        // 1. Draw Hollow Circle
        var circle = L.circle([lat, lon], {
            color: colors[index],
            fillOpacity: 0, 
            weight: 2,
            radius: radiusMeters
        }).addTo(map);
        currentCircles.push(circle);
        circleGroup.addLayer(circle);

        // 2. Position Label at the very top (North) of the circle
        var latOffset = radiusMeters / 111111; 
        var labelLat = lat + latOffset;

        // 3. Create the text label
        var labelIcon = L.divIcon({
            className: 'walking-label', 
            html: `<span style="color:${colors[index]}">${min} mins</span>`,
            iconSize: [60, 20], 
            iconAnchor: [30, 10] 
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
