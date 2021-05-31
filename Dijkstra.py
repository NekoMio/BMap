
def Dijkstra(start,end,vertex,edge,op):
	connect={}
	for i in vertex.key:
		connect[i]=[]
	for i in edge:
		if op==0:
			connect[i[0]][i[1]]=i[2]
			connect[i[1]][i[0]]=i[2]
		else:
			connect[i[0]][i[1]]=i[2]*i[3]
			connect[i[1]][i[0]]=i[2]*i[3]
	vis={}
	pre={}
	dis={}

	for i in vertex.key:
		dis[i]=-1
	dis[start]=0
	for i in range(len(vertex)-1):
		max_dis=-1
		max_dis_vertex
		for j in vertex.key:
			if vis[j] or dis[j]==-1:
				continue
			if max_dis==-1 or max_dis>dis[j]:
				max_dis_vertex=vertex.key
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
		ans=ans.append(now)
		now=pre[now]
	ans.append(start)
	return ans