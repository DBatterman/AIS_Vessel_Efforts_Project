from flask import Flask, request

# Declare the application
application= Flask(__name__)

# Defining the main code
@application.route("/", methods=["POST"])
def latlon_search():
    json_data = request.json
    top = json_data.get("top")
    bottom = json_data.get("bottom")
    left = json_data.get("left")
    right = json_data.get("right")
    if not (top and bottom and left and right):
        print("Error")
    
    print(request.json)
    # This is for debugging purposes. We can fill in the actual return later
    return "Hello World!"