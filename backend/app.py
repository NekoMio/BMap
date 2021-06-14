import pickle
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dijkstra import Dijkstra
from tsp import TSP
import math
import random

app = Flask(__name__)
CORS(app)

class Map:
    def __init__(self):
        self.vertex = {} # p[id] = (x,y)
        self.cntVertex = 0
        self.edge = {} # e[(x,y)] = (dis,ord)
        self.edgeBike = {}
        self.building = {} # b[id] = name
        self.buildingPoint = {} # bp[(x,y)] = id
        self.cntBuilding = 0
        self.vPoint = {} # vp["name"] = id
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
    def addEdgeBike(self, x, y, z, p):    # x,y are the ids of the begin and end vertex.
        self.edgeBike[(x, y)]=(z, p)
        return 0
    def delEdge(self, x, y):
        del self.edge[(x,y)]
        return 0
    def delEdgeBike(self, x, y):
        del self.edgeBike[(x,y)]
        return 0
    def dump(self):
        with open('app.storage', 'wb') as f:
            pickle.dump(self, f, 0)

def loadMap() -> Map:
    if os.path.exists('app.storage') == False:
        return Map()
    with open('app.storage', 'rb') as f: # load bMap from pickle file
        return pickle.load(f)

def writeLog(x):
    logFile.write(x+"\n")
    logFile.flush()
    
@app.before_first_request
def init():
    global bMap, logFile
    logFile = open("run.log", "w")
    logLock = False
    bMap = loadMap()

@app.route("/api/")
def welcome():
    return "Welcome to bMap Backend!" + '\n' + str(bMap.cntVertex) + ' ' + str(bMap.vertex) + '\n' + str(len(bMap.edge)) + ' ' + str(bMap.edgeBike) \
           + str(bMap.cntBuilding) + ' ' + str(bMap.building)  + ' ' + str(bMap.buildingPoint) 

@app.route("/api/addpoint/", methods=['POST'])
def addPoint():
    if 'coord' not in request.json or len(request.json['coord']) != 2:
        return "Invalid Argument", 400
    ret = bMap.addPoint(request.json['coord'][0],request.json['coord'][1])
    writeLog("[ADDPOINT] (%s, %s) added to map." % (str(request.json['coord'][0]), request.json['coord'][1]))
    bMap.dump()
    return str(ret)

@app.route("/api/deletepoint/", methods=['POST'])
def delPoint():
    if 'id' not in request.json:
        return "Invalid Argument", 400
    ret = bMap.delPoint(request.json['id'])
    writeLog("[DELPOINT] %s:(%s, %s) deleted from map." % (str(request.json['id']),str(bMap.vertex[request.json['id']][0]),str(bMap.vertex[request.json['id']][1])))
    bMap.dump()
    return str(ret)

@app.route("/api/getpointlist/")
def getPointList():
    ret = [{"id":key,"coord":value} for key,value in bMap.vertex.items()]
    writeLog("[GETPOINT]Point list requested. %s Points in map." % str(len(bMap.vertex)))
    return jsonify(ret)

@app.route('/api/save/')
def dbgDump():
    bMap.dump()
    return 'Saved.'

@app.route('/api/addpath/', methods=['POST'])
def addPath():
    if 'start' not in request.json or 'end' not in request.json or 'cap' not in request.json:
        return "Invalid Argument", 400
    tmp = math.sqrt((bMap.vertex[request.json['start']][0] - bMap.vertex[request.json['end']][0]) * (bMap.vertex[request.json['start']][0] - bMap.vertex[request.json['end']][0]) + \
          (bMap.vertex[request.json['start']][1] - bMap.vertex[request.json['end']][1]) * (bMap.vertex[request.json['start']][1] - bMap.vertex[request.json['end']][1]))
    ret = bMap.addEdge(request.json['start'], request.json['end'], tmp, request.json['cap'])
    writeLog("[ADDPATH]Path (%s, %s) added to map." % (str(request.json['start']), str(request.json['end'])))
    bMap.dump()
    return str(ret)

