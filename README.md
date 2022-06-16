# AIS Vessel Efforts Project

## Overview 

### What Topic We Selected

The topic we selected is seeing which types of maritime vessels use various waterways. We hope to see current usage by filtering the data we obtain, and predict future usage using supervised machine learning. Our scope right now is the San Franscio Bay Area, but this code can be easily tweaked to examine other areas.

### Reason We Selected the Topic

We believe this is an interesting topic with lots of practical applications. By viewing the type of traffic in specific waterways, we can see exactly what kinds of permits need to be given out for ships to travel. It can also help determine a need for new channels, as the machine learning model will show the traffic demands for ships in the future.

### Description of the Source of Data

We are taking our data directly from https://marinecadastre.gov/ais/. The data we are pulling from this site is called Automatic Information System (AIS), and it is a broadcast of the location and description of maritime vessels. This site in particular contains daily CSV files that contains daily activity in US waters. We are going to take data ranging back over the past five years, and perform an ETL on them to reduce them down to the following columns:

-MMSI
-DateTime
-Latitude
-Longitude
-VesselType

### Questions We Hope to Answer

There are two main questions we hope to answer with this project. They are:

1) What are the different types of vessels are opperating in the selected area? As a followup to this, we are going to break down the percentage of each type of vessel that uses the various waterways in the area we're examining.

2) What does the potential growth in traffic along the waterways look like in the next five years, and does can we use this to plan new waterways?


### What the Communication Protocols Are

