import numpy as np
from scipy.spatial import KDTree


def NaN_Search(data):
    # Initialize parameters
    n = data.shape[0]
    r = 1
    tag = True

    NaN = [None] * n
    RN = np.zeros(n, dtype=int)
    KNN = [list() for _ in range(n)]
    RNN = [list() for _ in range(n)]

    # Build KDTree and find k-nearest neighbors for all points
    kdtree = KDTree(data)
    index = kdtree.query(data, k=n)[1]
    index = index[:, 1:]

    cnt = []

    while tag:
        # r-th round for search KNN and RNN
        KNN_idx = index[:, r - 1]

        # Compute RNN and KNN
        for i in range(n):
            RNN[KNN_idx[i]].append(i)
            KNN[i].append(KNN_idx[i])

        # Find positions where RNN is not empty
        pos = [i for i in range(n) if len(RNN[i]) > 0]
        RN[pos] = 1

        # Stopping condition
        cnt.append(np.sum(RN == 0))
        if r > 2 and cnt[r - 1] == cnt[r - 2]:
            tag = False
            r -= 1

        r += 1

    for i in range(n):
        NaN[i] = list(set(RNN[i]).intersection(KNN[i]))

    NaNE = r
    return NaN, NaNE


def NaNs_edit(data, t, NaNs):
    n = data.shape[0]
    subX = []
    Noiise_index = []

    for i in range(n):
        labels = np.append(t[NaNs[i]], t[i])
        self_label = t[i]
        if len(NaNs[i]) > 0:
            pos = np.where(labels != self_label)[0]
            NF = len(pos) / (len(NaNs[i]) + 1)
            if NF <= 0.5:
                subX.append(i)
            else:
                Noiise_index.append(i)

    data = data[subX, :]
    t = t[subX]

    return data, t, Noiise_index


def Internal_Selection(data, t, border, NaNs, NaNE):
    n = len(t)

    # Compute Nb: LSC
    Nb = np.array([len(NaNs[i]) + 1 for i in range(n)])

    # Sort by LSC in descending order
    index = np.argsort(Nb)[::-1]

    # Initialize clusters
    cluster = np.zeros(n, dtype=int)
    cluster_number = 0

    # Run clustering and representative point selection algorithm
    for i in range(n):
        idx = index[i]
        NNs = NaNs[idx]
        NNs_label = t[NNs]

        # Check if idx is a boundary sample
        tpos = np.intersect1d([idx], border)

        if cluster_number == 0:
            cluster_number += 1
            if len(tpos) == 0:  # Internal sample
                self_label = t[idx]
                cluster[idx] = cluster_number

                # condition1: NaNs of the same class
                tpos = np.where(NNs_label == self_label)[0]
                choosNN = np.array(NNs)[tpos]

                # condition2: Exclude border samples
                choosNN = np.setdiff1d(choosNN, border)

                # Form initial cluster with same class and non-border NaNs
                choosNN = choosNN.astype(int)
                cluster[choosNN] = cluster_number
        else:
            if cluster[idx] != 0:
                continue
            else:
                cluster_number += 1
                self_label = t[idx]
                cluster[idx] = cluster_number

                # condition1: NaNs of the same class
                tpos = np.where(NNs_label == self_label)[0]
                choosNN = np.array(NNs)[tpos]

                # condition2: Exclude border samples
                choosNN = np.setdiff1d(choosNN, border)

                # condition3: Unassigned samples
                haveClusterpos = np.where(cluster != 0)[0]
                choosNN = np.setdiff1d(choosNN, haveClusterpos)

                choosNN = choosNN.astype(int)
                cluster[choosNN] = cluster_number

        # Iterate to expand clusters and merge clusters
        pos2 = np.where(cluster == 0)[0]
        count = 1
        record = [len(pos2)]

        while True:
            for j in range(len(pos2)):
                id = pos2[j]
                id_label = t[id]
                NNs = NaNs[id]
                NNs_label = t[NNs]

                tpos = np.where(cluster[NNs] == cluster_number)[0]
                if len(tpos) >= (len(NNs) + 1) / 2:  # merge condition1
                    if id_label == self_label:  # merge condition2
                        cluster[id] = cluster_number

                        # condition1: Same class
                        tpos = np.where(NNs_label == self_label)[0]
                        choosNN = np.array(NNs)[tpos]

                        # condition2: Exclude border samples
                        choosNN = np.setdiff1d(choosNN, border)

                        # condition3: Unassigned samples
                        haveClusterpos = np.where(cluster != 0)[0]
                        choosNN = np.setdiff1d(choosNN, haveClusterpos)

                        choosNN = choosNN.astype(int)
                        cluster[choosNN] = cluster_number

            count += 1
            pos2 = np.where(cluster == 0)[0]
            record.append(len(pos2))

            if count > 1 and record[count - 1] == record[count - 2]:
                break

    # Select representative points for each cluster
    core = []
    coret = []

    unique_clusters = np.unique(cluster)
    for i in unique_clusters:
        if i != 0:
            pos = np.where(cluster == i)[0]
            if len(pos) > NaNE:
                core.append(np.mean(data[pos, :], axis=0))
                coret.append(np.unique(t[pos])[0])

    core = np.array(core)
    coret = np.array(coret)

    return core, coret


