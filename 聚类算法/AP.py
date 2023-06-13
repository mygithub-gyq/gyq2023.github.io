from cProfile import label
import numpy as np
# from sklearn.datasets.samples_generator import make_blobs
import matplotlib.pyplot as plt


def compute_R(S, R, A, dampfac):
    # to_max = A+S
    to_max = A + R
    N = np.shape(to_max)[0]

    max_AS = np.zeros_like(S)
    for i in range(N):
        for k in range(N):
            if not i == k:
                temp = to_max[i, :].copy()
                temp[k] = -np.inf
                max_AS[i, k] = max(temp)
            else:
                temp = S[i, :].copy()
                temp[k] = -np.inf
                max_AS[i, k] = max(temp)

    return (1 - dampfac) * (S - max_AS) + dampfac * R


def compute_A(R, A, dampfac):
    max_R = np.zeros_like(R)
    N = np.shape(max_R)[0]

    for i in range(N):
        for k in range(N):
            max_R[i, k] = np.max([0, R[i, k]])

    min_A = np.zeros_like(A)

    for i in range(N):
        for k in range(N):
            if not i == k:
                temp = max_R[:, k].copy()
                temp[i] = 0
                min_A[i, k] = np.min([0, R[k, k] + np.sum(temp)])

            else:
                temp = max_R[:, k].copy()
                temp[k] = 0
                min_A[i, k] = np.sum(temp)

    return (1 - dampfac) * min_A + dampfac * A


def compute_S_init(datas, preference="median"):
    N, D = np.shape(datas)
    tile_x = np.tile(np.expand_dims(datas, 1), [1, N, 1])  # N, N,D
    tile_y = np.tile(np.expand_dims(datas, 0), [N, 1, 1])  # N, N,D
    S = -np.sum((tile_x - tile_y) * (tile_x - tile_y), axis=-1)
    indices = np.where(~np.eye(S.shape[0], dtype=bool))

    if preference == "median":
        m = np.median(S[indices])
    elif preference == "min":
        m = np.min(S[indices])
    elif type(preference) == np.ndarray:
        m = preference

    np.fill_diagonal(S, m)
    return S


def affinity_prop(datas, maxiter=100, preference='median', dampfac=0.7, display=False):
    # 判断更新前后 R+A是否有显著变化
    message_thresh = 1e-5

    # 判断聚类结果是否多轮不变
    local_thresh = 10

    # 计算S
    S = compute_S_init(datas, preference)

    # A 和 R 的初始化
    A = np.zeros_like(S)
    R = np.zeros_like(S)

    # 加上较小的值防止震荡
    S = S + 1e-12 * np.random.normal(size=A.shape) * (np.max(S) - np.min(S))

    count_equal = 0
    i = 0
    converged = False

    while i < maxiter:
        print(i)
        E_old = R + A
        labels_old = np.argmax(E_old, axis=1)

        R = compute_R(S, R, A, dampfac)
        A = compute_A(R, A, dampfac)

        E_new = R + A

        labels_cur = np.argmax(E_new, axis=1)

        # 判断更新前后 label是否一致
        if np.all(labels_cur == labels_old):
            count_equal += 1
        else:
            count_equal = 0

        if (message_thresh != 0 and np.allclose(E_old, E_new, atol=message_thresh)) or \
                (local_thresh != 0 and count_equal > local_thresh):
            converged = True
            break
        i = i + 1

        if display:
            plt.ion()
            E = R + A  # Pseudomarginals
            labels = np.argmax(E, axis=1)
            N_cluster = len(np.unique(labels).tolist())
            str_title = 'epoch %d N_cluster%d' % (i, N_cluster)
            cplot(datas, labels, str_title=str_title)
            plt.pause(0.1)
            plt.ioff()

    if converged:
        print("%d 轮后收敛." % (i))
    else:
        print("%d 轮后迭代结束" % (maxiter))

    E = R + A  # Pseudomarginals
    labels = np.argmax(E, axis=1)
    exemplars = np.unique(labels)
    centers = datas[exemplars]

    return labels, exemplars, centers


def cplot(datas, labels, str_title=""):
    plt.cla()
    index_center = np.unique(labels).tolist()

    colors = {}
    for i, each in zip(index_center, np.linspace(0, 1, len(index_center))):
        colors[i] = plt.cm.Spectral(each)

    N, D = np.shape(datas)
    for i in range(N):
        i_center = labels[i]
        center = datas[i_center]
        data = datas[i]

        color = colors[i_center]
        plt.plot([center[0], data[0]], [center[1], data[1]], color=color)
    plt.title(str_title)


if __name__ == "__main__":
    a = np.random.multivariate_normal([3, 3], [[.5, 0], [0, .5]], 50)
    b = np.random.multivariate_normal([0, 0], [[0.5, 0], [0, 0.5]], 50)
    c = np.random.multivariate_normal([3, 0], [[0.5, 0], [0, 0.5]], 50)
    d = np.random.multivariate_normal([0, 3], [[0.5, 0], [0, 0.5]], 50)
    data = np.r_[a, b, c, d]
    labels, exemplars, centers = affinity_prop(data, dampfac=0.7, preference='median', display=True)
    print(labels)

    cplot(data, labels)
    plt.show()