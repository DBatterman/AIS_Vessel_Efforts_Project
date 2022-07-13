### Import Dependencies
import pandas as pd
from flask import Response, url_for, Flask, flash, redirect, render_template, request, session, abort, jsonify
import numpy as np
import psycopg2
import config2
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error,mean_squared_error, r2_score



### Call Password File
password = config2.password

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
    Metrics=None
    # LSTM_Fishing = None,
    # LSTM_TugTow = None,
    # LSTM_Recreational = None,
    # LSTM_Passenger = None,
    # LSTM_Cargo = None,
    # LSTM_Tanker = None,
    # LSTM_Other = None,
    # LSTM_Unavailable = None,
    # LSTM_Total = None

### make Datastore callable
aisData = DataStore()

### Homepage Route
@app.route("/", methods=["GET", "POST"])

def homepage():

### If POST request is recieved from the HTML (on click of the submit), then execute the following:
    if request.method == "POST":

### Retrieve JSON Object from HTML with LAT/LON and date resolution pairs.
        data = request.get_json()

### Create connection to database
        connection = psycopg2.connect(
            database="postgres",
            user="postgres",
            password=password,
            host="aisdb.c6lmgfjuy49v.us-west-1.rds.amazonaws.com",
            port="5432")

### Create cursor object for connection
        cursor = connection.cursor()

### Execute Query based on JSON Object received from the POST request
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

### Request the resulting table from the database
        record = cursor.fetchall()

### Convert table to pandas Dataframe
        data_df = pd.DataFrame(record, columns=["basedatetime", "vesseltype", "count"])

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
        AIS_df.reset_index(inplace=True)
        AIS_df.rename(columns={'index': 'Date'}, inplace=True)

### Reset the index again to get a column counting each row (need integer for ML models, not dates)
        AIS_df.reset_index(inplace=True)

### Define vessel types as an array to loop through in the models
        types = ["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"]

### Assign raw enumerated data to the DataStore
        aisData.Index = jsonify(AIS_df.to_json(orient="index"))

### Create returnable object for route function
        dataset = aisData.Index

### Assign LAT/LON data to the Datastore
        aisData.LatLon = jsonify(data)

### create empty dictionary for the metrics from the LinearRegression model
        metrics = {}

# ### Create empty dataframe for LSTM results
#         train_test_df = pd.DataFrame()

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
    ### Randomly sample test, train datasets for the model
                X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=1)
    ### Call the model
                model = LinearRegression()
    ### Fit the model with the training data
                model.fit(X_train, y_train)
    ### Predict values based on the trained model
                y_pred = model.predict(X_test)
    ### Assign root mean squared error
                MSE = mean_squared_error(y_true=y_test, y_pred=y_pred)
    ### Assign mean absolute error
                MAE = mean_absolute_error(y_true=y_test, y_pred=y_pred)
    ### Assign x-intercept for the model trendline
                X_int = model.intercept_
    ### Assign slope coefficient for the model trendline
                Slope = model.coef_
    ### Assign R2 value for the model
                R2 = r2_score(y_true=y_test, y_pred=y_pred)
    ### Assign metrics to the dict created, round values to three decimal places
                metrics[boat_type] = {"MSE": round(MSE, 3), "MAE": round(MAE, 3), "Slope": round(Slope[0], 3), "Intercept": round(X_int, 3), "r2": round(R2, 3)}

    ### Assign values to dataframe created
                results["Y_Pred"] = y_pred
    ### Reset the index and drop the old column, to match test values to the predictions
                results["X_Test"] = X_test.reset_index(drop=True)
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



### Define the LSTM Function

# #### ADD DANNY's FULL STYLE, ADD DATASTORE FOR EACH, ROUTE FOR EACH
#         # Fishing
#         ais_fishing_df = AIS_df.loc[:, ['Fishing']]
#
#         # TugTow
#         ais_tugtow_df = AIS_df.loc[:, ['TugTow']]
#
#         # Recreational
#         ais_recreational_df = AIS_df.loc[:, ['Recreational']]
#
#         # Passenger
#         ais_passenger_df = AIS_df.loc[:, ['Passenger']]
#
#         # Cargo
#         ais_cargo_df = AIS_df.loc[:, ['Cargo']]
#
#         # Tanker
#         ais_tanker_df = AIS_df.loc[:, ['Tanker']]
#
#         # Other
#         ais_other_df = AIS_df.loc[:, ['Other']]
#
#         # Unavailable
#         ais_unavailable_df = AIS_df.loc[:, ['Unavailable']]
#
#         # Total
#         ais_total_df = AIS_df.loc[:, ['Total']]
#
#         def BoatModel(x, name):
#
# ### Convert the DataFrame into an array, and change the type to floats for the Neural Network
#             data = x.values
#             data = data.astype('float32')
#
#     ### Normalize the data by using a scaler
#             scaler = MinMaxScaler(feature_range=(0, 1))
#             data = scaler.fit_transform(data)
#
#     ### Split our data into training and testing using slicing, and check the length
#
#     ### Determin the length of what our split will be
#             data_split = int(len(data) * 0.75)
#
#     ### Slice the data and print the results
#             train, test = data[:data_split], data[data_split:]
#
#     ### Make a function that creates both X and y values for the data
#             def create_dataset(dataset, look_back=1):
#                 dataX, dataY = [], []
#                 for i in range(len(dataset) - look_back - 1):
#                     a = dataset[i:(i + look_back), 0]
#                     dataX.append(a)
#                     dataY.append(dataset[i + look_back, 0])
#                 return np.array(dataX), np.array(dataY)
#
#     ### Define how much time we're looking into the past,
#     ### and split our values into X=t and Y=t+1, where t is that time
#             look_back = 1
#             trainX, trainY = create_dataset(train, look_back)
#             testX, testY = create_dataset(test, look_back)
#
#     ### Reshape the data to incorperate into the LSTM
#             trainX = np.reshape(trainX, (trainX.shape[0], 1, trainX.shape[1]))
#             testX = np.reshape(testX, (testX.shape[0], 1, testX.shape[1]))
#
#     ### Create and fit the LSTM network
#             model = Sequential()
#             model.add(LSTM(4, activation='relu', input_shape=(1, look_back)))
#             model.add(Dense(2))
#             model.add(Dense(1))
#             model.compile(loss='mean_squared_error', optimizer='adam', metrics=['mse', 'mae', 'mape'])
#             es = [EarlyStopping(monitor='loss', patience=15)]
#             fit_model = model.fit(trainX, trainY, epochs=100, validation_split=0.3, batch_size=1, verbose=2,
#                                   callbacks=[es])
#
#     ### Make predictions
#             trainPredict = fit_model.predict(trainX)
#             testPredict = fit_model.predict(testX)
#
#     ### Invert the predictions to graph later
#             trainPredict = scaler.inverse_transform(trainPredict)
#             trainY = scaler.inverse_transform([trainY])
#             testPredict = scaler.inverse_transform(testPredict)
#             testY = scaler.inverse_transform([testY])
#
#             ### Shift the train predictions for plotting
#             trainPredictPlot = np.empty_like(data)
#             trainPredictPlot[:, :] = np.nan
#             trainPredictPlot[look_back:len(trainPredict) + look_back, :] = trainPredict
#
#     ### Shift the test predictions for plotting
#             testPredictPlot = np.empty_like(data)
#             testPredictPlot[:, :] = np.nan
#             testPredictPlot[len(trainPredict) + (look_back * 2) + 1:len(data) - 1, :] = testPredict
#
#     ### Create a function for future predictions
#
#             def predict(num_prediction, model):
#                 prediction_list = data[-look_back:]
#
#                 for _ in range(num_prediction):
#                     x = prediction_list[-look_back:]
#                     x = x.reshape((1, look_back, 1))
#                     out = model.predict(x)[0][0]
#                     prediction_list = np.append(prediction_list, out)
#                 prediction_list = prediction_list[look_back - 1:]
#
#                 return prediction_list
#
#     ### Predict the next 30 days of data
#             forecast = predict(30, model)
#             forecast = forecast.reshape((-1, 1))
#             forecast = scaler.inverse_transform(forecast)
#
#     ### Plot the prediction on a graph
#
#             future = len(data) + len(forecast)
#
#             futurePlot = np.zeros((future, 1))
#             futurePlot[:, :] = np.nan
#             futurePlot[-len(forecast):] = forecast
#
#     ### Create single dataframe of test/train/predict values
#
#             train_data = trainPredictPlot
#             test_data = testPredictPlot
#             predict_plot = futurePlot
#
#             train_test = pd.DataFrame(train_data.reshape(-1))
#             test_test = pd.DataFrame(test_data.reshape(-1))
#             predict_test = pd.DataFrame(predict_plot.reshape(-1))
#
#             for ind in train_test.index:
#                 if train_test[0][ind] != train_test[0][ind]:
#                     train_test.iloc[ind] = test_test[0][ind]
#
#             for ind in predict_test.index:
#                 if predict_test[0][ind] == predict_test[0][ind]:
#                     train_test = train_test.append(pd.DataFrame({0: [predict_test[0][ind]]}, index=[ind]))
#
#
#             if name == "Fishing":
#                 aisData.LSTM_Fishing = jsonify(train_test.to_json())
#             elif name == "TugTow":
#                 aisData.LSTM_TugTow = jsonify(train_test.to_json())
#             elif name == "Recreational":
#                 aisData.LSTM_Recreational = jsonify(train_test.to_json())
#             elif name == "Passenger":
#                 aisData.LSTM_Passenger = jsonify(train_test.to_json())
#             elif name == "Cargo":
#                 aisData.LSTM_Cargo = jsonify(train_test.to_json())
#             elif name == "Tanker":
#                 aisData.LSTM_Tanker = jsonify(train_test.to_json())
#             elif name == "Other":
#                 aisData.LSTM_Other = jsonify(train_test.to_json())
#             elif name == "Unavailable":
#                 aisData.LSTM_Unavailable = jsonify(train_test.to_json())
#             elif name == "Total":
#                 aisData.LSTM_Total = jsonify(train_test.to_json())
#
#             return train_test