def Search_Boundary(data, t):
    n = data.shape[0]
    Degree_border = np.zeros(n)  # the border degree of each sample

    # NaN_Search
    NaNs, NaNE = NaN_Search(data)

    # Compute Border_Degree and Search for borderline samples
    border = []
    for i in range(n):
        self_label = t[i]
        Labels_NaNs = t[NaNs[i]]
        pos = np.where(Labels_NaNs != self_label)[0]
        Degree_border[i] = len(pos)  # compute Border_Degree
        if len(pos) > 0:
            border.append(i)

    border = np.array(border)

    # Compute sub_border
    S = []
    index = np.argsort(Degree_border[border])[::-1]
    for i in range(len(border)):
        idx = index[i]
        self_label = t[border[idx]]
        pos = np.intersect1d(S, NaNs[border[idx]])
        pos = pos.astype(int)  # Ensure pos is of integer type
        labels = t[pos]
        len_labels = np.sum(labels == self_label)
        if len_labels == 0:
            S.append(border[idx])

    sub_border = np.array(S)

    return border, sub_border, NaNs, NaNE


def LSNaNIS(data, t):
    # (1) LS_search
    NaNs, NaNE = NaN_Search(data)

    # (2) LSEdit
    data, t, subx = NaNs_edit(data, t, NaNs)

    # (3) LSBorder
    border, sub_border, NaNs, NaNE = Search_Boundary(data, t)

    # (4) LSCore
    core, coret = Internal_Selection(data, t, border, NaNs, NaNE)

    # (5) Form the final subsets
    SubX = np.unique(border)
    Subdata = np.vstack([data[SubX, :], core])
    Subt = np.concatenate([t[SubX], coret])

    return Subdata, Subt


# import pandas as pd
# from sklearn.model_selection import KFold
# from sklearn.metrics import accuracy_score
# from sklearn.neighbors import KNeighborsClassifier
#
# # Load wine dataset
# data = pd.read_csv(r'C:\Users\20583\Desktop\data\data\WBC.csv',
#                    header=None)
#
# # Separate features and labels
# t = data.iloc[:, -1].values
# data = data.iloc[:, :-1].values
#
# kf = KFold(n_splits=10, shuffle=True)
# accuracies = []
#
# for train_index, test_index in kf.split(data):
#     X_train, X_test = data[train_index], data[test_index]
#     y_train, y_test = t[train_index], t[test_index]
#
#     # 选择代表样例
#     Subdata, Subt = LSNaNIS(X_train, y_train)
#     print(len(Subdata))
#     # 训练模型
#     model = KNeighborsClassifier(n_neighbors=1)  # 示例使用 KNN 分类器
#     model.fit(Subdata, Subt)
#
#     # 预测和评估
#     predictions = model.predict(X_test)
#     accuracy = accuracy_score(y_test, predictions)
#     accuracies.append(accuracy)
#
# # 输出平均准确率
# print("Average accuracy:", np.mean(accuracies))