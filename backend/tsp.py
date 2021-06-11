from dijkstra import Dijkstra
import random
import math
def TSP(start,end,vertex,edge,op,via_vertex):
	dis=[]
	path=[]
	for i in via_vertex.key:
		dis[i]=[]
		path[i]=[]
		for j in via_vertex.key:
			if(i==j):
				continue
			path[i][j],dis[i][j]=Dijkstra(start,end,vertex,edge,op,dis,path)
	
	if len(via_vertex)<=8:
		return factorial_TSP(start,end,via_vertex)
	else:
		return disfire_TSP(start,end,vertex,via_vertex,dis,path)
def get_new_ans(ans,x,y):
	new_ans=[]
	for i in ans:
		new_ans=new_ans.append(i)
	c=new_ans[x]
	new_ans[x]=new_ans[y]
	new_ans[y]=c
	return new_ans
def work_TSP(start,end,via_vertex,dis,path):
	la=start
	ans=[]
	sum=0
	for i in via_vertex:
		ans=ans+path[la][i][:-1]
		sum+=dis[la][i]
	la=i
	ans=ans+path[la][end]
	sum+=dis[la][end]
	return ans,sum
def compare(ans,new_ans,start,end,dis,path,T):
	A,sum1=work_TSP(start,end,ans,dis,path)
	A,sum2=work_TSP(start,end,new_ans,dis,path)
	if(sum2<sum1):
		return 1
	else:
		return pow(math.e,(sum1-sum2)/T)
def disfire_TSP(start,end,vertex,via_vertex,dis,path):
	n=len(via_vertex)
	t=0
	T=2000
	T_end=0.001
	iteration=100
	ans=[]
	for i in vertex.key:
		ans=ans.append(i)
	while T>=T_end:
		t+=1
		count=0
		while count<iteration:
			count+=1
			x=random.randint(0,n-1)
			y=random.randint(0,n-1)
			new_ans=get_new_ans(ans,x,y)
			p=compare(ans,new_ans,start,end,dis,path,T)
			if random.random()<=p:
				ans=new_ans
		T=T/math.log(1+t)
	return work_TSP(start,end,ans,dis,path)


def dfs_factorial_TSP(start,end,via_vertex,list,vis,dis,path,cnt):
	if cnt==len(via_vertex)+1:
		return work_TSP(start,end,list,dis,path)
	sum=0
	ans=[]
	for i in via_vertex:
		if vis[i]==1:
			continue
		vis[i]=1
		list=list.append(i)
		tmp,sm=dfs_factorial_TSP(start,end,via_vertex,list,vis,dis,path,cnt)
		if sm<sum:
			sum=sm
			ans=tmp
		vis[i]=0
	return ans,sum
def factorial_TSP(start,end,via_vertex,dis,path):
	vis=[]
	for i in via_vertex.key:
		vis[i]=0
	return dfs_factorial_TSP(start,end,via_vertex,[],vis,dis,path,0)