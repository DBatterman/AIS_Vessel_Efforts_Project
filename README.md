# AIS Vessel Efforts Project

## Overview 

### What Topic We Selected

The topic we selected is seeing which types of maritime vessels use various waterways. We hope to see current usage by filtering the data we obtain, and predict future usage using supervised machine learning. Our scope right now is the San Franscio Bay Area, but this code can be easily tweaked to examine other areas. The scope of this project will use data from the past five years, ranging from 2017-2021, analyze it, then predict the next five years with our model.

### Reason We Selected the Topic

We believe this is an interesting topic with lots of practical applications. By viewing the type of traffic in specific waterways, we can see exactly what kinds of permits need to be given out for ships to travel. This will lead to a more streamlined process of distributing these permits, especially for event permits that people will need to acquire in advance. It can also help see if current channels are adequate to handle the flow and type of traffic in them, as well as determine a need for new channels. Lastly, it can help track enviromental impact for each channel, as one can calculate the emissions output from the amount of ships going through each channel.

### Description of the Source of Data

We are taking our data directly from https://marinecadastre.gov/ais/. The data we are pulling from this site is called Automatic Information System (AIS), and it is a broadcast of the location and description of maritime vessels. This site in particular contains daily CSV files that contains daily activity in US waters. We are going to take data ranging back over the past five years, and perform an ETL on them to reduce them down to the following columns:

* MMSI
* DateTime
* Latitude
* Longitude
* VesselType

### Questions We Hope to Answer

There are two main questions we hope to answer with this project. They are:

1) What are the different types of vessels are opperating in the selected area? As a followup to this, we are going to break down the percentage of each type of vessel that uses the various waterways in the area we're examining.

2) What does the potential growth in traffic along the waterways look like in the next five years, and does can we use this to plan new waterways?


### What the Communication Protocols Are

We plan to meet over Zoom during class on Tuesday and Thursday, we a catchup meeting on Sundays. There will also be daily communication through Slack as well as individual meetings when needed.

