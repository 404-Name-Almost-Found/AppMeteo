// Initialize the map
const map = L.map('map').setView([45.4064, 11.8768], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

/*
// Add a marker
// il marker ha la priorità sulla posizione iniziale della mappa
*/
const marker = L.marker([45.4064, 11.8768]).addTo(map);


let circle = L.circle([45.4064, 11.8768], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);