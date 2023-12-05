import numpy as np
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
# 聚类中心个数
n_centers = 2
# 模糊参数
m = 2
# 最大迭代次数
max_iter = 100
data = np.loadtxt(r"E:\soft\Programs\Python\Python310\data.txt", delimiter=',')
X = data[:, :-1]
labels=data[:,-1]
v = np.mean(X, axis=0)
centers, U = FCM_train(X, n_centers, m, max_iter)
c=centers[:,1][:-1]
u = U[labels == 1, :]
alpha = 0.0
gamma = 0.0
def f11(a, v, u, gamma):
    sum_concept = np.sum(np.where((a <= v) & (v <= u), u, 0))
    sum_not_concept = np.sum(np.where((a <= v) & (v > u), u, 0))
    return np.maximum(0, sum_concept - gamma * sum_not_concept)
def f12(a_opt, v, alpha):
    return np.exp(-alpha * np.abs(v - a_opt))
def f21(b, v, u, gamma):
    sum_concept = np.sum(np.where((v <= b) & (u == 1), u, 0))
    sum_not_concept = np.sum(np.where((v <= b) & (u == 0), u, 0))
    return np.maximum(0, sum_concept - gamma * sum_not_concept)
def f22(b_opt, v, alpha):
    return np.exp(-alpha * np.abs(v - b_opt))
def opt_a(v, u, c, alpha, gamma):
    max_val = -np.inf
    opt_a_val = None
    for a in v:
        f1_val = f11(a, v, u, gamma)
        f2_val = f12(a, v, alpha)
        opt_val = f1_val * f2_val
        if opt_val > max_val:
            max_val = opt_val
            opt_a_val = a
    return opt_a_val
def opt_b(v, u, c, alpha, gamma):
    max_val = -np.inf
    opt_b_val = None
    for b in v:
        f1_val = f21(b, v, c, gamma)
        f2_val = f22(b, v, alpha)
        opt_val = f1_val * f2_val
        if opt_val > max_val:
            max_val = opt_val
            opt_b_val = b
    return opt_b_val

def T(x, a, b_bar, b):
    if x >= b_bar and x <= b:
        return (b - x) / (b - b_bar)
    elif x >= a and x < b_bar:
        return (x - a) / (b_bar - a)
    else:
        return 0

def compute_coverage(v, a_opt, b_bar_opt, b_opt):
    G = np.zeros((v.shape[0], len(a_opt)))
    for i in range(len(a_opt)):
        for j in range(v.shape[0]):
            G[j, i] = T(v[j], a_opt[i], b_bar_opt[i], b_opt[i])
    coverage = np.mean(np.max(G, axis=1))
    return coverage

def compute_specificity(v, a_opt, b_bar_opt, b_opt):
    specificity = np.zeros(len(a_opt))
    for i in range(len(a_opt)):
        length = np.sum([T(x, a_opt[i], b_bar_opt[i], b_opt[i]) for x in v])
        range_j = b_opt[i] - a_opt[i]
        specificity[i] = 1 - length / range_j
    avg_specificity = np.mean(specificity)
    return avg_specificity
a_opt=opt_a(v, u, c, alpha, gamma)
b_opt=opt_b(v, u, c, alpha, gamma)
b_bar_opt=(a_opt+b_opt)/2
coverage_val = compute_coverage(v, a_opt, b_bar_opt, b_opt)
specificity_val = compute_specificity(v, a_opt, b_bar_opt, b_opt)
print("coverage:", coverage_val)
print("specificity:", specificity_val)