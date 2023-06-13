import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN

UNCLASSIFIED=0
NOISE=-1

def getDistanceMatrix(datas):
    N,D=np.shape(datas)
    dists=np.zeros([N,N])
    for i in range(N):
        for j in range(N):
            vi=datas[i,:]
            vj=datas[j,:]
            dists[i,j]=np.sqrt(np.dot((vi-vj),(vi-vj)))
    return dists

def find_points_in_eps(point_id,eps,dists):
    index=(dists[point_id]<=eps)
    return np.where(index==True)[0].tolist()

def dbscan(datas,eps,min_points):
    dists=getDistanceMatrix(datas)
    n_points=datas.shape[0]
    labs=[UNCLASSIFIED]*n_points
    cluster_id=0
    for point_id in range(0,n_points):
        if not(labs[point_id]==UNCLASSIFIED):
            continue
        seeds=find_points_in_eps(point_id, eps, dists)
        if len(seeds)<min_points:
            labs[point_id]=NOISE
        else:
            cluster_id=cluster_id+1
            labs[point_id]=cluster_id
            expand_cluster(dists,labs,cluster_id,seeds,eps,min_points)
    return labs,cluster_id

def expand_cluster(dists,labs,cluster_id,seeds,eps,min_points):
    i=0
    while i<len(seeds):
        Pn=seeds[i]
        if labs[Pn]==NOISE:
            labs[Pn]=cluster_id
        elif labs[Pn]==UNCLASSIFIED:
            labs[Pn]=cluster_id
            new_seeds=find_points_in_eps(Pn,eps,dists)
            if len(new_seeds)>=min_points:
                seeds=seeds+new_seeds
        i=i+1

def draw_cluster(datas,labs,n_cluster):
    plt.cla()
    colors=[plt.cm.Spectral(each) for each in np.linspace(0,1,n_cluster)]
    for i,lab in enumerate(labs):
        if lab==NOISE:
            plt.scatter(datas[i,0],datas[i,1],s=16,color=(0,0,0))
        else:
            plt.scatter(datas[i, 0], datas[i, 1], s=16, color=colors[int(labs[i]) - 1])
    plt.show()

if __name__=="__main__":
    centers=[[1,1],[-1,-1],[1,-1],[-1,1]]
    datas,labels_true=make_blobs(n_samples=5000,centers=centers,cluster_std=0.4,random_state=0)
    datas=StandardScaler().fit_transform(datas)
    labs,cluster_id=dbscan(datas,eps=0.3,min_points=10)
    print("labels of my dbscan")
    print(labs)

    db=DBSCAN(eps=0.3,min_samples=10).fit(datas)
    skl_labels=db.labels_
    print("labs of sk-DBSCAN")
    print(skl_labels)
    draw_cluster(datas,labs,cluster_id)