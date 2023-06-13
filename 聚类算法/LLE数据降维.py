import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_swiss_roll
from sklearn.manifold import LocallyLinearEmbedding
# x 维度 [N,D]

def cal_pairwise_dist(x):
    N, D = np.shape(x)
    dist = np.zeros([N, N])
    for i in range(N):
        for j in range(N):
            dist[i, j] = np.sqrt(np.dot((x[i] - x[j]), (x[i] - x[j]).T))
    # 返回任意两个点之间距离
    return dist
# 获取每个样本点的 n_neighbors个临近点的位置

def get_n_neighbors(data, n_neighbors=10):
    dist = cal_pairwise_dist(data)
    dist[dist < 0] = 0
    N = dist.shape[0]
    Index = np.argsort(dist, axis=1)[:, 1:n_neighbors + 1]
    return Index
# data : N,D
def lle(data, n_dims=2, n_neighbors=10):
    N, D = np.shape(data)
    if n_neighbors > D:
        tol = 1e-3
    else:
        tol = 0
    # 获取 n_neighbors个临界点的位置
    Index_NN = get_n_neighbors(data, n_neighbors)
    # 计算重构权重
    w = np.zeros([N, n_neighbors])
    for i in range(N):
        X_k = data[Index_NN[i]]  # [k,D]
        X_i = [data[i]]  # [1,D]
        I = np.ones([n_neighbors, 1])
        Si = np.dot((np.dot(I, X_i) - X_k), (np.dot(I, X_i) - X_k).T)
        # 为防止对角线元素过小
        Si = Si + np.eye(n_neighbors) * tol * np.trace(Si)
        Si_inv = np.linalg.pinv(Si)
        w[i] = np.dot(I.T, Si_inv) / (np.dot(np.dot(I.T, Si_inv), I))
    # 计算 W
    W = np.zeros([N, N])
    for i in range(N):
        W[i, Index_NN[i]] = w[i]
    I_N = np.eye(N)
    C = np.dot((I_N - W).T, (I_N - W))
    # 进行特征值的分解
    eig_val, eig_vector = np.linalg.eig(C)
    index_ = np.argsort(eig_val)[1:n_dims + 1]
    y = eig_vector[:, index_]
    return y
def scatter_3d(X, y):
    fig = plt.figure()
    ax = plt.axes(projection='3d')
    ax.scatter(X[:, 0], X[:, 1], X[:, 2], c=y, cmap=plt.cm.jet)
    ax.view_init(10, -70)
    ax.set_xlabel("$x_1$", fontsize=18)
    ax.set_ylabel("$x_2$", fontsize=18)
    ax.set_zlabel("$x_3$", fontsize=18)
    plt.show(block=False)
if __name__ == "__main__":
    X, Y = make_swiss_roll(n_samples=500)
    scatter_3d(X, Y)
    data_2d = lle(X, n_dims=2, n_neighbors=12)
    print(data_2d.shape)
    plt.figure()
    plt.title("my_LLE")
    plt.scatter(data_2d[:, 0], data_2d[:, 1], c=Y, cmap=plt.cm.jet)
    plt.show(block=False)
    data_2d_sk = LocallyLinearEmbedding(n_components=2, n_neighbors=12).fit_transform(X)
    plt.figure()
    plt.title("my_LLE_sk")
    plt.scatter(data_2d[:, 0], data_2d[:, 1], c=Y, cmap=plt.cm.jet)
    plt.show()