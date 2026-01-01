// 1. Initialize Map
var map = L.map('map').setView([43.6532, -79.3832], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Variables to store map layers
var currentMarker = null;
var currentCircles = [];

// 2. The Search Function
function searchPostalCode() {
    var input = document.getElementById('postal-code').value;
    var errorMsg = document.getElementById('error-message');

    // CLEANING STEP: Remove all non-alphanumeric characters (spaces, dashes)
    var raw = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Check if we have exactly 6 characters
    if(raw.length !== 6) {
        alert("Please enter a valid 6-character postal code.");
        return;
    }

    // FORMATTING STEP: Force the space (e.g., "M4K1J9" -> "M4K 1J9")
    // Nominatim API strictly requires the space for Canada
    var formattedQuery = raw.substring(0, 3) + " " + raw.substring(3);
    
    // Update the input box to show the pretty version
    document.getElementById('postal-code').value = formattedQuery;

    // 3. Call Nominatim API with the formatted query
    // We use the specific 'postalcode' parameter for better accuracy
    var url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${formattedQuery}&countrycodes=ca`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Success!
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                
                errorMsg.style.display = 'none';
                updateMapLocation(lat, lon);
            } else {
                // Failure
                errorMsg.innerText = "Postal code not found. Try a nearby one.";
                errorMsg.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error connecting to map service.");
        });
}

// 4. Update the Map Visuals
function updateMapLocation(lat, lon) {
    // A. Clear previous layers
    if (currentMarker) map.removeLayer(currentMarker);
    currentCircles.forEach(layer => map.removeLayer(layer));
    currentCircles = []; 

    // B. Add the Center Marker
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("<b>Your Location</b>").openPopup();

    // C. Draw 5 Walking Radius Circles
    // Speed: ~83 meters per minute
    // 5, 10, 15, 20, 25 minutes
    var minutes = [5, 10, 15, 20, 25];
    var colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107']; // Green to Yellowish

    // We create a "FeatureGroup" to hold all circles so we can zoom to them later
    var circleGroup = L.featureGroup();

    minutes.forEach((min, index) => {
        var radiusMeters = min * 83; // 5 mins * 83m = 415m
        
        var circle = L.circle([lat, lon], {
            color: colors[index],       
            fillColor: colors[index],   
            fillOpacity: 0.1,           
            weight: 2,                  // Thickness of the line
            radius: radiusMeters              
        }).addTo(map);

        // Add a text label (Tooltip) to the edge of the circle
        // We offset it slightly so it doesn't cover the line
        circle.bindTooltip(`${min} mins`, {
            permanent: true,      // Always visible
            direction: 'right',   // Text sits to the right
            className: 'circle-label', // We can style this in CSS if needed
            offset: [radiusMeters, 0] // Push label to the edge
        });

        circleGroup.addLayer(circle);
        currentCircles.push(circle);
    });

    // D. Zoom the map to fit the largest circle perfectly
    // This fixes your issue of the map not zooming in enough
    map.fitBounds(circleGroup.getBounds());
}

// 5. Bonus: Allow pressing "Enter" key to search
document.getElementById("postal-code").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchPostalCode();
    }
});
