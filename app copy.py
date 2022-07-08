# Import Dependencies

from flask import Flask, flash, redirect, render_template, request, session, abort,send_from_directory,send_file,jsonify
import pandas as pd
import json

# Declare the application
application= Flask(__name__)

# Declare data stores
class DataStore():
    a1=None
    Year=None
    a2= None
    a3=None
data=DataStore()

@application.route("/main", methods=["GET","POST"])

# Writing the main code
@application.route("/", methods=["GET","POST"])
def homepage():
    a1 = request.form.get()
    Year = request.form.get()
    
    data.a1=a1
    data.Year=Year
    
    df = pd.read_csv()

    # choose columns to keep, in the desired nested json hierarchical order
    df = df[df.a1 == a1]
    df = df[df.Year == int(Year)]
    print(df.head())
    
    df = df[["x1", "x2", "x3"]]

    # the groupby call makes a pandas series by grouping 'the_parent' and 'the_child', while summing the numerical column 'child_size'
    df1 = df.groupby(['x1', 'x2'])['x3'].sum()
    df1 = df1.reset_index()

    # start a new flare.json document
    flare = dict()
    d = {"name": "flare", "children": []}

    for line in df1.values:
        x1 = line[0]
        x2 = line[1]
        x3 = line[2]

        # make a list of keys
        keys_list = []
        for item in d['children']:
            keys_list.append(item['name'])

        # if 'the_parent' is NOT a key in the flare.json yet, append it
        if not x1 in keys_list:
            d['children'].append({"name": x1, "children": [{"name": x2, "size": x3}]})

        # if 'the_parent' IS a key in the flare.json, add a new child to it
        else:
            d['children'][keys_list.index(x1)]['children'].append({"name": x2, "size": x3})

    flare = d
    e = json.dumps(flare)
    data.Prod = json.loads(e)
    Prod=data.Prod

    return render_template()

# export the final result to a json file

@application.route("/get-n1-data",methods=["GET","POST"])
def returnLossData():
    g=data.n1

    return jsonify(g)


if __name__ == "__main__":
    app.run(debug=True)