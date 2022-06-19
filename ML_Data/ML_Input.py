import pandas as pd
import os, json
import glob

inputs = "C:/Users/Nodak/Documents/GitHub/AIS_PROJECT/archived_data/AIS_2021_SF"

json_files = [pos_json for pos_json in os.listdir(inputs) if pos_json.endswith('.json')]
print(json_files)
final_dict = {}
n = 1
for f in json_files:
    temp_unique = []
    ml_dict = {"Fishing": 0, "TugTow": 0, "Recreational": 0, "Passenger": 0, "Cargo": 0, "Tanker": 0, "Other": 0, "Unavailable": 0}
    with open(os.path.join(inputs, f)) as json_in:
        json_text = json.load(json_in)
        temp_df = pd.DataFrame.from_dict(json_text)
        print(n)
        n += 1
    for row in temp_df.MMSI:
        if row not in temp_unique:
            temp_unique.append(row)
            if temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 0:
                ml_dict["Unavailable"] +=1
            elif temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 30:
                ml_dict["Fishing"] += 1
            elif temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 31 or temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 32 or temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 52:
                ml_dict["TugTow"] += 1
            elif temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 36 or temp_df.loc[temp_df.MMSI == row, "VesselType"][0] == 37:
                ml_dict["Recreational"] += 1
            elif temp_df.loc[temp_df.MMSI == row, "VesselType"][0] >= 60 and temp_df.loc[temp_df.MMSI == row, "VesselType"][0] <= 69:
                ml_dict["Passenger"] += 1
            elif temp_df.loc[temp_df.MMSI == row, "VesselType"][0] >= 70 and temp_df.loc[temp_df.MMSI == row, "VesselType"][0] <= 79:
                ml_dict["Cargo"] += 1
            elif temp_df.loc[temp_df.MMSI == row, "VesselType"][0] >= 80 and temp_df.loc[temp_df.MMSI == row, "VesselType"][0] <= 89:
                ml_dict["Tanker"] += 1
            else: ml_dict["Other"] += 1

    final_dict[f.split('_')[0]] = ml_dict

print(len(temp_unique))
print(final_dict)

final_df = pd.DataFrame.from_dict(final_dict, orient="index", columns=["Fishing", "TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable"])
final_df.to_csv("ml_data.csv", index=True)
