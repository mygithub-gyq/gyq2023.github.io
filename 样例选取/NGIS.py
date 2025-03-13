import numpy as np
from sklearn.neighbors import KDTree

def cosine_similarity_matrix(data):
    norm_data = data / np.linalg.norm(data, axis=1)[:, np.newaxis]
    return norm_data


def compute_specificity(matrix):
    max_distances = np.max(matrix, axis=1)
    return np.exp(-0 * max_distances)


def find_turning_point(values):
    values_sorted = np.sort(values)
    n = len(values_sorted)
    DN = int(np.sqrt(n))
    mu = np.diff(values_sorted)
    mu_selected = mu[-DN + 1:-1]
    theta = (np.sum(np.abs(np.diff(mu_selected))) / (DN - 2))
    kp = []
    for i in range(n - DN + 1, n - 2):
        if abs(mu[i + 1] - mu[i]) >= theta:
            kp.append(i)
    return np.min(kp)


def sparsify_matrix(data, k, kp_threshold):
    norm_data = cosine_similarity_matrix(data)
    n = data.shape[0]
    tree = KDTree(norm_data)
    sparse_matrix = np.zeros((n, n))
    for i in range(n):
        distances, indices = tree.query(norm_data[i:i + 1], k=k + 1)
        indices = indices[0][1:]
        distances = distances[0][1:]
        for j, idx in enumerate(indices):
            if distances[j] > kp_threshold:
                sparse_matrix[i, idx] = 1
    return sparse_matrix

def compute_threshold(similarity_matrix, k):
    n = similarity_matrix.shape[0]
    kth_similarities = np.zeros(n)
    for i in range(n):
        sorted_similarities = np.sort(similarity_matrix[i])[::-1][1:k + 1]
        kth_similarities[i] = sorted_similarities[-1]
    kp_idx = find_turning_point(kth_similarities)
    kp_threshold = kth_similarities[kp_idx] if kp_idx is not None else np.min(kth_similarities)
    return kp_threshold


def NGIS(data, y, k):
    final_indices = []
    norm_data = cosine_similarity_matrix(data)
    tree = KDTree(norm_data)
    kp_threshold = compute_threshold(norm_data, k)
    sparse_matrix = sparsify_matrix(data, k, kp_threshold)
    while np.count_nonzero(sparse_matrix) > 0:
        coverage = np.count_nonzero(sparse_matrix, axis=1)
        specificity = compute_specificity(sparse_matrix)
        max_values = coverage * specificity
        max_idx = np.argmax(max_values)
        final_indices.append(max_idx)
        selected_row = sparse_matrix[max_idx]
        covered_indices = np.where(selected_row > 0)[0]
        sparse_matrix[max_idx] = 0
        sparse_matrix[covered_indices, :] = 0
        sparse_matrix[:, covered_indices] = 0
    return data[final_indices], y[final_indices]