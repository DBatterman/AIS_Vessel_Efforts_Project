// CREATE LOADING BUTTON
const theButton = document.querySelector(".button");

theButton.addEventListener("click", () => {
    theButton.classList.add("button--loading");
});

// CREATE MAP LAYER
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

// DEFINE MAP AND SET CENTER TO SELECTED PORT
var map = L.map("map", {
    center: [37.75, -122.3],
    zoom: 5,
    layers: [satelliteStreets]
});

// SET MARKERS AND DRAG FUNCTIONS
var marker1 = L.marker([42, -125.1], {
    draggable: true,
    title: "1st"
    }).addTo(map);

var marker = L.marker([32.5, -116.7], {
    draggable: true,
    title: "2nd"
    }).addTo(map);

var searchExtentSF = L.rectangle([[42, -125.1], [32.5, -116.7]], {color: "blue", weight: 1.5, fill: false}).addTo(map);

var latlon1 = {lat: 42, lng: -125.1};
var latlon2 = {lat: 32.5, lng: -116.7};

var dragger1 = 0;
var dragger2 = 0;

// SET INITIAL LAT/LON PAIRS FOR THE SEARCH, AND SET LISTENER TO LOOK FOR MARKER MOVES


marker.on('dragend', function (e) {
    latlon2 = e.target._latlng;

    if (+latlon1.lat >= +latlon2.lat) {
        var topBound = +latlon1.lat;
        var bottomBound = +latlon2.lat;
    } else {
        var topBound = +latlon2.lat;
        var bottomBound = +latlon1.lat;
    }
    if (+latlon1.lng <= +latlon2.lng) {
        var leftBound = +latlon1.lng;
        var rightBound = +latlon2.lng;
    } else {
        var leftBound = +latlon2.lng;
        var rightBound = +latlon1.lng;
    }

    map.eachLayer(layer => {
        if (layer._bounds !== 'undefined' && Object.keys(layer).length == 15) {
            map.removeLayer(layer);
        }
        var searchArea = L.rectangle([latlon1, latlon2], {color: "red", weight: 2, fill: false});
        var searchExtentSF = L.rectangle([[42, -125.1], [32.5, -116.7]], {color: "blue", weight: 1.5, fill: false});
        searchArea.addTo(map);
        searchExtentSF.addTo(map);
});
    
    document.latlon.topbound.value = topBound.toFixed(4);
    document.latlon.bottombound.value = bottomBound.toFixed(4);
    document.latlon.leftbound.value = leftBound.toFixed(4);
    document.latlon.rightbound.value = rightBound.toFixed(4);
    return latlon2;
});

marker1.on('dragend', function (e) {
    latlon1 = e.target._latlng;

    if (+latlon1.lat >= +latlon2.lat) {
        var topBound = +latlon1.lat;
        var bottomBound = +latlon2.lat;
    } else {
        var topBound = +latlon2.lat;
        var bottomBound = +latlon1.lat;
    }
    if (+latlon1.lng <= +latlon2.lng) {
        var leftBound = +latlon1.lng;
        var rightBound = +latlon2.lng;
    } else {
        var leftBound = +latlon2.lng;
        var rightBound = +latlon1.lng;
    }

    map.eachLayer(layer => {
        if (layer._bounds !== 'undefined' && Object.keys(layer).length == 15) {
            map.removeLayer(layer);
        }
        var searchArea = L.rectangle([latlon1, latlon2], {color: "red", weight: 2, fill: false});
        var searchExtentSF = L.rectangle([[42.036, -125.108], [32.513, -116.693]], {color: "blue", weight: 1.5, fill: false});
        searchArea.addTo(map);
        searchExtentSF.addTo(map);
        
});

    document.latlon.topbound.value = topBound.toFixed(4);
    document.latlon.bottombound.value = bottomBound.toFixed(4);
    document.latlon.leftbound.value = leftBound.toFixed(4);
    document.latlon.rightbound.value = rightBound.toFixed(4);
    return latlon1;
});



// DEFINE FUNCTION FOR DATA SEARCH
// function getDateRange() {

//     // DEFINE AND COLLECT DATE ELEMENTS FOR SEARCH
//     var uniqueArray = {MMSI: [], VesselType: []};
//     var dateStart = d3.select("#date_start").property("value");
//     var dateEnd = d3.select("#date_end").property("value");
//     startDate = new Date(dateStart);
//     endDate = new Date(dateEnd);
//     dateBase = "1/1/2021";
//     baseDate = new Date(dateBase);
//         // // FINAL CALCS USING DATE ELEMENTS FOR JULIAN DATE
//     dayStart = Math.round(Math.abs((startDate.getTime()) - (baseDate.getTime()))/86400000 + 1);
//     dayEnd = Math.round(Math.abs((endDate.getTime()) - (baseDate.getTime()))/86400000 + 1);
//     console.log(dayStart);
//     console.log(dayEnd);

//     // DEFINE INITIAL LAT/LON OF SEARCH
    

// }

function init() {
    var divElement1 = document.getElementById("status-update");
    var divElement2 = document.getElementById("search-desc");
    var divElement3 = document.getElementById("area-desc");

    var content1 = document.createTextNode("Please press 'submit' once the desired search area appears on the map.");
    var content2 = document.createTextNode("The red box defines the search area.");
    var content3 = document.createTextNode("The blue box defines the search extent. This is the area limit to the data.");

    divElement1.innerHTML = "";
    divElement2.innerHTML = "";
    divElement3.innerHTML = "";

    divElement1.appendChild(content1);
    divElement2.appendChild(content2);
    divElement3.appendChild(content3);

    

    

    // var bottom = document.getElementById("bottom-bound");
    // var left = document.getElementById("left-bound");
    // var right = document.getElementById("right-bound");

    // var top_content = document.createTextNode(`${topBound}`);
    // var bottom_content = document.createTextNode(`${bottomBound}`);
    // var left_content = document.createTextNode(`${leftBound}`);
    // var right_content = document.createTextNode(`${rightBound}`);

    // top.innerHTML = "";
    // bottom.innerHTML = "";
    // left.innerHTML = "";
    // right.innerHTML = "";

    // top.appendChild(top_content);
    // bottom.appendChild(bottom_content);
    // left.appendChild(left_content);
    // right.appendChild(right_content);
};

// d3.selectAll("#search_input").on("click", getDateRange);
init();



