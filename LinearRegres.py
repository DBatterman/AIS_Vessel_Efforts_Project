#!/usr/bin/env python
# coding: utf-8

# In[1]:


import warnings
warnings.filterwarnings('ignore')


# In[2]:


import numpy as np
from scipy.stats import linregress
import pandas as pd
import matplotlib.pyplot as plt
import datetime as dt
from pathlib import Path
from collections import Counter


# In[3]:


from sklearn.metrics import balanced_accuracy_score
from sklearn.metrics import confusion_matrix
from imblearn.metrics import classification_report_imbalanced
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from statsmodels.graphics.tsaplots import plot_acf


# In[4]:


#Standard columns for all datasets
columns = [
    "Fishing", "TugTow", "Recreational", "Passenger" , "Cargo", "Tanker", "Other", "Unavailable", "Total"
]

target_fishing = "Fishing"
target_tugtow = "TugTow"
target_rec = "Recreational"
target_passenger = "Passenger"
target_cargo = "Cargo"
target_tanker = "Tanker"
target_other = "Other"
target_unavailable = "Unavailable"
target_total = "Total"

types = [target_fishing, target_tugtow, target_rec, target_passenger, target_cargo, target_tanker, target_other, target_unavailable, target_total]



# In[5]:


#this will take in the clean data from the SQLite database
#set up engine will take place here first. 

file_path = Path('ml_data_daily_2018-19.csv')
df = pd.read_csv(file_path, index_col=False)
df.rename(columns = {'Unnamed: 0':'Date'}, inplace=True)

# Drop the null rows
df = df.dropna()
#df.sort_values(by='in', ascending=True)
df['Total'] = df.sum(axis=1)
df['Date'] = pd.to_datetime(df['Date'])
#df['Date'] = (df['Date'] - dt.datetime(1970,1,1)).dt.total_seconds()


df = df.reset_index()
df.head(75)


# In[6]:


def ais_graphs():
    for boat_type in types:
        
        y = df[boat_type]
        # Create our features
        X =  df.drop(["Date", "Fishing","TugTow", "Recreational", "Passenger", "Cargo", "Tanker", "Other", "Unavailable", "Total"], axis=1)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=1)
        X_train.shape
        
        model = LinearRegression()
        
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        
        accuracy = model.score(X_test, y_test)

        results = pd.DataFrame({"Prediction": y_pred, "Actual": y_test}).reset_index(drop=True)
        print("The Accuracy of this model is:")
        print(accuracy)
        plt.scatter(X,y, color="black")
        plt.plot(X_test, y_pred, color="blue", linewidth=3)
        plt.xlabel('# of Days (Starting January 1st, 2018)')
        plt.ylabel('# of Boats')
        plt.title(boat_type + " boats from 2018-2019")
        plt.show()


# In[7]:


ais_graphs()


# In[ ]:




