import numpy as np
from matplotlib import pyplot as plt
# 计算N个样本，到C个中心的距离
#  X ： [N,D]
#  Centers :  [C,D]
# 返回 [N,C] 两两之间的距离
def FCM_dist(X, Centers):
    N, D = np.shape(X)
    C, D = np.shape(Centers)
    tile_x = np.tile(np.expand_dims(X, 1), [1, C, 1])
    tile_centers = np.tile(np.expand_dims(Centers, axis=0), [N, 1, 1])
    dist = np.sum((tile_x - tile_centers) ** 2, axis=-1)
    return np.sqrt(dist)
# 获取新的聚类中心
# U 关系矩阵 [N,C]
# X 输入数据 [N,D]
# 返回新的聚类中心 [C,D]

def FCM_getCenters(U, X, m):
    N, D = np.shape(X)
    N, C = np.shape(U)

    um = U ** m

    tile_X = np.tile(np.expand_dims(X, 1), [1, C, 1])
    tile_um = np.tile(np.expand_dims(um, -1), [1, 1, D])
    temp = tile_X * tile_um

    new_C = np.sum(temp, axis=0) / np.expand_dims(np.sum(um, axis=0), axis=-1)

    return new_C


# 更新关系矩阵
# X : [N,D]
# Centers : [C,D]
# 返回
# U ：[N,C]

def FCM_getU(X, Centers, m):
    N, D = np.shape(X)
    C, D = np.shape(Centers)

    temp = FCM_dist(X, Centers) ** float(2 / (m - 1))

    tile_temp = np.tile(np.expand_dims(temp, 1), [1, C, 1])

    denominator_ = np.expand_dims(temp, -1) / tile_temp

    return 1 / np.sum(denominator_, axis=-1)


def FCM_train(X, n_centers, m, max_iter=100, theta=1e-5, seed=0):
    rng = np.random.RandomState(seed)
    N, D = np.shape(X)

    # 随机初始化关系矩阵
    U = rng.uniform(size=(N, n_centers))
    # 保证每行和为1
    U = U / np.sum(U, axis=1, keepdims=True)

    # 开始迭代
    for i in range(max_iter):
        print(i)
        U_old = U.copy()
        centers = FCM_getCenters(U, X, m)
        U = FCM_getU(X, centers, m)

        # 两次关系矩阵距离过小，结束训练
        if np.linalg.norm(U - U_old) < theta:
            break

    return centers, U


def FCM_getClass(U):
    return np.argmax(U, axis=-1)


def FCM_partition_coefficient(U):
    return np.mean(U ** 2)


def FCM_partition_entropy_coefficient(U):
    return -np.mean(U * np.log2(U))


if __name__ == "__main__":

    # 简单测试
    N = 3000

    X = np.concatenate((
        np.random.normal((-2, -2), size=(N, 2)),
        np.random.normal((2, 2), size=(N, 2))
    ))

    n_centers = 2
    m = 2
    centers, U = FCM_train(X, n_centers, m, max_iter=100, theta=1e-5, seed=0)

    labels = FCM_getClass(U)
    print(labels)
    f, axes = plt.subplots(1, 2, figsize=(11, 5))
    axes[0].scatter(X[:, 0], X[:, 1], alpha=.1)
    axes[1].scatter(X[:, 0], X[:, 1], c=labels, alpha=.1)
    axes[1].scatter(centers[:, 0], centers[:, 1], marker="+", s=500, c='w')

    plt.show()

    # 测试聚类效果
    n_samples = 3000

    X = np.concatenate((
        np.random.normal((-2, -2), size=(n_samples, 2)),
        np.random.normal((2, 2), size=(n_samples, 2)),
        np.random.normal((9, 0), size=(n_samples, 2)),
        np.random.normal((5, -8), size=(n_samples, 2))
    ))

    list_n_centers = [2, 3, 4, 5, 6, 7]
    rows = 2
    cols = 3
    f, axes = plt.subplots(rows, cols, figsize=(16, 11))

    for n_centers, axe in zip(list_n_centers, axes.ravel()):
        m = 2
        centers, U = FCM_train(X, n_centers, m, max_iter=100, theta=1e-5, seed=0)
        labels = FCM_getClass(U)
        PC = FCM_partition_coefficient(U)
        PCE = FCM_partition_entropy_coefficient(U)

        axe.scatter(X[:, 0], X[:, 1], c=labels, alpha=.1)
        axe.scatter(centers[:, 0], centers[:, 1], marker="+", s=500, c='b')

        axe.set_title("n_clusters = %d PC = %.3f PCE = %.3f" % (n_centers, PC, PCE))

    plt.show()