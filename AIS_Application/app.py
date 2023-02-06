### Import Dependencies
import pandas as pd
from flask import Flask, render_template, request, jsonify
import numpy as np
import sqlite3
from sklearn.linear_model import LinearRegression
from PyQt5.QtCore import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *
from PyQt5.QtPrintSupport import QPrinter, QPrintDialog
from threading import Timer as Tm
import sys

### Initiate APP
app = Flask(__name__, template_folder='templates', static_folder='static')

### Create Datastore independent of application routes
class DataStore():
    Index=None,
    LatLon=None,
    Fishing=None,
    TugTow=None,
    Recreational=None,
    Passenger=None,
    Cargo=None,
    Tanker=None,
    Other=None,
    Unavailable=None,
    Total=None,
    Metrics=None,
    Len=None,
    draft=None

### make Datastore callable
aisData = DataStore()

# set print value
class print_val():
    print_val = 0
print_val = print_val()

### Homepage Route
@app.route("/", methods=["GET", "POST"])

def homepage():

### If POST request is recieved from the HTML (on click of the submit), then execute the following:
    if request.method == "POST":

### Retrieve JSON Object from HTML with LAT/LON and date resolution pairs.
        data = request.get_json()

### Create connection to database
        out_db = "../ETL_Database/AIS_db.db"
# ../ETL_Database/


        connection = sqlite3.connect(out_db)

### Create cursor object for connection
        cursor1 = connection.cursor()


        cursor2 = connection.cursor()


        cursor3 = connection.cursor()



### Execute Query based on JSON Object received from the POST request
        cursor1.execute(f'''WITH location_search as (
                SELECT strftime("{data["Resolution"]}", BaseDateTime) as datestamp, MMSI, VesselType
                FROM ais_raw_data
                WHERE LAT > {data["Bottom_Bound"]} AND LAT < {data["Top_Bound"]} AND LON > {data["Left_Bound"]} AND LON < {data["Right_Bound"]}),
            
                unique_vessels as (
                SELECT DISTINCT datestamp, MMSI, VesselType
                FROM location_search)

                SELECT datestamp, VesselType, Count(VesselType)
                FROM unique_vessels
                GROUP BY VesselType, datestamp;
                ''')


        cursor2.execute(f'''
                WITH bin_val AS (
                SELECT DISTINCT MMSI, CAST((("length" * 3.28084)/25) AS INTEGER)*25 AS "len_bin"
                FROM ais_raw_data
                WHERE LAT > {data["Bottom_Bound"]} AND LAT < {data["Top_Bound"]} AND LON > {data["Left_Bound"]} AND LON < {data["Right_Bound"]}),

                
                unique_bin AS (SELECT DISTINCT MMSI, "len_bin"
                FROM bin_val
                WHERE "len_bin" >= 0)
                
                SELECT "len_bin", count("len_bin")
                FROM unique_bin
                GROUP BY "len_bin";
                ''')


        cursor3.execute(f'''
                WITH bin_val AS (
                SELECT DISTINCT MMSI, CAST((("Draft" * 3.28084)/2) AS INTEGER)*2 AS "dra_bin"
                FROM ais_raw_data
                WHERE LAT > {data["Bottom_Bound"]} AND LAT < {data["Top_Bound"]} AND LON > {data["Left_Bound"]} AND LON < {data["Right_Bound"]}),


                unique_bin AS (SELECT DISTINCT MMSI, "dra_bin"
                FROM bin_val
                WHERE "dra_bin" >= 0)

                SELECT "dra_bin", count("dra_bin")
                FROM unique_bin
                GROUP BY "dra_bin";
                ''')

### Request the resulting table from the database
        record_efforts = cursor1.fetchall()
        record_len = cursor2.fetchall()
        record_dr = cursor3.fetchall()

### Convert table to pandas Dataframe
        data_df = pd.DataFrame(record_efforts, columns=["basedatetime", "vesseltype", "count"])

        len_df = pd.DataFrame(record_len, columns=["Len_Bin", "Len_Bin_Count"])

        dra_df = pd.DataFrame(record_dr, columns=["Dra_Bin", "Dra_Bin_Count"])


