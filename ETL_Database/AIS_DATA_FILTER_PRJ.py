import pandas as pd
import datetime as dt
import os
from bs4 import BeautifulSoup as bs
import requests
import psycopg2
import sqlalchemy as sq
from datetime import datetime
import numpy as np


 # output directory
out = "C:/Users/Nodak/Documents/GitHub/AIS_PROJECT/ETL/"

out_db = "sqlite:///C:/Users/Nodak/Documents/GitHub/AIS_Vessel_Efforts_Project/ETL_Database/AIS_db.db"

engine = sq.create_engine(out_db, echo=True)

engine_connect = engine.connect()
#
# cursor = engine_connect.cursor()
#
# cursor.execute("""
#     IF NOT EXISTS CREATE TABLE 'AIS_RAW_DATA'
#
# """)











for year in range(2021, 2022):
    print(year)

    # grab the url and search for the zip extensions
    url = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{year}/index.html"
    url_input = requests.get(url).content
    soup = bs(url_input, "html.parser")
    zip_files = soup.find_all("a", href=True)
    zip_series = pd.Series(zip_files)
    zip_array = [item for sublist in zip_series for item in sublist if "zip" in item]
    # Loop through each zip extension found on the API Webpage

    for zip in zip_array[301:]:
        print(zip)
        f = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{year}/{zip}"

        # Filter for desired Lat/Lon
        def AISDATA(data):
            data = pd.read_csv(f, usecols=['MMSI', "BaseDateTime", 'LAT', 'LON', 'VesselType', 'Length', 'Draft'], low_memory=False)  # define your desired columns, add: (example:) ".query('VesselType in ['35', '1003']')" to further edit down to a desired user group/attribute
            print(len(data))
            data["LAT"] = pd.to_numeric(data["LAT"], errors='coerce')
            data["LON"] = pd.to_numeric(data["LON"], errors='coerce')
            data["LAT"].dropna(inplace=True)
            data["LON"].dropna(inplace=True)
            # data = data[data["LAT"].apply(lambda x: isinstance(x, float))]
            # data = data[data["LON"].apply(lambda x: isinstance(x, float))]
            print(len(data))
            data = data.astype({"LAT": "float", "LON": "float"})
            a = data[data["LAT"] <= 42.036]  # (TOP BOUND)
            b = a[a["LAT"] >= 32.513]  # (BOTTOM BOUND)
            c = b[b["LON"] >= -125.108]  # (LEFT BOUND)
            d = c[c["LON"] <= -116.693]  # (RIGHT BOUND)
            yield d  # finish generator loop
        # concatenate the search results to a final table
        final_list = pd.concat(AISDATA(f))
        # create pandas dataframe
        df = pd.DataFrame(final_list)
        # Clean dataframe
        df.drop(df[df['LAT'] == None].index, inplace=True)
        df.drop(df[df['LON'] == None].index, inplace=True)
        df.drop(df[df['LON'] > 0].index, inplace=True)
        df.drop(df[df['MMSI'] == None].index, inplace=True)
        df.dropna(subset=['MMSI', 'LAT', 'LON'], inplace=True)
        df['VesselType'] = df['VesselType'].fillna(0)
        df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime']).dt.strftime("%Y-%m-%d %H:%M:%S")
        df.reset_index(inplace=True)
        del df["index"]
        # # output path and name
        # split_text = (zip.split('.')[0]).split("_")
        # output_path = os.path.join(out, f"{split_text[1]}_{split_text[2]}_{split_text[3]}_AIS.csv")  # What you want to name your output .CSV
        # df.to_csv(output_path, index=False)  # output csv with all entries
        # create SQL table for AIS_DATA
        df.to_sql(name='ais_raw_data', con=engine, if_exists='append')



