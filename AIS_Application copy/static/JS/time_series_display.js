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

    var ml_fish_X = [];
    var ml_total_X = [];
    var ml_rec_X = [];
    var ml_tugtow_X = [];
    var ml_pass_X = [];
    var ml_cargo_X = [];
    var ml_tanker_X = [];
    var ml_other_X = [];

    var ml_fish_Y = [];
    var ml_total_Y = [];
    var ml_rec_Y = [];
    var ml_tugtow_Y = [];
    var ml_pass_Y = [];
    var ml_cargo_Y = [];
    var ml_tanker_Y = [];
    var ml_other_Y = [];

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


        
        
    

    d3.json("/get-ml-total", function(error, data){
    var data_ml = JSON.parse(`${data}`)
    for (i in data_ml["X_Test"]) {
        ml_total_X.push(dates[data_ml["X_Test"][i]]);
    }
    for (i in data_ml["Y_Pred"]) {
        ml_total_Y.push(data_ml["Y_Pred"][i]);
    }

    d3.json("/get-ml-fish", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_fish_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_fish_Y.push(data_ml["Y_Pred"][i]);
        }
    

    d3.json("/get-ml-tugtow", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_tugtow_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_tugtow_Y.push(data_ml["Y_Pred"][i]);
        }
    

    d3.json("/get-ml-rec", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_rec_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_rec_Y.push(data_ml["Y_Pred"][i]);
        }
    

    d3.json("/get-ml-pass", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_pass_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_pass_Y.push(data_ml["Y_Pred"][i]);
        }
    

    d3.json("/get-ml-cargo", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_cargo_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_cargo_Y.push(data_ml["Y_Pred"][i]);
        }
    

    d3.json("/get-ml-tanker", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_tanker_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_tanker_Y.push(data_ml["Y_Pred"][i]);
        }
    

    d3.json("/get-ml-other", function(error, data){
        var data_ml = JSON.parse(`${data}`)
        for (i in data_ml["X_Test"]) {
            ml_other_X.push(dates[data_ml["X_Test"][i]]);
        }
        for (i in data_ml["Y_Pred"]) {
            ml_other_Y.push(data_ml["Y_Pred"][i]);
        }
    

    var trace_all = {
        name: "Unique Vessels",
        x: dates,
        y: all,
        mode: 'lines'
    }
    
    var trace_fish = {
        name: "Unique Vessels",
        x: dates,
        y: fish,
        mode: 'lines'
    }

    var trace_tug = {
        name: "Unique Vessels",
        x: dates,
        y: tug,
        mode: 'lines'
    }

    var trace_rec = {
        name: "Unique Vessels",
        x: dates,
        y: rec,
        mode: 'lines'
    }

    var trace_pass = {
        name: "Unique Vessels",
        x: dates,
        y: pass,
        mode: 'lines'
    }

    var trace_car = {
        name: "Unique Vessels",
        x: dates,
        y: cargo,
        mode: 'lines'
    }

    var trace_tank = {
        name: "Unique Vessels",
        x: dates,
        y: tanker,
        mode: 'lines'
    }

    var trace_other = {
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

    layout_all = {
        title: "All Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Total"]["Slope"]}X + ${metrics["Total"]["Intercept"]}, R2: ${metrics["Total"]["r2"]}, Mean-Squared Error: ${metrics["Total"]["MSE"]}, Mean-Absolute Error: ${metrics["Total"]["MAE"]}`,
            showarrow: false}]
            
    }

    layout_fish = {
        title: "Fishing Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Fishing"]["Slope"]}X + ${metrics["Fishing"]["Intercept"]}, R2: ${metrics["Fishing"]["r2"]}, Mean-Squared Error: ${metrics["Fishing"]["MSE"]}, Mean-Absolute Error: ${metrics["Fishing"]["MAE"]}`,
            showarrow: false}]

    }

    layout_tug = {
        title: "Tug and Tow Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["TugTow"]["Slope"]}X + ${metrics["TugTow"]["Intercept"]}, R2: ${metrics["TugTow"]["r2"]}, Mean-Squared Error: ${metrics["TugTow"]["MSE"]}, Mean-Absolute Error: ${metrics["TugTow"]["MAE"]}`,
            showarrow: false}]

    }

    layout_rec = {
        title: "Recreational Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Recreational"]["Slope"]}X + ${metrics["Recreational"]["Intercept"]}, R2: ${metrics["Recreational"]["r2"]}, Mean-Squared Error: ${metrics["Recreational"]["MSE"]}, Mean-Absolute Error: ${metrics["Recreational"]["MAE"]}`,
            showarrow: false}]

    }

    layout_pass = {
        title: "Passenger Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Passenger"]["Slope"]}X + ${metrics["Passenger"]["Intercept"]}, R2: ${metrics["Passenger"]["r2"]}, Mean-Squared Error: ${metrics["Passenger"]["MSE"]}, Mean-Absolute Error: ${metrics["Passenger"]["MAE"]}`,
            showarrow: false}]

    }

    layout_car = {
        title: "Cargo Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Cargo"]["Slope"]}X + ${metrics["Cargo"]["Intercept"]}, R2: ${metrics["Cargo"]["r2"]}, Mean-Squared Error: ${metrics["Cargo"]["MSE"]}, Mean-Absolute Error: ${metrics["Cargo"]["MAE"]}`,
            showarrow: false}]

    }

    layout_tank = {
        title: "Tanker Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Tanker"]["Slope"]}X + ${metrics["Tanker"]["Intercept"]}, R2: ${metrics["Tanker"]["r2"]}, Mean-Squared Error: ${metrics["Tanker"]["MSE"]}, Mean-Absolute Error: ${metrics["Tanker"]["MAE"]}`,
            showarrow: false}]

    }

    layout_other = {
        title: "Other Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations:  [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Y=${metrics["Other"]["Slope"]}X + ${metrics["Other"]["Intercept"]}, R2: ${metrics["Other"]["r2"]}, Mean-Squared Error: ${metrics["Other"]["MSE"]}, Mean-Absolute Error: ${metrics["Other"]["MAE"]}`,
            showarrow: false}]

    }
    
    layout_unav = {
        title: "Unavailable/Unidentified Vessels",
        xaxis: {type: "category", title: resolution},
        autosize: true,
        margin: {t:70, b:85, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Regression: Trendline: Y=${metrics["Unavailable"]["Slope"]}X + ${metrics["Unavailable"]["Intercept"]}`,
            showarrow: false}]

    }

    var ml_fish_trace = {
        name: "Trendline",
        x: ml_fish_X,
        y: ml_fish_Y
    };

    var ml_total_trace = {
        name: "Trendline",
        x: ml_total_X,
        y: ml_total_Y
    };

    var ml_rec_trace = {
        name: "Trendline",
        x: ml_rec_X,
        y: ml_rec_Y
    };

    var ml_tugtow_trace = {
        name: "Trendline",
        x: ml_tugtow_X,
        y: ml_tugtow_Y
    };

    var ml_pass_trace = {
        name: "Trendline",
        x: ml_pass_X,
        y: ml_pass_Y
    };

    var ml_cargo_trace = {
        name: "Trendline",
        x: ml_cargo_X,
        y: ml_cargo_Y
    };

    var ml_tanker_trace = {
        name: "Trendline",
        x: ml_tanker_X,
        y: ml_tanker_Y
    };

    var ml_other_trace = {
        name: "Trendline",
        x: ml_other_X,
        y: ml_other_Y
    };

    Plotly.newPlot("All-Vessels", [trace_all, ml_total_trace], layout_all);
    Plotly.newPlot("Fishing-Vessels", [trace_fish, ml_fish_trace], layout_fish);
    Plotly.newPlot("TugTow-Vessels", [trace_tug, ml_tugtow_trace], layout_tug);
    Plotly.newPlot("Rec-Vessels", [trace_rec, ml_rec_trace], layout_rec);
    Plotly.newPlot("Passenger-Vessels", [trace_pass, ml_pass_trace], layout_pass);
    Plotly.newPlot("Cargo-Vessels", [trace_car, ml_cargo_trace], layout_car);
    Plotly.newPlot("Tanker-Vessels", [trace_tank, ml_tanker_trace], layout_tank);
    Plotly.newPlot("Other-Vessels", [trace_other, ml_other_trace], layout_other);
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



