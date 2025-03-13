import numpy as np

def ICF(X, y):
    sel_data = []
    sel_labels = []
    decision_class = decision_partition_data1(X, y)
    label_num = len(decision_class)

    for k in range(label_num):
        lambda_vec = []
        num = len(decision_class[k][0])
        for i in range(num):
            x_i = decision_class[k][0][i, :]
            temp = []
            for kk in range(k):
                mat = np.abs(x_i[np.newaxis, :] - decision_class[kk][0])
                abs_dis = np.sum(mat, axis=1)
                lambda_val = np.min(abs_dis)
                temp.append(lambda_val)
            for mk in range(k+1, label_num):
                mat = np.abs(x_i[np.newaxis, :] - decision_class[mk][0])
                abs_dis = np.sum(mat, axis=1)
                lambda_val = np.min(abs_dis)
                temp.append(lambda_val)
            lambda_i = np.min(temp)
            lambda_vec.append(lambda_i)
        decision_class[k] = (decision_class[k][0], decision_class[k][1], np.array(lambda_vec))  # Update with lambda values

    for k in range(label_num):
        num = len(decision_class[k][0])
        cover_mat = []
        for i in range(num):
            x_i = decision_class[k][0][i, :]
            mat = np.abs(x_i[np.newaxis, :] - decision_class[k][0])
            cover = (np.sum(mat, axis=1) < decision_class[k][2][i])  # Use lambda values
            cover_mat.append(cover)
        decision_class[k] = (decision_class[k][0], decision_class[k][1], decision_class[k][2], np.array(cover_mat))  # Update with cover_mat

    for k in range(label_num):
        num = len(decision_class[k][0])
        cov = decision_class[k][3]
        for i in range(num):
            cov_num = np.sum(cov[i, :])
            reach_num = np.sum(cov[:, i])
            if reach_num <= cov_num:
                sel_data.append(decision_class[k][0][i, :])
                sel_labels.append(y[np.where((X == decision_class[k][0][i, :]).all(axis=1))[0][0]])

    return np.array(sel_data), np.array(sel_labels)

def decision_partition_data1(X, y):
    labels = np.unique(y)
    decision_class = []
    for label in labels:
        partition = (y == label)
        partition_data = X[partition]
        lambda_values = np.zeros(len(partition_data))
        decision_class.append((partition_data, lambda_values))  # Append lambda values
    return decision_class
