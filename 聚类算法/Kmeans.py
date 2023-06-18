import numpy as np
import matplotlib.pyplot as plt

def creat_centers(dataset,K):
    val_max=np.max(dataset,axis=0)
    val_min=np.min(dataset,axis=0)
    centers=np.linspace(val_min,val_max,K+2)
    return centers[1:-1,:]


def draw_kmeans(dataset, lab, centers, dic_colors=None, name="0.jpg"):

    plt.cla()
    vals_lab = set(lab.tolist())

    for i, val in enumerate(vals_lab):
        index = np.where(lab == val)[0]
        sub_dataset = dataset[index, :]
        plt.scatter(sub_dataset[:, 0], sub_dataset[:, 1], s=16., color=dic_colors[i])

    for i in range(np.shape(centers)[0]):
        plt.scatter(centers[i, 0], centers[i, 1], color="k", marker="+", s=200.)
    plt.show()
    plt.savefig(name)
    

def kmeans(dataset,K,m=20,dic_colors=None,b_draw=False):

    N,D=np.shape(dataset)
    centers=creat_centers(dataset,K)

    lab = np.zeros(N)
    if b_draw:
        draw_kmeans(dataset, lab, centers, dic_colors, name="int.jpg")

    labs=np.zeros(N)
    for it in range(m):
        distance=np.zeros([N,K])
        for k in range(K):
            center=centers[k,:]
            diff=np.tile(center,(N,1))-dataset
            sqrdiff=diff**2
            sqrdiffsum=sqrdiff.sum(axis=1)
            distance[:,k]=sqrdiffsum**0.5

        labs_new = np.argmin(distance, axis=1)
        error = np.sum(np.min(distance, axis=1)) / N
        print("第 %d 次聚类 距离误差 %.2f" % (it, error))

        if b_draw:
            draw_kmeans(dataset, labs_new, centers,
                        dic_colors, name=str(it) + "_oldcenter.jpg")

        for k in range(K):
            index = np.where(labs_new==k)[0]
            centers[k, :] = np.mean(dataset[index, :], axis=0)

        if b_draw:
            draw_kmeans(dataset, labs_new, centers,
                        dic_colors, name=str(it) + "_newcenter.jpg")

        if np.sum(labs_new - labs) == 0:
            return labs_new
        else:
            labs = labs_new
    return labs

if __name__ == '__main__':
    a = np.random.multivariate_normal([2, 2], [[.5, 0], [0, .5]], 100)
    b = np.random.multivariate_normal([0, 0], [[0.5, 0], [0, 0.5]], 100)
    dataset = np.r_[a, b]
    lab_ture = np.r_[np.zeros(100), np.ones(100)].astype(int)
    dic_colors = {0: (0., 0.5, 0.), 1: (0.8, 0, 0)}
    labs =kmeans(dataset, K=2, m=20, dic_colors=dic_colors, b_draw=True)