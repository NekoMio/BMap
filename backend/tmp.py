from tsp import TSP
start = 0
end = 3
vertex = {0: [12944371.562791632, 4888860.371305252], 1: [12944624.760447828, 4888685.521610339], 2: [12944675.39993533, 4888544.113115301], 3: [12944675.400008224, 4888814.509059123]}
edge = {(0, 1): (1, 1),(0, 2): (1, 1),(1, 3): (1, 1),(2, 3): (1, 1)}
op = 0
via_vertex = [2]
ans, sum = TSP(start,end,vertex,edge,op,via_vertex)
print(ans, sum)