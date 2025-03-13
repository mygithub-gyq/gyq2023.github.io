from sklearn.cluster import KMeans
import numpy as np

def CIS(X, y, k, s):
    # Cluster-oriented Instance Selection algorithm
    kmeans = KMeans(n_clusters=k)
    Q = kmeans.fit_predict(X)
    S_indices = []
    for q in range(k):
        I_indices = np.where(Q == q)[0]
        n = len(I_indices)
        j = kmeans.cluster_centers_[q]
        distances = [np.linalg.norm(X[i] - j) for i in I_indices]
        sorted_indices = np.argsort(distances)
        center_indices = sorted_indices[:int(0.5*s * n)]
        border_indices = sorted_indices[-int(0.5*s * n):]
        S_indices.extend(I_indices[center_indices])
        S_indices.extend(I_indices[border_indices])
    S_indices = np.array(S_indices)
    return X[S_indices],y[S_indices]