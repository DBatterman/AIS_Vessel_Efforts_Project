# AIS_Vessel_Efforts_Project

## AIS Data Description

Automatic Information System (AIS) is a broadcast location/descriptive data from maritime vessels. Depending on the type of transponder, broadcasts happen usually at a frequency of every .5 - 2 minutes. These broadcast include info such as:

* Name
* MMSI (ID Number)
* Vessel Type
* Cargo Type
* Homeport
* Destination
* Speed
* Length
* Draft

Some of these are based on user input, so unfortunately many vessels only broadcase name, location, MMSI, and sometimes vesseltype.


The data source will be MarineCadastre.gov located specifically at:

https://marinecadastre.gov/ais/

This site includes daily CSV files containing all activity captured in US waters.

We will clean it down to just the following columns:

* MMSI
* DateTime
* Latitude
* Longitude
* VesselType