import pandas as pd
from flask import Response, url_for, Flask, flash, redirect, render_template, request, session, abort, send_from_directory, send_file, jsonify
import numpy as np
import psycopg2
import config2
# from scipy.stats import linregress
from sklearn.metrics import balanced_accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error,mean_squared_error, r2_score


password = config2.password

app = Flask(__name__, template_folder='templates', static_folder='static')

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
    Metrics=None
aisData = DataStore()

@app.route("/", methods=["GET", "POST"])
def homepage():
    aisJSON = None
    if request.method == "POST":
        data = request.get_json()
        print(data)

        connection = psycopg2.connect(
            user="postgres",
            password=password,
            host="127.0.0.1",
            port="5432",
            database="AIS_Project")

        cursor = connection.cursor()

        cursor.execute(f'''
        WITH location_search as (
            SELECT * FROM "ais_raw_data"
            WHERE ("LAT" BETWEEN {data["Bottom_Bound"]} AND {data["Top_Bound"]}) AND ("LON" BETWEEN {data["Left_Bound"]} AND {data["Right_Bound"]})),

            "convert_query" as (
            SELECT to_char("BaseDateTime", '{data["Resolution"]}') as "date", "MMSI", "VesselType"
            FROM "location_search"),

            "unique_search" as (
            SELECT DISTINCT("date", "MMSI", "VesselType") as "test", "date", "VesselType" FROM "convert_query"
            GROUP BY "test", "date", "VesselType")

        SELECT "date", "VesselType", Count("VesselType") 
        FROM unique_search
        GROUP BY "date", "VesselType"
        ORDER BY "date";
        ''')

        record = cursor.fetchall()
        data_df = pd.DataFrame(record, columns=["basedatetime", "vesseltype", "count"])
        data_df = data_df.set_index("basedatetime")

        unique_dates = []

        for x in data_df.index:
            if x not in unique_dates:
                unique_dates.append(x)

        AIS_df = pd.DataFrame(
            columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"],
            index=unique_dates)

        zero_data = np.zeros(shape=(len(AIS_df), len(AIS_df.columns)))

        AIS_df = pd.DataFrame(zero_data,
                              columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other",
                                       "Unavailable", "Total"], index=unique_dates)

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

        AIS_df.reset_index(inplace=True)
        AIS_df.rename(columns={'index': 'Date'}, inplace=True)

        print("No data in search area!")


## ML Linear Regression Model
        AIS_df.reset_index(inplace=True)

        print(AIS_df)

        types = ["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"]

        aisData.Index = jsonify(AIS_df.to_json(orient="index"))
        dataset = aisData.Index
        aisData.LatLon = jsonify(data)
        metrics = {}

        def ais_graphs():
            for boat_type in types:
                results = pd.DataFrame(columns=["Y_Pred", "X_Test"])
                y = AIS_df[boat_type]
                # Create our features
                X = AIS_df.drop(["Date", "Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"], axis=1)

                X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=1)

                model = LinearRegression()

                model.fit(X_train, y_train)

                y_pred = model.predict(X_test)

                MSE = mean_squared_error(y_true=y_test, y_pred=y_pred)
                MAE = mean_absolute_error(y_true=y_test, y_pred=y_pred)
                X_int = model.intercept_
                Slope = model.coef_
                R2 = r2_score(y_true=y_test, y_pred=y_pred)
                print(X_int)
                print(Slope[0])


                metrics[boat_type] = {"MSE": round(MSE, 3), "MAE": round(MAE, 3), "Slope": round(Slope[0], 3), "Intercept": round(X_int, 3), "r2": round(R2, 3)}

                results["Y_Pred"] = y_pred
                results["X_Test"] = X_test.reset_index(drop=True)
                results_sort = results.sort_values(by="X_Test").reset_index(drop=True)

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

        ais_graphs()
        aisData.Metrics = jsonify(metrics)
        return dataset
    else:
        return render_template("index.html")

@app.route("/results")
def result():
    return render_template("result.html")

@app.route("/time_series")
def time_series():
    return render_template("result1.html")

@app.route("/get-data")
def data():
    return aisData.Index

@app.route("/get-metrics")
def metrics():
    return aisData.Metrics

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
    # app.secret_key = 'testkey2'
    # app.config['SESSION_TYPE'] = 'sqlalchemy'
    app.run(debug=True)