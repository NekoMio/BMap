import pandas as pd
import random
import csv
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import scale
from sklearn.datasets import make_classification
from sklearn.metrics import confusion_matrix

from sklearn.model_selection import train_test_split
import numpy as np 
from sklearn.model_selection import KFold  

def Dijkstra(place,st,en,cnt):
	dis={}
	pro={}
	vis={}
	for i in place:
		dis[i]=1000000000
		vis[i]=0
	dis[st]=0
	vis[st]=1
	for i in place:
		dis[i]=L[st][i]
	for i in range(cnt-1):
		ma=1000000000
		tmp=st
		for j in place:
			if vis[j]==0 and dis[j]<ma:
				ma=dis[j]
				tmp=j
		vis[tmp]=1
		for j in place:
			if vis[j]==0 and L[tmp][j]+dis[tmp]<dis[j]:
				dis[j]=L[tmp][j]+dis[tmp]
				pro[j]=tmp
	now=en
	ans=[]
	while now!=st:
		ans.append(now)
		now=pro[now]
	ans.append(now)
	return ans
		
	