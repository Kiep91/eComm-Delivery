// script.js – Game script with leaderboard and user info

// Initialise the Leaflet map
var map = L.map('map').setView([43.7, -79.4], 10);
// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
// Define static start/end (Toronto City Hall)
var startPoint = {lat: 43.6532, lng: -79.3832};
var startMarker = L.circleMarker([startPoint.lat, startPoint.lng], {
    radius: 8,
    color: 'black',
    fillColor: 'black',
    fillOpacity: 1
}).addTo(map).bindPopup('Start/End');
// Initialize route with start point
var userRoute = [startPoint];

// Points array
var points = [
    {"lat": 43.768884, "lng": -79.554684},
    {"lat": 43.751591, "lng": -79.404623},
    {"lat": 43.684114, "lng": -79.325101},
    {"lat": 43.651783, "lng": -79.189145},
    {"lat": 43.702255, "lng": -79.165027},
    {"lat": 43.680987, "lng": -79.385346},
    {"lat": 43.756760, "lng": -79.210611},
    {"lat": 43.660663, "lng": -79.482778},
    {"lat": 43.695319, "lng": -79.237737},
    {"lat": 43.716676, "lng": -79.353085},
    {"lat": 43.781623, "lng": -79.593681},
    {"lat": 43.700937, "lng": -79.276133},
    {"lat": 43.656368, "lng": -79.420529},
    {"lat": 43.751161, "lng": -79.228820},
    {"lat": 43.723674, "lng": -79.299331},
    {"lat": 43.650101, "lng": -79.599486},
    {"lat": 43.781949, "lng": -79.377890},
    {"lat": 43.796557, "lng": -79.209579},
    {"lat": 43.762043, "lng": -79.490240},
    {"lat": 43.780433, "lng": -79.453658},
    {"lat": 43.662030, "lng": -79.208288},
    {"lat": 43.745966, "lng": -79.514020},
    {"lat": 43.779768, "lng": -79.344620},
    {"lat": 43.736797, "lng": -79.492623},
    {"lat": 43.694429, "lng": -79.164607}
];
var markers = [];
var routeLine = null;

points.forEach(function(pt) {
    var marker = L.marker([pt.lat, pt.lng]).addTo(map);
    marker.on('click', function() {
        if (userRoute.indexOf(pt) === -1) {
            userRoute.push(pt);
            updateRoute();
        }
    });
    markers.push(marker);
});

function updateRoute() {
    if (routeLine) map.removeLayer(routeLine);
    var latlngs = [];
    userRoute.forEach(function(pt) { latlngs.push([pt.lat, pt.lng]); });
        // Loop back to start when all locations selected
        if ((userRoute.length - 1) === points.length) {
            latlngs.push([startPoint.lat, startPoint.lng]);
        }
    if (latlngs.length > 0) routeLine = L.polyline(latlngs, {color: 'blue'}).addTo(map);
}

function calculateDistance(route) {
    var distance = 0;
    for (var i = 0; i < route.length - 1; i++) {
        var a = L.latLng(route[i].lat, route[i].lng);
        var b = L.latLng(route[i+1].lat, route[i+1].lng);
        distance += a.distanceTo(b);
    }
    return distance;
}
function calcScore(distance) {
    return (distance > 0) ? Math.max(0, Math.floor(10000 / distance)) : 0;
}
function updateScoreDisplay(score) {
    document.getElementById('score').innerText = 'Score: ' + score;
}
function updateLeaderboardDisplay() {
    var lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    var list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    lb.forEach(function(entry) {
        var li = document.createElement('li');
        li.textContent = entry.name + ' (' + entry.phone + '): ' + entry.score;
        list.appendChild(li);
    });
}
function saveToLeaderboard(name, phone, score) {
    var lb = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    lb.push({name: name, phone: phone, score: score});
    lb.sort(function(a, b) {return b.score - a.score;});
    if (lb.length > 10) lb = lb.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(lb));
    updateLeaderboardDisplay();
}
// On load, show leaderboard
document.addEventListener('DOMContentLoaded', function() {
    updateLeaderboardDisplay();
});
// Finish button
document.getElementById('finishBtn').addEventListener('click', function() {
    if (userRoute.length < points.length) {
        alert('Please select all ' + points.length + ' locations before scoring. Selected: ' + userRoute.length);
        return;
    }
    var dist = calculateDistance(userRoute);
    var score = calcScore(dist);
    updateScoreDisplay(score);
    alert('Total distance: ' + Math.floor(dist) + ' meters. Score: ' + score);
    var name = prompt('Enter your name:');
    if (!name) return;
    var phone = prompt('Enter your cellphone number:');
    if (!phone) return;
    saveToLeaderboard(name, phone, score);
});
// Reset button
document.getElementById('resetBtn').addEventListener('click', function() {
    userRoute = [];
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    updateScoreDisplay(0);
});