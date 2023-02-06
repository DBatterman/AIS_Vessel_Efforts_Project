// CREATE MAP LAYER


d3.json("/get-data", function(error, data) {
    var dataset = JSON.parse(`${data}`);
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
        dates.push(dataset[i]["Date"])}

    function calc_average(data) {
        var total = 0;
        for(var i = 0; i < data.length; i++) {
        total += data[i];
    }
        var avg = total / data.length;
        return avg;
    };

    var avgs = [calc_average(fish), calc_average(tug), calc_average(rec), calc_average(pass), calc_average(cargo), calc_average(tanker), calc_average(other), calc_average(unav)];
    var avg_tot = [calc_average(all)]
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
        var searchname = latlon.Output_Name;
        document.getElementById("waterway").innerHTML = searchname;
        document.getElementById("disclaimer").innerHTML = "AIS data originates from MarineCadastre.gov. The AIS application to make this report was created by LT Buch.\n The data is read as individual points, not as tracklines. This means that there may be areas where fewer points are captured if vessels are transiting at high speeds. \nThe vessel efforts reflected in this report may not reflect how truly busy the waterway is. All vessels are accounted for only once per selected interval.\n Length and draft include all unique vessels operating over the range of dates included in the data (2018-2021)."
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
            var zoom = 12;
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
        var content = document.createTextNode(`Search Area: ${(+latlon.Top_Bound).toFixed(4)}N, ${(+latlon.Right_Bound).toFixed(4)}W; ${(+latlon.Bottom_Bound).toFixed(4)}N, ${(+latlon.Left_Bound).toFixed(4)}W`);
        divElement.innerHTML = "";
        divElement.appendChild(content);

    d3.json("/get-metrics", function(error, data) {
        var metrics = data;

        if (latlon["Resolution"] == "%Y-%m") {
            var resolution = "Monthly";
            var interval = "months";
            var multiplier = 12;
        } else if (latlon["Resolution"] == "%Y-%m-%d") {
            var resolution = "Daily";
            var interval = "days";
            var multiplier = 365;
        }

        var divElement1 = document.getElementById("summary");

        var content1 = document.createTextNode(`Unique vessels were enumerated for the defined area at a ${resolution} interval. The following were the results of the search: `);
        var content2 = document.createTextNode(`All Vessels: Max- ${Math.max(...all)}, Average- ${avg_tot[0].toFixed(0)}. `);
        var content3 = document.createTextNode(`Fishing Vessels: Max- ${Math.max(...fish)}, Average- ${avgs[0].toFixed(0)}. `);
        var content4 = document.createTextNode(`Tug/Tow Vessels: Max- ${Math.max(...tug)}, Average- ${avgs[1].toFixed(0)}. `);
        var content5 = document.createTextNode(`Recreational Vessels: Max- ${Math.max(...rec)}, Average- ${avgs[2].toFixed(0)}. `);
        var content6 = document.createTextNode(`Passenger Vessels: Max- ${Math.max(...pass)}, Average- ${avgs[3].toFixed(0)}. `);
        var content7 = document.createTextNode(`Cargo Vessels: Max- ${Math.max(...cargo)}, Average- ${avgs[4].toFixed(0)}. `);
        var content8 = document.createTextNode(`Tanker Vessels: Max- ${Math.max(...tanker)}, Average- ${avgs[5].toFixed(0)}. `);
        var content9 = document.createTextNode(`Other Vessels: Max- ${Math.max(...other)}, Average- ${avgs[6].toFixed(0)}. `);

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

    d3.json("/get-len", function(error, data) {
        var len = JSON.parse(data);

    d3.json("/get-dra", function(error, data) {
        var dra = JSON.parse(data);

    var len18_Y = [];
    var len18_X = [];

    for (let i = 0; i < Object.keys(len).length; i++) {
            len18_Y.push(len[i]["Len_Bin_Count"]);
            len18_X.push(len[i]["Len_Bin"]);
    }

    var dra18_Y = [];
    var dra18_X = [];
    
    for (let i = 0; i < Object.keys(dra).length; i++) {
            dra18_Y.push(dra[i]["Dra_Bin_Count"]);
            dra18_X.push(dra[i]["Dra_Bin"]);
    }

    var len18_trace = {
        type: 'bar',
        name: "Length",
        x: len18_X,
        y: len18_Y
    };
    
    var dra18_trace = {
        name: "Draft",
        x: dra18_X,
        y: dra18_Y,
        type: 'bar'
    };

    var trace_all = {
        name: "Unique Vessels",
        x: dates,
        y: all,
        mode: 'lines'
    };
    
    var trace_fish = {
        name: "Unique Vessels",
        x: dates,
        y: fish,
        mode: 'lines'
    };

    var trace_tug = {
        name: "Unique Vessels",
        x: dates,
        y: tug,
        mode: 'lines'
    };

    var trace_rec = {
        name: "Unique Vessels",
        x: dates,
        y: rec,
        mode: 'lines'
    };

    var trace_pass = {
        name: "Unique Vessels",
        x: dates,
        y: pass,
        mode: 'lines'
    };

    var trace_car = {
        name: "Unique Vessels",
        x: dates,
        y: cargo,
        mode: 'lines'
    };

    var trace_tank = {
        name: "Unique Vessels",
        x: dates,
        y: tanker,
        mode: 'lines'
    };

    var trace_other = {
        name: "Unique Vessels",
        x: dates,
        y: other,
        mode: 'lines'
    };

    var trace_unav = {
        name: "Unique Vessels",
        x: dates,
        y: unav,
        mode: 'lines'
    };
    
    var layout_len = {
        title: "Length Distribution of All Unique Vessels",
        xaxis: {type: "category", title: "Length (feet) Binned", autorange: true},
        yaxis: {title: "Number of Vessels"},
        // width: 1020,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        showlegend: true,
        barmode: 'group'
    };
    
    var layout_dra = {
        title: "Draft Distribution of All Unique Vessels",
        xaxis: {type: "category", title: "Draft (feet) Binned", autorange: true},
        yaxis: {title: "Number of Vessels"},
        // width: 1020,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        showlegend: true,
        barmode: 'group'
    };

    var layout_all = {
        title: "All Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Total"]["Slope"]}X + ${metrics["Total"]["Intercept"]}`,
            showarrow: false}]
            
    };

    var layout_fish = {
        title: "Fishing Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Fishing"]["Slope"]}X + ${metrics["Fishing"]["Intercept"]}`,
            showarrow: false}]

    };

    var layout_tug = {
        title: "Tug and Tow Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["TugTow"]["Slope"]}X + ${metrics["TugTow"]["Intercept"]}`,
            showarrow: false}]

    };

    var layout_rec = {
        title: "Recreational Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Recreational"]["Slope"]}X + ${metrics["Recreational"]["Intercept"]}`,
            showarrow: false}]

    };

    var layout_pass = {
        title: "Passenger Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Passenger"]["Slope"]}X + ${metrics["Passenger"]["Intercept"]}`,
            showarrow: false}]

    };

    var layout_car = {
        title: "Cargo Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Cargo"]["Slope"]}X + ${metrics["Cargo"]["Intercept"]}`,
            showarrow: false}]

    };

    var layout_tank = {
        title: "Tanker Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Tanker"]["Slope"]}X + ${metrics["Tanker"]["Intercept"]}`,
            showarrow: false}]

    };

    var layout_other = {
        title: "Other Vessels",
        xaxis: {type: "category", title: resolution},
        width: 560,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
        plot_bgcolor: "#CFD3E3",
        paper_bgcolor: "#EBEBEE",
        annotations:  [{
            xref: 'paper',
            yref: 'paper',
            x: 1.2,
            xanchor: 'right',
            y: 1.05,
            yanchor: 'bottom',
            text: `Trendline: Y=${metrics["Other"]["Slope"]}X + ${metrics["Other"]["Intercept"]}`,
            showarrow: false}]

    };
    
    var layout_unav = {
        title: "Unavailable/Unidentified Vessels",
        xaxis: {type: "category", title: resolution},
        width: 700,
        height: 450,
        margin: {t:70, b:100, l:40, r:40},
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

    };

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
    Plotly.newPlot("Vessel-Len", [len18_trace], layout_len);
    Plotly.newPlot("Vessel-Draft", [dra18_trace], layout_dra);



})})})})})})})})})})})});

var trace_pie = {
    values: avgs,
    labels: names,
    type: "pie"
};

var layout_pie = {
    title: "Average Vessel Presence In The Area",
    autosize: true,
    margin: {t:50, b:30, l:10, r:10}
};
    
    // Plotly.newPlot("Unav-Vessels", [trace_unav], layout_unav);

    Plotly.newPlot("Pie-Chart", [trace_pie], layout_pie);
});