### Call LinearRegression Function
        ais_graphs()

# ### Call LSTM Functions
#         BoatModel(ais_fishing_df, "Fishing")
#         BoatModel(ais_recreational_df, "Recreational")
#         BoatModel(ais_tugtow_df, "TugTow")
#         BoatModel(ais_passenger_df, "Passenger")
#         BoatModel(ais_cargo_df, "Cargo")
#         BoatModel(ais_tanker_df, "Tanker")
#         BoatModel(ais_other_df, "Other")
#         BoatModel(ais_total_df, "Total")
#         print(aisData.LSTM_Total)

### Assign output metrics dict to the DataStore
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

# @app.route("/get-lstm-fish")
# def lstm_fish():
#     return aisData.LSTM_Fishing
#
# @app.route("/get-lstm-tugtow")
# def lstm_tugtow():
#     return aisData.LSTM_TugTow
#
# @app.route("/get-lstm-rec")
# def lstm_rec():
#     return aisData.LSTM_Recreational
#
# @app.route("/get-lstm-pass")
# def lstm_pass():
#     return aisData.LSTM_Passenger
#
# @app.route("/get-lstm-cargo")
# def lstm_cargo():
#     return aisData.LSTM_Cargo
#
# @app.route("/get-lstm-tanker")
# def lstm_tanker():
#     return aisData.LSTM_Tanker
#
# @app.route("/get-lstm-other")
# def lstm_other():
#     return aisData.LSTM_Other
#
# @app.route("/get-lstm-total")
# def lstm_total():
#     return aisData.LSTM_Total

if __name__ == '__main__':
    # app.secret_key = 'testkey2'
    # app.config['SESSION_TYPE'] = 'sqlalchemy'
    app.run(debug=True)