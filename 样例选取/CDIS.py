import numpy as np

def decision_partition_data(data,labels):
# Obtain the decision classes.
    obj_num = len(labels)
    label_class = np.unique(labels)
    decision_class = {}
    labels_class = {}
    for i in range(len(label_class)):
        partition = (labels == label_class[i])
        decision_class[i] = data[partition]
        labels_class[i] = labels[partition]
    return decision_class, labels_class

def CDIS(data, labels, para_k):
    # Local Density-based Instance Selection algorithm. para_k is the parameter of partial k-neighborhood.
    decision_class, labels_class = decision_partition_data(data,labels)
    # decision_class is a list of each decision class, i.e. decision_class[k] is the decision class D_k.
    nom_num = 0  # nom_num is the cardinality of the selected data set
    sel_data = []
    sel_labels = []
    label_num = len(decision_class)
    for k in range(label_num):
        den_vec = []
        pkn_vec = []
        num = len(decision_class[k][:, 0])
        for i in range(num):
            xi = decision_class[k][i, :]
            mat = np.abs(xi[np.newaxis, :] - decision_class[k])
            abs_dis = np.sum(mat, axis=1)  # Absolute distances between x_i and other objects in D_k
            molecule = np.sum(1 / (1 + abs_dis))
            order_dis = np.argsort(abs_dis)
            pkn_xi = order_dis[1:para_k + 1]  # Partial k-neighborhood of x_i (excluding x_i)
            pkn_vec.extend(pkn_xi)
            cen_pkn = np.mean(decision_class[k][pkn_xi, :], axis=0)  # Centroid of pkn of x_i
            denominator = 1 + np.sum(np.abs(xi - cen_pkn))
            density_xi = molecule / denominator
            den_vec.append(density_xi)

        for i in range(num):
            res = np.sum(den_vec[i] < den_vec[pkn_vec[i]])
            if res == 0:
                sel_data.append(decision_class[k][i,:])
                sel_labels.append(labels_class[k][i])
    return sel_data,sel_labels