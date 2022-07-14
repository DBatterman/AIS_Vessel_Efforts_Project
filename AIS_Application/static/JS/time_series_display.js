// CREATE MAP LAYER

d3.json("/get-data", function(error, data) {
    var dataset = JSON.parse(`${data}`)
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

        all.push(dataset[i]["Total"]);

        cargo.push(dataset[i]["Cargo"]);
        tanker.push(dataset[i]["Tanker"]);
        rec.push(dataset[i]["Recreational"]);
        tug.push(dataset[i]["TugTow"]);
        fish.push(dataset[i]["Fishing"]);
        unav.push(dataset[i]["Unavailable"]);
        pass.push(dataset[i]["Passenger"]);
        other.push(dataset[i]["Other"]);

        dates.push(dataset[i]["Date"])};
    console.log(dates);
    function calc_average(data) {
        var total = 0;
        for(var i = 0; i < data.length; i++) {
        total += data[i];
    }
        var avg = total / data.length;
        return avg;
    };

    var avgs = [calc_average(fish), calc_average(tug), calc_average(rec), calc_average(pass), calc_average(cargo), calc_average(tanker), calc_average(other), calc_average(unav)];

    var names = ["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable"];

    var ml_fish_X_LSTM = [];
    var ml_total_X_LSTM  = [];
    var ml_rec_X_LSTM  = [];
    var ml_tugtow_X_LSTM  = [];
    var ml_pass_X_LSTM  = [];
    var ml_cargo_X_LSTM  = [];
    var ml_tanker_X_LSTM  = [];
    var ml_other_X_LSTM  = [];

    var ml_fish_Y_LSTM  = [];
    var ml_total_Y_LSTM  = [];
    var ml_rec_Y_LSTM  = [];
    var ml_tugtow_Y_LSTM  = [];
    var ml_pass_Y_LSTM  = [];
    var ml_cargo_Y_LSTM  = [];
    var ml_tanker_Y_LSTM  = [];
    var ml_other_Y_LSTM  = [];

    d3.json("/get-latlon", function(error, data) {
        var latlon = data;
    
        var latlon0 = [(+latlon.Top_Bound + +latlon.Bottom_Bound)/2, (+latlon.Left_Bound + +latlon.Right_Bound)/2];
    
        var satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
        });
    
        if (((+latlon.Top_Bound - +latlon.Bottom_Bound) > .5) || (+latlon.Left_Bound - +latlon.Right_Bound) < -.5) {
            var zoom = 8;
        } else {
            var zoom = 10;
        }
    
        // DEFINE MAP AND SET CENTER TO SELECTED PORT
        var map = L.map("map1", {
            center: latlon0,
            zoom: zoom,
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

    d3.json("/get-metrics", function(error, data) {
        var metrics = data;
        console.log(metrics);


        if (latlon["Resolution"] == "YYYY-Q") {
            var resolution = "Quarterly (CY)";
            var interval = "quarters (CY)";
            var multiplier = 4;
        } else if (latlon["Resolution"] == "YYYY-mm") {
            var resolution = "Monthly";
            var interval = "months";
            var multiplier = 12;
        } else if (latlon["Resolution"] == "YYYY-mm-dd") {
            var resolution = "Daily";
            var interval = "days";
            var multiplier = 365;
        } else if (latlon["Resolution"] == "YYYY") {
            var resolution = "Yearly";
            var interval = "years";
            var multiplier = 1;}

        var divElement1 = document.getElementById("summary");

        var content1 = document.createTextNode(`The AIS data was captured for the defined area at a ${resolution} interval. Average changes were estimated for every ${multiplier} ${interval}. The following were the results of the search: `);
        var content2 = document.createTextNode(`All Vessels: Max of ${Math.max(...all)} vessels, increasing an average of ${(metrics["Total"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content3 = document.createTextNode(`Fishing Vessels: Max of ${Math.max(...fish)} vessels, increasing an average of ${(metrics["Fishing"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content4 = document.createTextNode(`Tug/Tow Vessels: Max of ${Math.max(...tug)} vessels, increasing an average of ${(metrics["TugTow"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content5 = document.createTextNode(`Recreational Vessels: Max of ${Math.max(...rec)} vessels, increasing an average of ${(metrics["Recreational"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content6 = document.createTextNode(`Passenger Vessels: Max of ${Math.max(...pass)} vessels, increasing an average of ${(metrics["Passenger"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content7 = document.createTextNode(`Cargo Vessels: Max of ${Math.max(...cargo)} vessels, increasing an average of ${(metrics["Cargo"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content8 = document.createTextNode(`Tanker Vessels: Max of ${Math.max(...tanker)} vessels, increasing an average of ${(metrics["Tanker"]["Slope"] * multiplier).toFixed(1)} vessels. `);
        var content9 = document.createTextNode(`Other Vessels: Max of ${Math.max(...other)} vessels, increasing an average of ${(metrics["Other"]["Slope"] * multiplier).toFixed(1)} vessels. `);

        divElement1.innerHTML = "";
        divElement1.appendChild(content1);
        divElement1.appendChild(content2);
        divElement1.appendChild(content3);
        divElement1.appendChild(content4);
        divElement1.appendChild(content5);
        divElement1.appendChild(content6);
        divElement1.appendChild(content7);
        divElement1.appendChild(content8);
        divElement1.appendChild(content9);


        
        
    

    d3.json("/get-lstm-total", function(error, data){
    var data_lstm = JSON.parse(`${data}`)
    for (i in data_lstm["index"]) {
        ml_total_X_LSTM.push(dates[data_lstm["index"][i]]);
    }
    for (var ind = 1; ind < 30; ind++){
        ml_total_X_LSTM.push(ind);
    }
    for (i in data_lstm["0"]) {
        ml_total_Y_LSTM.push(data_lstm["0"][i]);
    }

    d3.json("/get-lstm-fish", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_fish_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_fish_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_fish_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    d3.json("/get-lstm-tugtow", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_tugtow_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_tugtow_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_tugtow_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    d3.json("/get-lstm-rec", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_rec_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_rec_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_rec_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    d3.json("/get-lstm-pass", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_pass_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_pass_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_pass_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    d3.json("/get-lstm-cargo", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_cargo_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_cargo_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_cargo_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    d3.json("/get-lstm-tanker", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_tanker_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_tanker_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_tanker_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    d3.json("/get-lstm-other", function(error, data){
        var data_lstm = JSON.parse(`${data}`)
        for (i in data_lstm["index"]) {
            ml_other_X_LSTM.push(dates[data_lstm["index"][i]]);
        }
        for (var ind = 1; ind < 30; ind++){
            ml_other_X_LSTM.push(ind);
        }
        for (i in data_lstm["0"]) {
            ml_other_Y_LSTM.push(data_lstm["0"][i]);
        }
    

    var trace_all_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: all,
        mode: 'lines'
    }
    
    var trace_fish_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: fish,
        mode: 'lines'
    }

    var trace_tug_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: tug,
        mode: 'lines'
    }

    var trace_rec_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: rec,
        mode: 'lines'
    }

    var trace_pass_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: pass,
        mode: 'lines'
    }

    var trace_car_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: cargo,
        mode: 'lines'
    }

    var trace_tank_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: tanker,
        mode: 'lines'
    }

    var trace_other_LSTM  = {
        name: "Unique Vessels",
        x: dates,
        y: other,
        mode: 'lines'
    }

    var trace_unav = {
        name: "Unique Vessels",
        x: dates,
        y: unav,
        mode: 'lines'
    }

    layout_all_LSTM  = {
        title: "All Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        
            
    }

    layout_fish_LSTM  = {
        title: "Fishing Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        

    }

    layout_tug_LSTM  = {
        title: "Tug and Tow Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        

    }

    layout_rec_LSTM  = {
        title: "Recreational Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        

    }

    layout_pass_LSTM  = {
        title: "Passenger Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        

    }

    layout_car_LSTM  = {
        title: "Cargo Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        

    }

    layout_tank_LSTM  = {
        title: "Tanker Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE"
        

    }

    layout_other_LSTM  = {
        title: "Other Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
       
    }
    
    layout_unav_LSTM = {
        title: "Unavailable/Unidentified Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
       

    }

    var ml_fish_trace_LSTM = {
        name: "LSTM",
        x: ml_fish_X_LSTM,
        y: ml_fish_Y_LSTM
    };

    var ml_total_trace_LSTM = {
        name: "LSTM",
        x: ml_total_X_LSTM,
        y: ml_total_Y_LSTM
    };

    var ml_rec_trace_LSTM = {
        name: "LSTM",
        x: ml_rec_X_LSTM,
        y: ml_rec_Y_LSTM
    };

    var ml_tugtow_trace_LSTM = {
        name: "LSTM",
        x: ml_tugtow_X_LSTM,
        y: ml_tugtow_Y_LSTM
    };

    var ml_pass_trace_LSTM = {
        name: "LSTM",
        x: ml_pass_X_LSTM,
        y: ml_pass_Y_LSTM
    };

    var ml_cargo_trace_LSTM = {
        name: "LSTM",
        x: ml_cargo_X_LSTM,
        y: ml_cargo_Y_LSTM
    };

    var ml_tanker_trace_LSTM = {
        name: "LSTM",
        x: ml_tanker_X_LSTM,
        y: ml_tanker_Y_LSTM
    };

    var ml_other_trace_LSTM = {
        name: "LSTM",
        x: ml_other_X_LSTM,
        y: ml_other_Y_LSTM
    };

    Plotly.purge("All-Vessels");
    Plotly.newPlot("All-Vessels", [trace_all_LSTM , ml_total_trace_LSTM], layout_all_LSTM);
    Plotly.newPlot("Fishing-Vessels", [trace_fish_LSTM , ml_fish_trace_LSTM], layout_fish_LSTM);
    Plotly.newPlot("TugTow-Vessels", [trace_tug_LSTM , ml_tugtow_trace_LSTM], layout_tug_LSTM);
    Plotly.newPlot("Rec-Vessels", [trace_rec_LSTM , ml_rec_trace_LSTM], layout_rec_LSTM);
    Plotly.newPlot("Passenger-Vessels", [trace_pass_LSTM , ml_pass_trace_LSTM], layout_pass_LSTM);
    Plotly.newPlot("Cargo-Vessels", [trace_car_LSTM , ml_cargo_trace_LSTM], layout_car_LSTM);
    Plotly.newPlot("Tanker-Vessels", [trace_tank_LSTM , ml_tanker_trace_LSTM], layout_tank_LSTM);
    Plotly.newPlot("Other-Vessels", [trace_other_LSTM , ml_other_trace_LSTM], layout_other_LSTM);
})})})})})})})})})});

var trace_pie = {
    values: avgs,
    labels: names,
    type: "pie"
}
layout_pie = {
    title: "Vessel Type Distribution",
    autosize: true,
    margin: {t:50, b:30, l:10, r:10}
}
    
    // Plotly.newPlot("Unav-Vessels", [trace_unav], layout_unav);

    Plotly.newPlot("Pie-Chart", [trace_pie], layout_pie);
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



