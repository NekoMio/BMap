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
	ret = []
	for i in range(1,len(ans)):
		if (ans[i-1],ans[i]) in edge:
			ret.append((ans[i-1],ans[i])+edge[(ans[i-1],ans[i])])
		else:
			ret.append((ans[i-1],ans[i])+edge[(ans[i],ans[i-1])])
	return ret