### Set the index to the column BaseDateTime (all date intervals are unique based on search)
        data_df = data_df.set_index("basedatetime")

### Create empty array to store the date data (for labeling)
        unique_dates = []

### Process each date into the above array
        for x in data_df.index:
            if x not in unique_dates:
                unique_dates.append(x)

### Create empty dataframe for the AIS data, set index to the dates processed into the array
        AIS_df = pd.DataFrame(
            columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"],
            index=unique_dates)

### Create an array of zeros matching the shape of the AIS data recieved
        zero_data = np.zeros(shape=(len(AIS_df), len(AIS_df.columns)))

### Redefine AIS_df to include the zeros data from above
        AIS_df = pd.DataFrame(zero_data,
                              columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other",
                                       "Unavailable", "Total"], index=unique_dates)

### Populate AIS_df from the query, enumerating each category based on the vessel type
        for index, row in enumerate(AIS_df.index):
            search_result = data_df.loc[row]
            for index, row in search_result.iterrows():
                AIS_df.loc[index, "Total"] += row[1]
                if row[0] == 30:
                    AIS_df.loc[index, "Fishing"] += row[1]
                elif (row[0] == 31) or (row[0] == 32) or (row[0] == 52):
                    AIS_df.loc[index, "TugTow"] += row[1]
                elif (row[0] == 36) or (row[0] == 37):
                    AIS_df.loc[index, "Recreational"] += row[1]
                elif (row[0] >= 60) and (row[0] <= 69):
                    AIS_df.loc[index, "Passenger"] += row[1]
                elif (row[0] >= 70) and (row[0] <= 79):
                    AIS_df.loc[index, "Cargo"] += row[1]
                elif (row[0] >= 80) and (row[0] <= 89):
                    AIS_df.loc[index, "Tanker"] += row[1]
                elif (row[0] == 0):
                    AIS_df.loc[index, "Unavailable"] += row[1]
                else:
                    AIS_df.loc[index, "Other"] += row[1]


### Reset the index of the dataframe to include the dates as a column, rename as 'Date'
        AIS_df.sort_index(inplace=True)
        AIS_df.reset_index(inplace=True)
        AIS_df.rename(columns={'index': 'Date'}, inplace=True)

### Reset the index again to get a column counting each row (need integer for ML models, not dates)
        AIS_df.reset_index(inplace=True)

### Assign raw enumerated data to the DataStore
        aisData.Index = jsonify(AIS_df.to_json(orient="index"))



### Define vessel types as an array to loop through in the models
        types = ["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"]

### Create returnable object for route function
        dataset = aisData.Index

### Assign LAT/LON data to the Datastore
        aisData.LatLon = jsonify(data)

### create empty dictionary for the metrics from the LinearRegression model
        metrics = {}

### Define function to run LinearRegression model on all vessel types
        def ais_graphs():

    ### Loop through each vessel type
            for boat_type in types:
    ### Create empty database with columns for the predictions and test values
                results = pd.DataFrame(columns=["Y_Pred", "X_Test"])
    ### Define the y-axis data
                y = AIS_df[boat_type]
    ### Define the x-axis data
                X = AIS_df.drop(["Date", "Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"], axis=1)
    ### Call the model
                model = LinearRegression()
    ### Fit the model with the training data
                model.fit(X, y)
    ### Predict values based on the trained model
                y_pred = model.predict(X)
    ### Assign x-intercept for the model trendline
                X_int = model.intercept_
    ### Assign slope coefficient for the model trendline
                Slope = model.coef_
    ### Assign metrics to the dict created, round values to three decimal places
                metrics[boat_type] = {"Slope": round(Slope[0], 3), "Intercept": round(X_int, 3)}
    ### Assign values to dataframe created
                results["Y_Pred"] = y_pred
    ### Reset the index and drop the old column, to match test values to the predictions
                results["X_Test"] = X.reset_index(drop=True)
    ### Sort by the x-axis values, reset index to make this the new order
                results_sort = results.sort_values(by="X_Test").reset_index(drop=True)
    ### Push all results to the Datastore as a JSON Object
                if boat_type == "Fishing":
                    aisData.Fishing = jsonify(results_sort.to_json())
                elif boat_type == "TugTow":
                    aisData.TugTow = jsonify(results_sort.to_json())
                elif boat_type == "Recreational":
                    aisData.Recreational = jsonify(results_sort.to_json())
                elif boat_type == "Passenger":
                    aisData.Passenger = jsonify(results_sort.to_json())
                elif boat_type == "Cargo":
                    aisData.Cargo = jsonify(results_sort.to_json())
                elif boat_type == "Tanker":
                    aisData.Tanker = jsonify(results_sort.to_json())
                elif boat_type == "Other":
                    aisData.Other = jsonify(results_sort.to_json())
                elif boat_type == "Unavailable":
                    aisData.Unavailable = jsonify(results_sort.to_json())
                elif boat_type == "Total":
                    aisData.Total = jsonify(results_sort.to_json())

