import pickle
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dijkstra import Dijkstra

app = Flask(__name__)
CORS(app)

class Map:
    def __init__(self):
        self.vertex = {}
        self.cntVertex = 0
        self.edge = {}
    def addPoint(self, x, y):   # x,y are the Latitude and Longitude of the vertex, in float.
        self.vertex[self.cntVertex] = [x, y]
        self.cntVertex += 1
        return self.cntVertex - 1
    def delPoint(self, id):
        del self.vertex[id]
        return 0
    def addEdge(self, x, y, z, p):    # x,y are the ids of the begin and end vertex.
        self.edge[(x, y)]=(z, p)
        return 0
    def delEdge(self, x, y):
        del self.edge[(x,y)]
        return 0
    def dump(self):
        with open('app.storage', 'wb') as f:
            pickle.dump(self, f, 0)

def loadMap() -> Map:
    if os.path.exists('app.storage') == False:
        return Map()
    with open('app.storage', 'rb') as f: # load bMap from pickle file
        return pickle.load(f)

@app.before_first_request
def init():
    global bMap
    bMap = loadMap()

@app.route("/")
def welcome():
    return "Welcome to bMap Backend!" + '\n' + str(bMap.cntVertex) + ' ' + str(bMap.vertex) + '\n' + str(len(bMap.edge)) + ' ' + str(bMap.edge)

@app.route("/api/addpoint/", methods=['POST'])
def addPoint():
    if 'coord' not in request.json or len(request.json['coord']) != 2:
        return "Invalid Argument", 400
    ret = bMap.addPoint(request.json['coord'][0],request.json['coord'][1])
    bMap.dump()
    return str(ret)

@app.route("/api/deletepoint/", methods=['POST'])
def delPoint():
    if 'id' not in request.json:
        return "Invalid Argument", 400
    ret = bMap.delPoint(request.json['id'])
    bMap.dump()
    return str(ret)

@app.route("/api/getpointlist/")
def getPointList():
    ret = [{"id":key,"coord":value} for key,value in bMap.vertex.items()]
    return jsonify(ret)

@app.route('/api/save/')
def dbgDump():
    bMap.dump()
    return 'Saved.'

@app.route('/api/addpath/', methods=['POST'])
def addPath():
    if 'start' not in request.json or 'end' not in request.json or 'len' not in request.json or 'cap' not in request.json:
        return "Invalid Argument", 400
    ret = bMap.addEdge(request.json['start'], request.json['end'], request.json['len'], request.json['cap'])
    bMap.dump()
    return str(ret)

@app.route('/api/delpath/', methods=['POST'])
def delPath():
    if 'start' not in request.json or 'end' not in request.json:
        return "Invalid Argument", 400
    ret = bMap.delEdge(request.json['start'], request.json['end'])
    bMap.dump()
    return str(ret)

@app.route('/api/getpath/')
def getPath():
    return jsonify(list(bMap.edge))

@app.route('/api/getnavpath/')
def calcPath():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json:
        return "Invalid Argument", 400
    return jsonify(Dijkstra(request.json['start'], request.json['end'], bMap.vertex, bMap.edge, request.json['option']))
