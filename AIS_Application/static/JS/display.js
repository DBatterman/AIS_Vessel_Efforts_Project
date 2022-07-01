// CREATE MAP LAYER
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

let lat1 = latlon1.lat;
let long1 = latlon1.lng;
let lat2 = latlon2.lat;
let long2 = latlon2.lng;
let centerlat = (lat1 +lat2) / 2; 
let centerlong = (long1 +long2) / 2; 

var map = L.map("map", {
    center: [centerlat, centerlong],
    zoom: 8,
    layers: [satelliteStreets]
});