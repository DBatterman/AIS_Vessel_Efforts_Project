import pandas as pd
import datetime as dt
import os
from bs4 import BeautifulSoup as bs
import requests


 # output directory
out = "C:/Users/Nodak/Documents/GitHub/AIS_PROJECT/ETL/"

# loop through each API year
for year in range(2018, 2022):
    print(year)

    # grab the url and search for the zip extensions
    url = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{year}/index.html"
    url_input = requests.get(url).content
    soup = bs(url_input, "html.parser")
    zip_files = soup.find_all("a", href=True)
    zip_series = pd.Series(zip_files)
    zip_array = [item for sublist in zip_series for item in sublist if "zip" in item]

    # Loop through each zip extension found on the API Webpage
    n = 1
    for zip in zip_array:
        print(zip)
        f = f"https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{year}/{zip}"

        # Filter for desired Lat/Lon
        def AISDATA(data):
            data = pd.read_csv(f, usecols=['MMSI', "BaseDateTime", 'LAT', 'LON', 'VesselType'])  # define your desired columns, add: (example:) ".query('VesselType in ['35', '1003']')" to further edit down to a desired user group/attribute
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
        df.drop(df[df['LAT'] == None].index, inplace=True)
        df.drop(df[df['LON'] == None].index, inplace=True)
        df.drop(df[df['LON'] > 0].index, inplace=True)
        df.drop(df[df['MMSI'] == None].index, inplace=True)
        df.dropna(subset=['MMSI', 'LAT', 'LON'], inplace=True)
        df['VesselType'] = df['VesselType'].fillna(0)
        df['BaseDateTime'] = pd.to_datetime(df['BaseDateTime']).dt.strftime("%Y/%m/%d")
        df.reset_index(inplace=True)
        del df["index"]
        # output path and name
        output_path = os.path.join(out, f"{n}_{year}_AIS.csv")  # What you want to name your output .CSV
        df.to_csv(output_path, index=False)  # output csv with all entries
        print(n)
        n += 1

    # replace to_csv with push to postgresql

