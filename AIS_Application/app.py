import pandas as pd
from flask import Response, url_for, Flask, flash, redirect, render_template, request, session, abort, send_from_directory, send_file, jsonify
import json
import numpy as np
import psycopg2
import config2

password = config2.password

app = Flask(__name__, template_folder='templates', static_folder='static')

class DataStore():
    Index=None,
    LatLon=None
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
            columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable"],
            index=unique_dates)

        zero_data = np.zeros(shape=(len(AIS_df), len(AIS_df.columns)))

        AIS_df = pd.DataFrame(zero_data,
                              columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other",
                                       "Unavailable"], index=unique_dates)

        for index, row in enumerate(AIS_df.index):
            search_result = data_df.loc[row]
            for index, row in search_result.iterrows():
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

        if AIS_df.empty:
            print("No data in search area!")

        aisData.Index = jsonify(AIS_df.to_json(orient="index"))
        dataset = aisData.Index
        aisData.LatLon = jsonify(data)

        print(aisData.Index)
        return dataset
    else:
        return render_template("index.html")

@app.route("/results")
def result():
    return render_template("result.html")


@app.route("/get-data")
def data():
    return aisData.Index

@app.route("/get-latlon")
def location():
    return aisData.LatLon

if __name__ == '__main__':
    # app.secret_key = 'testkey2'
    # app.config['SESSION_TYPE'] = 'sqlalchemy'
    app.run(debug=True)