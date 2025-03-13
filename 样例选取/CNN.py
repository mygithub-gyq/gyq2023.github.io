import numpy as np

def decision_partition_data(data,labels):
    obj_num = len(labels)
    label_class = np.unique(labels)
    decision_class = {}
    labels_class = {}
    for i in range(len(label_class)):
        partition = (labels == label_class[i])
        decision_class[i] = data[partition]
        labels_class[i] = labels[partition]
    return decision_class, labels_class

def CNN(data,labels):
    # Condensed Nearest Neighbor Algorithm
    decision_class, labels_class = decision_partition_data(data,labels)
    nom_num = 0  # nom_num is the cardinality of the selected data set
    S = []  # Initialize condensed set
    S_lab = []  # Initialize condensed set
    for k in range(len(decision_class)):
        S.append(decision_class[k][0])
        # Append the first element of each decision class to S
        S_lab.append(labels_class[k][0])
    obj_num = len(labels)

    for i in range(obj_num):
        xi = data[i, :]  # Extract features of the current object
        mat = np.abs(xi - S)  # Calculate absolute differences
        abs_dis = np.sum(mat, axis=1)  # Calculate absolute distances
        ind = np.argmin(abs_dis)  # Find the index of the nearest neighbor in S
        if S_lab[ind] != labels[i]:  # Check if the classes of the current object and its nearest neighbor in S are different
            S.append(data[i,:])  # Add the current object to S
            S_lab.append(labels[i])

    return S,S_lab
