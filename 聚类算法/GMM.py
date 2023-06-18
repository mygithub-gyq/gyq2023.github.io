import numpy as np
import matplotlib.pyplot as plt
from kmeans import run_kmeans


# GMM 参数初始化
# dataset：[N,D] 训练数据
# K ：高斯成分的个数
def inti_GMM(dataset, K):
    N, D = np.shape(dataset)
    val_max = np.max(dataset, axis=0)
    val_min = np.min(dataset, axis=0)
    centers = np.linspace(val_min, val_max, num=K + 2)

    mus = centers[1:-1, :]
    sigmas = np.array([0.5 * np.eye(D) for i in range(K)])
    ws = 1.0 / K * np.ones(K)

    return mus, sigmas, ws


# 计算一个高斯的pdf
# x: 数据 [N,D]
# sigma 方差 [D,D]
# mu 均值 [1,D]
def getPdf(x, mu, sigma, eps=1e-12):
    N, D = np.shape(x)

    if D == 1:
        sigma = sigma + eps
        A = 1.0 / (sigma)
        det = np.fabs(sigma[0])
    else:
        sigma = sigma + eps * np.eye(D)
        A = np.linalg.inv(sigma)
        det = np.fabs(np.linalg.det(sigma))

    # 计算系数
    factor = (2.0 * np.pi) ** (D / 2.0) * (det) ** (0.5)

    # 计算 pdf
    dx = x - mu
    pdf = [(np.exp(-0.5 * np.dot(np.dot(dx[i], A), dx[i])) + eps) / factor for i in range(N)]
    return pdf


def train_GMM_step(dataset, mus, sigmas, ws):
    N, D = np.shape(dataset)
    K, D = np.shape(mus)
    # 计算样本在每个成分上的pdf
    pdfs = np.zeros([N, K])
    for k in range(K):
        pdfs[:, k] = getPdf(dataset, mus[k], sigmas[k])

    # 获取r
    r = pdfs * np.tile(ws, (N, 1))
    r_sum = np.tile(np.sum(r, axis=1, keepdims=True), (1, K))
    r = r / r_sum

    # 进行参数的更新
    for k in range(K):
        r_k = r[:, k]
        N_k = np.sum(r_k)
        r_k = r_k[:, np.newaxis]  # [N,1]

        # 更新mu
        mu = np.sum(dataset * r_k, axis=0) / N_k  # [D,1]

        # 更新sigma
        dx = dataset - mu
        sigma = np.zeros([D, D])
        for i in range(N):
            sigma = sigma + r_k[i, 0] * np.outer(dx[i], dx[i])
        sigma = sigma / N_k

        # 更新w
        w = N_k / N
        mus[k] = mu
        sigmas[k] = sigma
        ws[k] = w
    return mus, sigmas, ws


def train_GMM(dataset, K=2, m=10):
    mus, sigmas, ws = inti_GMM(dataset, K)

    for i in range(m):
        # print("Step ",i)
        mus, sigms, ws = train_GMM_step(dataset, mus, sigmas, ws)
    return mus, sigms, ws


def getlogPdfFromeGMM(datas, mus, sigmas, ws):
    N, D = np.shape(datas)
    K, D = np.shape(mus)

    weightedlogPdf = np.zeros([N, K])

    for k in range(K):
        temp = getPdf(datas, mus[k], sigmas[k], eps=1e-12)
        weightedlogPdf[:, k] = np.log(temp) + np.log(ws[k])

    return weightedlogPdf, np.sum(weightedlogPdf, axis=1)


def clusterByGMM(datas, mus, sigmas, ws):
    weightedlogPdf, _ = getlogPdfFromeGMM(datas, mus, sigmas, ws)
    labs = np.argmax(weightedlogPdf, axis=1)
    return labs


def draw_cluster(dataset, lab, dic_colors, name="0.jpg"):
    plt.cla()
    vals_lab = set(lab.tolist())

    for i, val in enumerate(vals_lab):
        index = np.where(lab == val)[0]
        sub_dataset = dataset[index, :]
        plt.scatter(sub_dataset[:, 0], sub_dataset[:, 1], s=16., color=dic_colors[i])

    plt.savefig(name)


