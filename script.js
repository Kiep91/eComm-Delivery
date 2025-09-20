// script.js – Game script with leaderboard and user info

// Initialise the Leaflet map
var map = L.map('map').setView([43.727203, -79.381752], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

// Define static start/end (Toronto City Hall)
var startPoint = {lat: 43.727203, lng: -79.381752};
var startMarker = L.circleMarker([startPoint.lat, startPoint.lng], { radius: 8, color: 'black', fillColor: 'black', fillOpacity: 1 }).addTo(map).bindPopup('Start/End');

// Initialize route with start point
var userRoute = [startPoint];

// Points array
var points = [
 {"lat": 43.768884, "lng": -79.554684},
 {"lat": 43.751591, "lng": -79.404623},
 {"lat": 43.684114, "lng": -79.325101},
 {"lat": 43.673929, "lng": -79.499577},
 {"lat": 43.685487, "lng": -79.450476},
 {"lat": 43.680987, "lng": -79.385346},
 {"lat": 43.748669, "lng": -79.277504},
 {"lat": 43.660663, "lng": -79.482778},
 {"lat": 43.636249, "lng": -79.438274},
 {"lat": 43.716676, "lng": -79.353085},
 {"lat": 43.781623, "lng": -79.593681},
 {"lat": 43.700937, "lng": -79.276133},
 {"lat": 43.656368, "lng": -79.420529},
 {"lat": 43.714991, "lng": -79.328372},
 {"lat": 43.723674, "lng": -79.299331},
 {"lat": 43.702835, "lng": -79.447073},
 {"lat": 43.781949, "lng": -79.37789},
 {"lat": 43.752691, "lng": -79.320613},
 {"lat": 43.762043, "lng": -79.49024},
 {"lat": 43.780433, "lng": -79.453658},
 {"lat": 43.747105, "lng": -79.368664},
 {"lat": 43.745966, "lng": -79.51402},
 {"lat": 43.779768, "lng": -79.34462},
 {"lat": 43.736797, "lng": -79.492623},
 {"lat": 43.713981, "lng": -79.406536}
];

// Create markers with numbers and auto-finish when all selected
// Helper to create numbered icons with optional grey when selected
function createNumberIcon(index, selected) {
    var background = selected ? '#888' : '#2A81CB';
    var html = '<div style="background: ' + background + '; color: white; border-radius: 12px; width: 24px; height: 24px; text-align: center; line-height: 24px;">' + (index + 1) + '</div>';
    return L.divIcon({ className: 'number-icon', html: html, iconSize: [24, 24], iconAnchor: [12, 24] });
}

var markers = [];
var routeLine = null;
points.forEach(function(pt, index) {
    var icon = createNumberIcon(index, false);
    var marker = L.marker([pt.lat, pt.lng], {icon: icon}).addTo(map);
    marker.on('click', function() {
        if (userRoute.indexOf(pt) === -1) {
            userRoute.push(pt);
            updateRoute();
            marker.setIcon(createNumberIcon(index, true));
            if ((userRoute.length - 1) === points.length) { finishGame(); }
        }
    });
    markers.push(marker);
});

// Redraw the route line
function updateRoute() {
    if (routeLine) { map.removeLayer(routeLine); }
    var latlngs = [];
    userRoute.forEach(function(pt) { latlngs.push([pt.lat, pt.lng]); });
    if ((userRoute.length - 1) === points.length) {
        latlngs.push([startPoint.lat, startPoint.lng]);
    }
    if (latlngs.length > 0) routeLine = L.polyline(latlngs, { color: "blue" }).addTo(map);
}

// Calculate total distance of the route (in metres)
function calculateDistance(route) {
    var distance = 0;
    for (var i = 0; i < route.length - 1; i++) {
        var a = L.latLng(route[i].lat, route[i].lng);
        var b = L.latLng(route[i+1].lat, route[i+1].lng);
        distance += a.distanceTo(b);
    }
    return distance;
}

// Score equals total distance in km, rounded to two decimals
function calcScore(distance) {
    var distanceKm = distance / 1000.0;
    return Math.round(distanceKm * 100) / 100;
}

// Update the score display
function updateScoreDisplay(score) {
    document.getElementById('score').innerText = 'Score: ' + score;
}

// Leaderboard handling
function updateLeaderboardDisplay() {
    var lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    var list = document.getElementById('leaderboardList');
    list.innerHTML = "";
    lb.forEach(function(entry) {
        var li = document.createElement('li');
        li.textContent = entry.name + " (" + entry.phone + "): " + entry.score;
        list.appendChild(li);
    });
}
function saveToLeaderboard(name, phone, score) {
    var lb = JSON.parse(localStorage.getItem('leaderboard') || "[]");
    lb.push({ name: name, phone: phone, score: score });
    lb.sort(function(a, b) { return a.score - b.score; });
    if (lb.length > 10) { lb = lb.slice(0, 10); }
    localStorage.setItem('leaderboard', JSON.stringify(lb));
    updateLeaderboardDisplay();
}

// Finish the game: calculate distance/score and prompt user
function finishGame() {
    var dist  = calculateDistance(userRoute);
    var score = calcScore(dist);
    updateScoreDisplay(score);
    alert('Total distance: ' + Math.floor(dist) + ' meters. Score: ' + score);
    var name  = prompt('Enter your name:');
    if (!name) { return; }
    var phone = prompt('Enter your cellphone number:');
    if (!phone) { return; }
    saveToLeaderboard(name, phone, score);
}

// Update leaderboard on load
document.addEventListener('DOMContentLoaded', function() { updateLeaderboardDisplay(); });

// Finish button triggers same finishGame()
document.getElementById('finishBtn').addEventListener('click', function() { finishGame(); });

// Reset button: clears route and score
document.getElementById('resetBtn').addEventListener('click', function() { userRoute = [startPoint]; if (routeLine) { map.removeLayer(routeLine); routeLine = null; } updateScoreDisplay(0); updateRoute(); });