import numpy as np
import operator

'''
    trainData - 训练集  N
    testData - 测试   1
    labels - 训练集标签
'''


def knn(trainData, testData, labels, k):
    # 计算训练样本的行数
    rowSize = trainData.shape[0]
    # 计算训练样本和测试样本的差值
    diff = np.tile(testData, (rowSize, 1)) - trainData
    # 计算差值的平方和
    sqrDiff = diff ** 2
    sqrDiffSum = sqrDiff.sum(axis=1)
    # 计算距离
    distances = sqrDiffSum ** 0.5
    # 对所得的距离从低到高进行排序
    sortDistance = distances.argsort()

    count = {}

    for i in range(k):
        vote = labels[sortDistance[i]]
        # print(vote)
        count[vote] = count.get(vote, 0) + 1
    # 对类别出现的频数从高到低进行排序
    sortCount = sorted(count.items(), key=operator.itemgetter(1), reverse=True)

    # 返回出现频数最高的类别
    return sortCount[0][0]


file_data = 'iris.data'

# 数据读取
data = np.loadtxt(file_data, dtype=float, delimiter=',', usecols=(0, 1, 2, 3))
lab = np.loadtxt(file_data, dtype=str, delimiter=',', usecols=(4))

# 分为训练集和测试集和
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

# 参数设定
k = 5
n_right = 0
for i in range(N_test):
    test = data_test[i, :]

    det = knn(data_train, test, lab_train, k)

    if det == lab_test[i]:
        n_right = n_right + 1

    print('Sample %d  lab_ture = %s  lab_det = %s' % (i, lab_test[i], det))

# 结果分析
print('Accuracy = %.2f %%' % (n_right * 100 / N_test))