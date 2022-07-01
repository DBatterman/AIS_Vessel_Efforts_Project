import pandas as pd
import datetime as dt
import os
from bs4 import BeautifulSoup as bs
import requests
from sqlalchemy import create_engine
import psycopg2
import sqlalchemy as sq


 # output directory
out = "C:/Users/Nodak/Documents/GitHub/AIS_PROJECT/ETL/"

# loop through each API year
for year in range(2020, 2023):
    print(year)

    # grab the url and search for the zip extensions
    url = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{year}/index.html"
    url_input = requests.get(url).content
    soup = bs(url_input, "html.parser")
    zip_files = soup.find_all("a", href=True)
    zip_series = pd.Series(zip_files)
    zip_array = [item for sublist in zip_series for item in sublist if "zip" in item]
    annual_df = pd.DataFrame(columns=['MMSI', "BaseDateTime", 'LAT', 'LON', 'VesselType'])
    # Loop through each zip extension found on the API Webpage
    n = 1
    for zip in zip_array:
        print(zip)
        f = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{year}/{zip}"

        # Filter for desired Lat/Lon
        def AISDATA(data):
            data = pd.read_csv(f, usecols=['MMSI', "BaseDateTime", 'LAT', 'LON', 'VesselType'], low_memory=False)  # define your desired columns, add: (example:) ".query('VesselType in ['35', '1003']')" to further edit down to a desired user group/attribute

            data.dropna(subset=['MMSI', 'LAT', 'LON', 'BaseDateTime'], inplace=True)
            data['VesselType'] = data['VesselType'].fillna(0)
            data.drop(data[data['MMSI'] == None].index, inplace=True)
            data.drop(data[data['LAT'] == None].index, inplace=True)
            data.drop(data[data['LON'] == None].index, inplace=True)
            data.drop(data[data['LON'] > 0].index, inplace=True)
            data['BaseDateTime'] = pd.to_datetime(data['BaseDateTime']).dt.strftime("%Y/%m/%d")
            data = data.astype({"LAT": "float", "LON": "float"})
            a = data[data["LAT"] <= 38.2]  # (TOP BOUND)
            b = a[a["LAT"] >= 37.2]  # (BOTTOM BOUND)
            c = b[b["LON"] >= -123.3]  # (LEFT BOUND)
            d = c[c["LON"] <= -121.3]  # (RIGHT BOUND)
            yield d  # finish generator loop

        # concatenate the search results to a final table
        final_list = pd.concat(AISDATA(f))
        # create pandas dataframe
        df = pd.DataFrame(final_list)
        # Clean dataframe
        # df.drop(df[df['LAT'] == None].index, inplace=True)
        # df.drop(df[df['LON'] == None].index, inplace=True)
        # df.drop(df[df['LON'] > 0].index, inplace=True)
        # df.drop(df[df['MMSI'] == None].index, inplace=True)
        # df.dropna(subset=['MMSI', 'LAT', 'LON'], inplace=True)
        # df['VesselType'] = df['VesselType'].fillna(0)
        # df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime']).dt.strftime("%Y/%m/%d")
        df.reset_index(inplace=True)
        del df["index"]
        # # output path and name
        split_text = (zip.split('.')[0]).split("_")
        output_path = os.path.join(out, f"{split_text[1]}_{split_text[2]}_{split_text[3]}_AIS.csv")  # What you want to name your output .CSV
        df.to_csv(output_path, index=False)  # output csv with all entries
        # create SQL table for movies_df
        # connection = F"postgresql://postgres:12345@127.0.0.1:5432/AIS_Project"
        # engine = create_engine(connection)
        # df.to_sql(name='ais_raw_data', con=engine, dtype={"BaseDateTime": sq.DateTime()}, if_exists='append')

        # create table for ratings_df
        # rows_imported = 0
        # start_time = time.time()
        # for data in pd.read_csv(ratings_file, chunksize=1000000):
        #     round_time = time.time()
        #     print(f'importing rows {rows_imported} to {rows_imported + len(data)}...', end='')
        #     data.to_sql(name='ratings', con=engine, if_exists='replace')
        #     rows_imported += len(data)
        #     print(f'Chunk Done. {time.time() - round_time} total seconds elapsed')
        #
        # print(f'Done. {time.time() - start_time} total seconds elapsed for entire upload.')

        # print(n)
        # n += 1

    # replace to_csv with push to postgresql

