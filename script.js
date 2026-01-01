// 1. Initialize the map and set its view to Toronto coordinates
// Coordinates: [Latitude, Longitude], Zoom Level (13 is good for city view)
var map = L.map('map').setView([43.6532, -79.3832], 13);

// 2. Add a "Tile Layer" (The background map images)
// We are using OpenStreetMap because it is free and open-source.
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 3. Optional: Add a test marker to ensure it works
var marker = L.marker([43.6532, -79.3832]).addTo(map);
marker.bindPopup("<b>Hello Toronto!</b><br>Stage 1 Complete.").openPopup();
