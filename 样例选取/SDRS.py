import numpy as np
from sklearn.neighbors import KNeighborsClassifier

def cosine_similarity_matrix(data):
    norm_data = data / np.linalg.norm(data, axis=1)[:, np.newaxis]
    return np.dot(norm_data, norm_data.T)

def sparsify_matrix(data, k, threshold):
    cosine_sim = cosine_similarity_matrix(data)
    n = data.shape[0]
    sparse_matrix = np.zeros((n, n))
    for i in range(n):
        sorted_indices = np.argsort(-cosine_sim[i])[1:k + 1]  # 排除自身
        for j in sorted_indices:
            if cosine_sim[i, j] > threshold[i]:
                sparse_matrix[i, j] = cosine_sim[i, j]
    return sparse_matrix

def compute_specificity(matrix):
    std_distances = np.std(matrix, axis=1)
    return std_distances

def select_representatives(sparse_matrix, y, k):
    unique_classes = np.unique(y)
    Usel_indices = []
    for cls in unique_classes:
        cls_indices = np.where(y == cls)[0]
        cls_X = sparse_matrix[cls_indices, :]
        result = []
        for i in range(len(cls_indices)):
            coveragei = np.count_nonzero(cls_X[i])
            specificityi = np.std(cls_X[i])
            cls_covi_speci = coveragei * specificityi
            result.append(cls_covi_speci)
        representative_index = cls_indices[np.argmax(result)]
        Usel_indices.append(representative_index)
    return Usel_indices


def iterative_selection(X, y, Usel_indices, sparse_matrix, k):
    U_indices = np.arange(len(X))
    U_minus_Usel_indices = np.setdiff1d(U_indices, Usel_indices)
    while len(U_minus_Usel_indices) > 0:
        for idx in U_minus_Usel_indices:
            y_idx = y[idx]
            nearest_neighbor_index = Usel_indices[np.argmax(sparse_matrix[idx, Usel_indices])]
            nearest_neighbor_label = y[nearest_neighbor_index]
            if y_idx == nearest_neighbor_label:
                U_minus_Usel_indices = np.delete(U_minus_Usel_indices, np.where(U_minus_Usel_indices == idx))
            else:
                Usel_indices.append(idx)
                U_minus_Usel_indices = np.delete(U_minus_Usel_indices, np.where(U_minus_Usel_indices == idx))
        if len(U_minus_Usel_indices) > 0:
            coverage = np.count_nonzero(X[U_minus_Usel_indices], axis=1)
            specificity = compute_specificity(X[U_minus_Usel_indices])
            max_score = coverage * specificity
            max_idx = U_minus_Usel_indices[np.argmax(max_score)]
            Usel_indices.append(max_idx)
            U_minus_Usel_indices = np.delete(U_minus_Usel_indices, np.where(U_minus_Usel_indices == max_idx))
        else:
            break
    return Usel_indices


def compute_threshold(similarity_matrix, k, alpha=0.5):
    n = similarity_matrix.shape[0]
    # 计算全局阈值
    global_threshold = np.mean(similarity_matrix)
    # 计算个性化阈值
    individual_thresholds = np.zeros(n)
    for i in range(n):
        sorted_indices = np.argsort(-similarity_matrix[i])[1:k + 1]  # 排除自身
        individual_thresholds[i] = np.mean(similarity_matrix[i, sorted_indices])
    # 组合阈值
    combined_thresholds = alpha * global_threshold + (1 - alpha) * individual_thresholds
    return combined_thresholds

def compute_accuracy_knn(train_data, test_data, train_labels, test_labels):
    knn = KNeighborsClassifier(n_neighbors=1)
    knn.fit(train_data, train_labels)
    acc = knn.score(test_data, test_labels)
    return acc


def optimal_sel_data(data, labels, test_data, test_labels, acc):
    max_acc = acc
    while True:
        acc_vec = []
        obj_num = len(data)
        for i in range(obj_num):
            sel = [j for j in range(obj_num) if j != i]
            now_data_X = data[sel]
            now_data_y = labels[sel]
            acc_1NN = compute_accuracy_knn(now_data_X, test_data, now_data_y, test_labels)
            acc_vec.append(acc_1NN)
        max_idx = acc_vec.index(max(acc_vec))
        max_acc_new = max(acc_vec)
        if max_acc_new > max_acc:
            data = np.delete(data, max_idx, axis=0)
            labels = np.delete(labels, max_idx, axis=0)
            max_acc = max_acc_new
        else:
            break
    opt_sel_data = data
    return opt_sel_data, max_acc

def SDRS(data, y, k):
    similarity_matrix = cosine_similarity_matrix(data)
    combined_thresholds = compute_threshold(similarity_matrix, k, alpha=0.5)
    sparse_matrix = sparsify_matrix(data, k, combined_thresholds)
    Usel_indices = select_representatives(sparse_matrix, y, k)
    Usel_indices = iterative_selection(data, y, Usel_indices, sparse_matrix, k)
    return data[Usel_indices],y[Usel_indices]