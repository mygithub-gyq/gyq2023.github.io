import numpy as np

def ENN(X, y, para_k):
    # Edited Nearest Neighbor Algorithm
    obj_num = X.shape[0]
    selected_indices = []
    selected_data = []
    selected_labels = []

    for i in range(obj_num):
        x = X[i, :]
        S = np.delete(X, i, axis=0)
        mat = np.abs(x - S[:, :])
        abs_dis = np.sum(mat, axis=1)
        ind = np.argsort(abs_dis)
        knn = ind[:para_k]
        if np.sum(y[knn] == y[i]) > para_k // 2:
            selected_indices.append(i)
            selected_data.append(x)
            selected_labels.append(y[i])

    return np.array(selected_data), np.array(selected_labels)