if __name__ == "__main__":
    '''
        聚类测试 1  随机数据  GMM 与Kmeans 的比较
    '''
    dic_colors = {0: (0., 0.5, 0.), 1: (0.8, 0, 0)}
    a = np.random.multivariate_normal([2, 2], [[.5, 0], [0, .5]], 100)
    b = np.random.multivariate_normal([0, 0], [[0.5, 0], [0, 0.5]], 100)
    dataset = np.r_[a, b]
    lab_ture = np.r_[np.zeros(100), np.ones(100)].astype(int)

    # 训练GMM
    mus, sigmas, ws = train_GMM(dataset, K=2, m=10)
    print(mus)
    print(sigmas)
    print(ws)
    # 进行聚类
    labs_GMM = clusterByGMM(dataset, mus, sigmas, ws)
    # k-menas 比较
    labs_kmeans = run_kmeans(dataset, K=2, m=20)
    # 画结果
    draw_cluster(dataset, lab_ture, dic_colors, name="c_ture1.jpg")
    draw_cluster(dataset, labs_GMM, dic_colors, name="c_GMM1.jpg")
    draw_cluster(dataset, labs_kmeans, dic_colors, name="c_kmeans1.jpg")

    '''
        聚类测试 2  特定数据下 GMM 与 kmeans 的比较
    '''
    with open('Clustering_gmm.csv', 'r', encoding="utf-8") as f:
        lines = f.read().splitlines()[1:]
    lines = [line.split(",") for line in lines]
    dataset = np.array(lines).astype(np.float32)
    lab_ture = np.ones(np.shape(dataset)[0])
    dic_colors = {0: (0., 0.5, 0.), 1: (0.8, 0, 0), 2: (0.5, 0.5, 0), 3: (0, 0.5, 0.5)}

    # 训练GMM
    mus, sigmas, ws = train_GMM(dataset, K=4, m=100)

    # 进行聚类
    labs_GMM = clusterByGMM(dataset, mus, sigmas, ws)

    # k-menas 比较
    labs_kmeans = run_kmeans(dataset, K=4, m=20)

    # 画结果
    draw_cluster(dataset, lab_ture, dic_colors, name="c_ture2.jpg")
    draw_cluster(dataset, labs_GMM, dic_colors, name="c_GMM2.jpg")
    draw_cluster(dataset, labs_kmeans, dic_colors, name="c_kmeans2.jpg")

    '''
        分类测试  利用GMM 对iris 数据集进行分类
    '''
    file_data = 'iris.data'
    # 数据读取
    data = np.loadtxt(file_data, dtype=np.float32, delimiter=',', usecols=(0, 1, 2, 3))
    lab = np.loadtxt(file_data, dtype=str, delimiter=',', usecols=(4))

    # 分为训练集和测试集
    N = 150
    N_train = 100
    N_test = 50
    perm = np.random.permutation(N)

    index_train = perm[:N_train]
    index_test = perm[N_train:]

    data_train = data[index_train, :]
    lab_train = lab[index_train]

    data_test = data[index_test, :]
    lab_test = lab[index_test]

    # 获取 训练标签类型
    unique_labs = np.unique(lab_train).tolist()
    models = {}

    # 进行GMM 训练，为每类数据训练一个GMM
    for lab in unique_labs:
        # 进行数据筛选
        index = np.where(lab_train == lab)[0]
        dataset = data_train[index, :]

        # 利用训练的数据训练 GMM
        mus, sigmas, ws = train_GMM(dataset, K=2, m=20)
        models[lab] = {}
        models[lab]["ws"] = ws
        models[lab]["mus"] = mus
        models[lab]["sigmas"] = sigmas

    # 进测试
    pdfs = np.zeros([N_test, len(unique_labs)])
    index2lab = {}
    # 计算每条测试数据在不同GMM上的logpdf
    for i, lab in enumerate(unique_labs):
        index2lab[i] = lab
        ws = models[lab]["ws"]
        mus = models[lab]["mus"]
        sigmas = models[lab]["sigmas"]
        # 计算每条测试数据在这个GMM上的pdf
        _, pdf = getlogPdfFromeGMM(data_test, mus, sigmas, ws)
        pdfs[:, i] = pdf

    # 选取最大似然值 实现分类
    det_labs_index = np.argmax(pdfs, axis=1).tolist()

    # 将分类结果转为字符串
    det_labs_str = [index2lab[i] for i in det_labs_index]

    # 进行测试结果输出并统计准确率

    N_right = 0
    for i, lab_str in enumerate(det_labs_str):
        print("测试数据 %d 真实标签 %s 检测标签 %s" % (i, lab_test[i], lab_str))

        if lab_str == lab_test[i]:
            N_right = N_right + 1

    print("准确率为 %.2f%%" % (N_right * 100 / N_test))
    print(models)