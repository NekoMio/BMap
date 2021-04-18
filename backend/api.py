from flask import Flask, jsonify, request
from dijkstra import Dijkstra
app = Flask(__name__)

@app.route('/route', methods=['POST'])
def findRoute():
    rawData = request.data
    jsonData = json.loads(rawData)
    
    return json.dumps({'result':Dijkstra(jsonData[startPoint],jsonData[endPoint])})