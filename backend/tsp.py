import random
import math
def Dijkstra(start,end,vertex,edge,op):
	connect={}
	for i in vertex.keys():
		connect[i]={}
	for i in edge.items():
		if i[0][0] not in vertex or i[0][1] not in vertex:
			continue
		if op==0:
			connect[i[0][0]][i[0][1]]=i[1][0]
			connect[i[0][1]][i[0][0]]=i[1][0]
		else:
			connect[i[0][0]][i[0][1]]=i[1][0]*i[1][1]
			connect[i[0][1]][i[0][0]]=i[1][0]*i[1][1]
	vis={}
	pre={}
	dis={}

	for i in vertex.keys():
		dis[i]=-1
	dis[start]=0
	for i in range(len(vertex)-1):
		max_dis=-1
		max_dis_vertex = 0
		for j in vertex.keys():
			if j in vis or dis[j] == -1:
				continue
			if max_dis==-1 or max_dis>dis[j]:
				max_dis_vertex=j
				max_dis=dis[j]
		if max_dis==-1:
			break
		vis[max_dis_vertex]=1
		for j in connect[max_dis_vertex]:
			if dis[j]==-1 or dis[max_dis_vertex]+connect[max_dis_vertex][j]<dis[j]:
				dis[j]=dis[max_dis_vertex]+connect[max_dis_vertex][j]
				pre[j]=max_dis_vertex
	now=end
	ans=[]
	while now!=start:
		ans.append(now)
		now=pre[now]
	ans.append(start)
	ans.reverse()
	return ans, dis[end]

def TSP(start,end,vertex,edge,op,via_vertex):
	dis={}
	path={}
	via_vertex.append(start)
	via_vertex.append(end)
	for i in via_vertex:
		dis[i]={}
		path[i]={}
		for j in via_vertex:
			if i == j:
				continue
			path[i][j],dis[i][j]=Dijkstra(i,j,vertex,edge,op)
	via_vertex.pop()
	via_vertex.pop()
	ans,sum = factorial_TSP(start,end,via_vertex,dis,path)
	ret = []
	for i in range(1,len(ans)):
		if (ans[i-1],ans[i]) in edge:
			ret.append((ans[i-1],ans[i])+edge[(ans[i-1],ans[i])])
		else:
			ret.append((ans[i-1],ans[i])+edge[(ans[i],ans[i-1])])
	return sum,ret

def work_TSP(start,end,via_vertex,dis,path):
	la=start
	ans=[]
	sum=0
	for i in via_vertex:
		ans=ans+(path[la][i][:-1])
		sum+=dis[la][i]
		la=i
	ans=ans+(path[la][end])
	sum+=dis[la][end]
	return ans,sum

def dfs_factorial_TSP(start,end,via_vertex,list,vis,dis,path,cnt):
	if cnt==len(via_vertex):
		return work_TSP(start,end,list,dis,path)
	sum=0x3f3f3f3f
	ans=[]
	for i in via_vertex:
		if vis[i]==1:
			continue
		vis[i]=1
		list.append(i)
		tmp,sm=dfs_factorial_TSP(start,end,via_vertex,list,vis,dis,path,cnt+1)
		list.pop()
		vis[i]=0
		if sm<sum:
			sum=sm
			ans=tmp
	return ans,sum

def factorial_TSP(start,end,via_vertex,dis,path):
	vis={}
	for i in via_vertex:
		vis[i]=0
	return dfs_factorial_TSP(start,end,via_vertex,[],vis,dis,path,0)