### Call LinearRegression Function
        ais_graphs()

### Assign output metrics dict to the DataStore
        aisData.Metrics = jsonify(metrics)
### Assign LEN DRAFT data to datastore
        aisData.Len = jsonify(len_df.to_json(orient="index"))
        aisData.draft = jsonify(dra_df.to_json(orient="index"))

        print_val.print_val = 1
        return dataset
    else:
        return render_template("index.html")

def ui(location):
    qt_app = QApplication(sys.argv)
    web = QWebEngineView()
    web.setWindowTitle("AIS QUERY")
    web.resize(1000, 600)
    web.setZoomFactor(.75)
    web.load(QUrl(location))
    web.show()

    def emit_pdf():
        web.show()
        if print_val.print_val == 1:
            f_name = QFileDialog.getSaveFileName()
            if ".pdf" not in f_name[0]:
                f_name1 = f"{f_name[0]}.pdf"
            else: f_name1 = f_name[0]
            print(f_name1)
            # printer = QPrinter(QPrinter.HighResolution)
            #
            # printer.setPageSize(QPrinter.Letter)
            #
            # printer.setOutputFormat(QPrinter.PdfFormat)
            #
            # printer.setOutputFileName(f_name1)
            #
            # printer.setFullPage(True)
            #
            # web.print_(printer)
            layout = QPageLayout()
            layout.setPageSize(QPageSize(QSizeF(8.5, 11), QPageSize.Unit.Inch, "4x6 in page", QPageSize.SizeMatchPolicy.ExactMatch))
            layout.setOrientation(QPageLayout.Portrait)

            QTimer.singleShot(1000, lambda: web.page().printToPdf(f_name1, pageLayout=layout))
            print_val.print_val = 0

    web.loadFinished.connect(emit_pdf)
    sys.exit(qt_app.exec_())

@app.route("/results")
def result():

    return render_template("result.html")

@app.route("/get-data")
def data():
    return aisData.Index

@app.route("/get-metrics")
def metrics():
    return aisData.Metrics

@app.route("/get-len")
def Len():
    return aisData.Len

@app.route("/get-dra")
def Dra():
    return aisData.draft

@app.route("/get-latlon")
def location():
    return aisData.LatLon

@app.route("/get-ml-fish")
def ml_fish():
    return aisData.Fishing

@app.route("/get-ml-tugtow")
def ml_tugtow():
    return aisData.TugTow

@app.route("/get-ml-rec")
def ml_rec():
    return aisData.Recreational

@app.route("/get-ml-pass")
def ml_pass():
    return aisData.Passenger

@app.route("/get-ml-cargo")
def ml_cargo():
    return aisData.Cargo

@app.route("/get-ml-tanker")
def ml_tanker():
    return aisData.Tanker

@app.route("/get-ml-other")
def ml_other():
    return aisData.Other

@app.route("/get-ml-total")
def ml_total():
    return aisData.Total

if __name__ == '__main__':
    # start sub-thread to open the browser.
    Tm(1,lambda: ui("http://127.0.0.1:5000/")).start()
    app.run(debug=False)