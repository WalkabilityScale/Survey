// 1. Initialize Map
var map = L.map('map').setView([43.6532, -79.3832], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Variables to store our map layers so we can clear them later
var currentMarker = null;
var currentCircles = [];

// 2. The Search Function
function searchPostalCode() {
    var input = document.getElementById('postal-code').value;
    var errorMsg = document.getElementById('error-message');

    // Basic cleaning: remove spaces, make uppercase
    var query = input.trim(); 
    
    if(query.length < 3) {
        alert("Please enter a valid postal code.");
        return;
    }

    // 3. Call the Nominatim API (Free Geocoding Service)
    // We limit results to Canada ('countrycodes=ca') to avoid confusion
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=ca`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Success! We found a location
                var lat = data[0].lat;
                var lon = data[0].lon;
                
                errorMsg.style.display = 'none';
                updateMapLocation(lat, lon);
            } else {
                // No results found
                errorMsg.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Something went wrong connecting to the map service.");
        });
}

// 4. Update the Map Visuals
function updateMapLocation(lat, lon) {
    // A. Center the map on the new location
    map.setView([lat, lon], 14);

    // B. Clear previous markers/circles if they exist
    if (currentMarker) map.removeLayer(currentMarker);
    currentCircles.forEach(circle => map.removeLayer(circle));
    currentCircles = []; // Reset the list

    // C. Add the new center marker (The user's home)
    currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("<b>Your Location</b>").openPopup();

    // D. Draw Walking Radius Circles
    // Speed assumption: 5km/h = ~83 meters per minute
    // 5 mins = 415m | 10 mins = 830m | 15 mins = 1245m
    var radii = [415, 830, 1245]; 
    var colors = ['green', 'yellow', 'red']; // Just to distinguish them

    radii.forEach((radius, index) => {
        var circle = L.circle([lat, lon], {
            color: colors[index],       // Border color
            fillColor: colors[index],   // Inner color
            fillOpacity: 0.1,           // Transparency (0.1 is very see-through)
            radius: radius              // Size in meters
        }).addTo(map);
        
        currentCircles.push(circle); // Save it so we can remove it later
    });
}