@app.route('/api/addpathbike/', methods=['POST'])
def addPathBike():
    if 'start' not in request.json or 'end' not in request.json or 'cap' not in request.json:
        return "Invalid Argument", 400
    tmp = math.sqrt((bMap.vertex[request.json['start']][0] - bMap.vertex[request.json['end']][0]) * (bMap.vertex[request.json['start']][0] - bMap.vertex[request.json['end']][0]) + \
          (bMap.vertex[request.json['start']][1] - bMap.vertex[request.json['end']][1]) * (bMap.vertex[request.json['start']][1] - bMap.vertex[request.json['end']][1]))
    ret = bMap.addEdgeBike(request.json['start'], request.json['end'], tmp, request.json['cap'])
    writeLog("[ADDPATH]BIKE Path (%s, %s) added to map." % (str(request.json['start']), str(request.json['end'])))
    bMap.dump()
    return str(ret)

@app.route('/api/delpath/', methods=['POST'])
def delPath():
    if 'start' not in request.json or 'end' not in request.json:
        return "Invalid Argument", 400
    ret = bMap.delEdge(request.json['start'], request.json['end'])
    writeLog("[DELPATH]Path (%s, %s) deleted from map." % (str(request.json['start']), str(request.json['end'])))
    bMap.dump()
    return str(ret)

@app.route('/api/delpathbike/', methods=['POST'])
def delPathBike():
    if 'start' not in request.json or 'end' not in request.json:
        return "Invalid Argument", 400
    ret = bMap.delEdgeBike(request.json['start'], request.json['end'])
    writeLog("[DELPATH]BIKE Path (%s, %s) deleted from map." % (str(request.json['start']), str(request.json['end'])))
    bMap.dump()
    return str(ret)

@app.route('/api/getpath/')
def getPath():
    writeLog("[GETPATH]Path List Requested. %s Paths in map." % str(len(bMap.edge)))
    return jsonify(list(bMap.edge))

@app.route('/api/getpathbike/')
def getPathBike():
    writeLog("[GETPATH]Bike Path List Requested. %s Paths in map." % str(len(bMap.edgeBike)))
    return jsonify(list(bMap.edgeBike))

@app.route('/api/getnavpath', methods=['GET', 'POST'])
def calcPath():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json:
        return "Invalid Argument", 400
    len, path = Dijkstra(request.json['start'], request.json['end'], bMap.vertex, bMap.edge, request.json['option'])
    writeLog("[NAVPATH]Distance from %s to %s is %s." % (str(request.json['start']),str(request.json['end']),str(len)))
    return jsonify({"len":len, "path":path})
    
