import pandas as pd
from flask import Flask, flash, redirect, render_template, request, session, abort, send_from_directory, send_file, jsonify
import json


app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route("/", methods=["GET", "POST"])

def homepage():
    if request.method == "POST":
        data = request.get_json()
        print(data)

    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)