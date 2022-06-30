// CREATE MAP LAYER



d3.json("/get-data", function(error, data) {
    var dataset = JSON.parse(`${data}`)
    console.log(dataset);

    var tanker = [];
    var rec = [];
    var pass = [];
    var tug = [];
    var other = [];
    var unav = [];
    var fish = [];
    var cargo = [];
    var dates = [];
    var all = [];
   
    for (i in dataset) {

        all.push((dataset[i]["Cargo"] + dataset[i]["Tanker"] + dataset[i]["Recreational"] + dataset[i]["TugTow"] + dataset[i]["Fishing"] + dataset[i]["Unavailable"] + dataset[i]["Passenger"] + dataset[i]["Other"]));

        cargo.push(dataset[i]["Cargo"]);
        tanker.push(dataset[i]["Tanker"]);
        rec.push(dataset[i]["Recreational"]);
        tug.push(dataset[i]["TugTow"]);
        fish.push(dataset[i]["Fishing"]);
        unav.push(dataset[i]["Unavailable"]);
        pass.push(dataset[i]["Passenger"]);
        other.push(dataset[i]["Other"]);

        dates.push(dataset[i]["index"])};
    
    function calc_average(data) {
        var total = 0;
        for(var i = 0; i < data.length; i++) {
        total += data[i];
    }
        var avg = total / data.length;
        return avg;
    };

    var avgs = [calc_average(fish), calc_average(tug), calc_average(rec), calc_average(pass), calc_average(cargo), calc_average(tanker), calc_average(other), calc_average(unav)];
    console.log(avgs);

    var names = ["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable"];
    
    var trace_pie = {
        values: avgs,
        labels: names,
        type: "pie"
    }

    var trace_all = {
        x: dates,
        y: all,
        type: 'line'
    }

    var trace_fish = {
        x: dates,
        y: fish,
        type: 'line'
    }

    var trace_tug = {
        x: dates,
        y: tug,
        type: 'line'
    }

    var trace_rec = {
        x: dates,
        y: rec,
        type: 'line'
    }

    var trace_pass = {
        x: dates,
        y: pass,
        type: 'line'
    }

    var trace_car = {
        x: dates,
        y: cargo,
        type: 'line'
    }

    var trace_tank = {
        x: dates,
        y: tanker,
        type: 'line'
    }

    var trace_other = {
        x: dates,
        y: other,
        type: 'line'
    }

    var trace_unav = {
        x: dates,
        y: unav,
        type: 'line'
    }

    layout_pie = {
        title: "Vessel Type Distribution",
        autosize: true,
        margin: {t:50, b:30, l:10, r:10}
    }

    layout_all = {
        title: "All Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
    }

    layout_fish = {
        title: "Fishing Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    layout_tug = {
        title: "Tug and Tow Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    layout_rec = {
        title: "Recreational Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    layout_pass = {
        title: "Passenger Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    layout_car = {
        title: "Cargo Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    layout_tank = {
        title: "Tanker Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    layout_other = {
        title: "Other Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }
    
    layout_unav = {
        title: "Unavailable/Unidentified Vessels",
        xaxis: {type: "category"},
        autosize: true,
        margin: {t:70, b:60, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",

    }

    Plotly.newPlot("All-Vessels", [trace_all], layout_all);
    Plotly.newPlot("Fishing-Vessels", [trace_fish], layout_fish);
    Plotly.newPlot("TugTow-Vessels", [trace_tug], layout_tug);
    Plotly.newPlot("Rec-Vessels", [trace_rec], layout_rec);
    Plotly.newPlot("Passenger-Vessels", [trace_pass], layout_pass);
    Plotly.newPlot("Cargo-Vessels", [trace_car], layout_car);
    Plotly.newPlot("Tanker-Vessels", [trace_tank], layout_tank);
    Plotly.newPlot("Other-Vessels", [trace_other], layout_other);
    // Plotly.newPlot("Unav-Vessels", [trace_unav], layout_unav);

    Plotly.newPlot("Pie-Chart", [trace_pie], layout_pie);
});

d3.json("/get-latlon", function(error, data) {
    var latlon = data;
    console.log(latlon);

    var latlon0 = [(+latlon.Top_Bound + +latlon.Bottom_Bound)/2, (+latlon.Left_Bound + +latlon.Right_Bound)/2];
    console.log(latlon0)

    var satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
    });

    // DEFINE MAP AND SET CENTER TO SELECTED PORT
    var map = L.map("map1", {
        center: latlon0,
        zoom: 9.5,
        layers: [satelliteStreets]
    });

    var latlon1 = [+latlon.Bottom_Bound, +latlon.Left_Bound];
    var latlon2 = [+latlon.Top_Bound, +latlon.Right_Bound];

    var searchArea = L.rectangle([latlon1, latlon2], {color: "red", weight: 2, fill: false});

    searchArea.addTo(map);

    var divElement = document.getElementById("bounds");
    var content = document.createTextNode(`The search area was bound by: ${(+latlon.Top_Bound).toFixed(4)}N, ${(+latlon.Right_Bound).toFixed(4)}W; ${(+latlon.Bottom_Bound).toFixed(4)}N, ${(+latlon.Left_Bound).toFixed(4)}W`);
    divElement.innerHTML = "";
    divElement.appendChild(content);

});





// function init() {
//     var divElement1 = document.getElementById("status-update");
//     var divElement2 = document.getElementById("search-desc");
//     var divElement3 = document.getElementById("area-desc");

//     var content1 = document.createTextNode("Please press 'submit' once the desired search area appears on the map.");
//     var content2 = document.createTextNode("The red box defines the search area. It appears after both markers have been moved.");
//     var content3 = document.createTextNode("The blue box defines the search extent. This is the area limit to the data.");

//     divElement1.innerHTML = "";
//     divElement2.innerHTML = "";
//     divElement3.innerHTML = "";

//     divElement1.appendChild(content1);
//     divElement2.appendChild(content2);
//     divElement3.appendChild(content3);

//     if (latlon1.lat >= latlon2.lat) {
//         var topBound = latlon1.lat;
//         var bottomBound = latlon2.lat;
//     } else {
//         var topBound = latlon2.lat;
//         var bottomBound = latlon1.lat;
//     }
//     if (latlon1.lng <= latlon2.lng) {
//         var leftBound = latlon1.lng;
//         var rightBound = latlon2.lng;
//     } else {
//         var leftBound = latlon2.lng;
//         var rightBound = latlon1.lng;
//     }

//     document.latlon.topbound.value = topBound;
//     document.latlon.bottombound.value = bottomBound;
//     document.latlon.leftbound.value = leftBound;
//     document.latlon.rightbound.value = rightBound;

//     // var bottom = document.getElementById("bottom-bound");
//     // var left = document.getElementById("left-bound");
//     // var right = document.getElementById("right-bound");

//     // var top_content = document.createTextNode(`${topBound}`);
//     // var bottom_content = document.createTextNode(`${bottomBound}`);
//     // var left_content = document.createTextNode(`${leftBound}`);
//     // var right_content = document.createTextNode(`${rightBound}`);

//     // top.innerHTML = "";
//     // bottom.innerHTML = "";
//     // left.innerHTML = "";
//     // right.innerHTML = "";

//     // top.appendChild(top_content);
//     // bottom.appendChild(bottom_content);
//     // left.appendChild(left_content);
//     // right.appendChild(right_content);
// };

// // d3.selectAll("#search_input").on("click", getDateRange);