@app.route('/api/getnavpathbike', methods=['GET', 'POST'])
def calcPathBike():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json:
        return "Invalid Argument", 400
    len, path = Dijkstra(request.json['start'], request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'])
    writeLog("[NAVPATH]BIKE Distance from %s to %s is %s." % (str(request.json['start']),str(request.json['end']),str(len)))
    return jsonify({"len":len, "path":path})

@app.route('/api/addbuilding/', methods=['POST'])
def addBuilding():
    if 'name' not in request.json or 'points' not in request.json:
        return "Invalid Argument", 400
    for i in request.json['points']:
        bMap.buildingPoint[tuple(i)] = bMap.cntBuilding
    bMap.building[bMap.cntBuilding] = request.json['name']
    bMap.cntBuilding += 1
    writeLog("[ADDBUIL]Building added to map.")
    bMap.dump()
    return '0'

@app.route('/api/getvlist/')
def getVirtualList():
    if random.random() > 0.5:
        bMap.vPoint["食堂"] = 388
    else:
        bMap.vPoint["食堂"] = 389
    writeLog("[GETVLIST]Vlist requested.")
    return jsonify([{"name":key,"id":value} for key,value in bMap.vPoint.items()])

@app.route('/api/addvpoint/', methods=['POST'])
def addVPoint():
    if 'name' not in request.json or 'id' not in request.json:
        return "Invalid Argument", 400
    bMap.vPoint[request.json['name']] = request.json['id']
    bMap.dump()
    writeLog("[ADDVPOINT]A VPoint with name %s is added." % request.json['name'])
    return '0'

@app.route('/api/getbuildings/', methods=['POST'])
def getClosestBuilding():
    addr = (request.json['point'][0], request.json['point'][1])
    tmp = {}
    for i in bMap.buildingPoint.items():
        if i[1] not in tmp:
            tmp[i[1]] = 0x3f3f3f3f
        tmp[i[1]] = min(tmp[i[1]], math.sqrt((i[0][0]-addr[0])*(i[0][0]-addr[0])+(i[0][1]-addr[1])*(i[0][1]-addr[1])))
    tmp=list(tmp.items())
    tmp.sort(key=lambda tup: tup[1])
    tmp = [bMap.building[i[0]] for i in tmp]
    tmp = tmp[:5]
    writeLog("[GETBUIL]Closest Building from (%s, %s) are %s." % (str(addr[0]),str(addr[1]),str(tmp)))
    return jsonify(tmp)

@app.route('/api/getnearestpoint/', methods=['POST'])
def getNearestPoint():
    addr = (request.json['point'][0], request.json['point'][1])
    tmp = {}
    for i in bMap.vertex.items():
        tmp[i[0]] = math.sqrt((i[1][0]-addr[0])*(i[1][0]-addr[0])+(i[1][1]-addr[1])*(i[1][1]-addr[1]))
    tmp=list(tmp.items())
    tmp.sort(key=lambda tup: tup[1])
    writeLog("[NEARPNT]Selecting Point %s." % str(tmp[0][0]))
    return str(tmp[0][0])

@app.route('/api/gettsppath/', methods=['POST'])
def tspPath():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json or 'gobylist' not in request.json:
        return "Invalid Argument", 400
    len, path = TSP(request.json['start'], request.json['end'], bMap.vertex, bMap.edge, request.json['option'], request.json['gobylist'])
    writeLog("[TSPNAVI]TSP length from %s to %s using %s is %s." % (str(request.json['start']),str(request.json['end']),str(request.json['gobylist']),str(len)))
    return jsonify({"len":len, "path":path})

@app.route('/api/gettsppathbike/', methods=['POST'])
def tspPathBike():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json or 'gobylist' not in request.json:
        return "Invalid Argument", 400
    len, path = TSP(request.json['start'], request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'],  request.json['gobylist'])
    writeLog("[TSPNAVI]BIKE TSP length from %s to %s using %s is %s." % (str(request.json['start']),str(request.json['end']),str(request.json['gobylist']),str(len)))
    return jsonify({"len":len, "path":path})

def inShahe(x):
    return dis(x, 337) < 20000

def dis(x, y):
    return math.sqrt((bMap.vertex[x][0]-bMap.vertex[y][0])*(bMap.vertex[x][0]-bMap.vertex[y][0])\
          +(bMap.vertex[x][1]-bMap.vertex[y][1])*(bMap.vertex[x][1]-bMap.vertex[y][1]))

@app.route('/api/getnavpathcross', methods=['GET', 'POST'])
def calcPathCross():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json or 'type' not in request.json:
        return "Invalid Argument", 400
    if inShahe(request.json['start']):
        if request.json['type'] == 0:
            len, path = Dijkstra(request.json['start'], 324, bMap.vertex, bMap.edge, request.json['option'])
            path.append((324,327,0,1))
            llen, ppath = Dijkstra(327, request.json['end'], bMap.vertex, bMap.edge, request.json['option'])
        else:
            len, path = Dijkstra(request.json['start'], 337, bMap.vertex, bMap.edge, request.json['option'])
            path.append((337,348,0,1))
            llen, ppath = Dijkstra(348, request.json['end'], bMap.vertex, bMap.edge, request.json['option'])
    else:
        if request.json['type'] == 0:
            len, path = Dijkstra(request.json['start'], 327, bMap.vertex, bMap.edge, request.json['option'])
            path.append((327,324,0,1))
            llen, ppath = Dijkstra(324, request.json['end'], bMap.vertex, bMap.edge, request.json['option'])
        else:
            len, path = Dijkstra(request.json['start'], 348, bMap.vertex, bMap.edge, request.json['option'])
            path.append((348,337,0,1))
            llen, ppath = Dijkstra(337, request.json['end'], bMap.vertex, bMap.edge, request.json['option'])
    writeLog("[NAVPATH]Distance from %s to %s is %s." % (str(request.json['start']),str(request.json['end']),str(len+llen)))
    return jsonify({"len":len+llen, "path":path+ppath})

@app.route('/api/getnavpathcrossbike', methods=['GET', 'POST'])
def calcPathCrossBike():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json or 'type' not in request.json:
        return "Invalid Argument", 400
    if inShahe(request.json['start']):
        if request.json['type'] == 0:
            len, path = Dijkstra(request.json['start'], 324, bMap.vertex, bMap.edgeBike, request.json['option'])
            path.append((324,327,0,1))
            llen, ppath = Dijkstra(327, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'])
        else:
            len, path = Dijkstra(request.json['start'], 337, bMap.vertex, bMap.edgeBike, request.json['option'])
            path.append((337,348,0,1))
            llen, ppath = Dijkstra(348, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'])
    else:
        if request.json['type'] == 0:
            len, path = Dijkstra(request.json['start'], 327, bMap.vertex, bMap.edgeBike, request.json['option'])
            path.append((327,324,0,1))
            llen, ppath = Dijkstra(324, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'])
        else:
            len, path = Dijkstra(request.json['start'], 348, bMap.vertex, bMap.edgeBike, request.json['option'])
            path.append((348,337,0,1))
            llen, ppath = Dijkstra(337, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'])
    writeLog("[NAVPATH]BIKE Distance from %s to %s is %s." % (str(request.json['start']),str(request.json['end']),str(len+llen)))
    return jsonify({"len":len+llen, "path":path+ppath})

@app.route('/api/gettsppathcross', methods=['POST'])
def tspPathCross():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json or 'gobylist' not in request.json:
        return "Invalid Argument", 400
    gobylist = [[],[]]
    for i in request.json['gobylist']:
        if inShahe(i):
            gobylist[0].append(i)
        else:
            gobylist[1].append(i)
    if inShahe(request.json['start']):
        if request.json['type'] == 0:
            len, path = TSP(request.json['start'], 324, bMap.vertex, bMap.edge, request.json['option'], gobylist[0])
            path.append((324,327,0,1))
            llen, ppath = TSP(327, request.json['end'], bMap.vertex, bMap.edge, request.json['option'], gobylist[1])
        else:
            len, path = TSP(request.json['start'], 337, bMap.vertex, bMap.edge, request.json['option'], gobylist[0])
            path.append((337,348,0,1))
            llen, ppath = TSP(348, request.json['end'], bMap.vertex, bMap.edge, request.json['option'], gobylist[1])
    else:
        if request.json['type'] == 0:
            len, path = TSP(request.json['start'], 327, bMap.vertex, bMap.edge, request.json['option'], gobylist[1])
            path.append((327,324,0,1))
            llen, ppath = TSP(324, request.json['end'], bMap.vertex, bMap.edge, request.json['option'], gobylist[0])
        else:
            len, path = TSP(request.json['start'], 348, bMap.vertex, bMap.edge, request.json['option'], gobylist[1])
            path.append((348,337,0,1))
            llen, ppath = TSP(337, request.json['end'], bMap.vertex, bMap.edge, request.json['option'], gobylist[0])
    writeLog("[NAVPATH]TSP Distance from %s to %s is %s." % (str(request.json['start']),str(request.json['end']),str(len+llen)))
    return jsonify({"len":len+llen, "path":path+ppath})
    
@app.route('/api/gettsppathcrossbike', methods=['POST'])
def tspPathCrossBike():
    if 'start' not in request.json or 'end' not in request.json or 'option' not in request.json or 'gobylist' not in request.json:
        return "Invalid Argument", 400
    gobylist = [[],[]]
    for i in request.json['gobylist']:
        if inShahe(i):
            gobylist[0].append(i)
        else:
            gobylist[1].append(i)
    if inShahe(request.json['start']):
        if request.json['type'] == 0:
            len, path = TSP(request.json['start'], 324, bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[0])
            path.append((324,327,0,1))
            llen, ppath = TSP(327, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[1])
        else:
            len, path = TSP(request.json['start'], 337, bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[0])
            path.append((337,348,0,1))
            llen, ppath = TSP(348, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[1])
    else:
        if request.json['type'] == 0:
            len, path = TSP(request.json['start'], 327, bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[1])
            path.append((327,324,0,1))
            llen, ppath = TSP(324, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[0])
        else:
            len, path = TSP(request.json['start'], 348, bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[1])
            path.append((348,337,0,1))
            llen, ppath = TSP(337, request.json['end'], bMap.vertex, bMap.edgeBike, request.json['option'], gobylist[0])
    writeLog("[NAVPATH]BIKE TSP Distance from %s to %s is %s." % (str(request.json['start']),str(request.json['end']),str(len+llen)))
    return jsonify({"len":len+llen, "path":path+ppath})

@app.route('/api/log')
def readLog():
    with open("run.log", "r") as f:
        tmp = f.read()
        return "<pre>"+tmp+"</pre>"


@app.route('/api/qwq')
def updatePath():
    newbike = bMap.edge
    for key,value in bMap.edgeBike.items():
        newbike[key]=value
    bMap.edgeBike=newbike
    return "Done."

