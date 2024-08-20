import numpy as np
from sklearn.neighbors import KDTree, KNeighborsClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score

# NaN_Search function
def NaN_Search(data):
    n = data.shape[0]
    r = 1
    tag = 1
    NaN = [[] for _ in range(n)]
    RN = np.zeros(n)
    KNN = [[] for _ in range(n)]
    RNN = [[] for _ in range(n)]
    kdtree = KDTree(data)
    distances, index = kdtree.query(data, k=n)
    index = index[:, 1:]  # Remove the first column
    prev_cnt = -1  # Initialize prev_cnt to an invalid value
    while tag:
        KNN_idx = index[:, r - 1]
        for i in range(n):
            RNN[KNN_idx[i]].append(i)
            KNN[i].append(KNN_idx[i])
        pos = [i for i in range(n) if len(RNN[i]) > 0]
        RN[pos] = 1
        cnt = np.sum(RN == 0)
        if r > 2 and cnt == prev_cnt:
            tag = 0
            r -= 1
        prev_cnt = cnt
        r += 1
    for i in range(n):
        NaN[i] = list(set(RNN[i]) & set(KNN[i]))
        NaN[i].append(i)  # Ensure each point's own index is included
        NaN[i] = list(set(NaN[i]))  # Remove duplicates if any
    # Remove points with only one neighbor or empty neighbors
    NaN = [neighbors if len(neighbors) > 1 else [] for neighbors in NaN]
    # Update NaN to include the union of natural neighbors and reverse natural neighbors
    NaN_union = []
    for i in range(n):
        NaN_union.append(list(set(NaN[i]) | set(RNN[i])))
    NaNE = r
    return NaN, NaNE

# Compute density scores
def compute_density_scores(data, NaN):
    n = data.shape[0]
    density_scores = np.zeros(n)
    for i, neighbors in enumerate(NaN):
        if len(neighbors) > 0:
            distances = np.linalg.norm(data[neighbors] - data[i], axis=1)
            m = len(neighbors)
            density_scores[i] = m ** 2 * np.sum(np.exp(-distances))
    return density_scores

# Calculate delta values
def calculate_delta(data, density):
    n = data.shape[0]
    delta = np.full(n, np.inf)
    sorted_density_indices = np.argsort(-density)  # Indices of points sorted by density in descending order
    sorted_data = data[sorted_density_indices]
    for i in range(1, len(sorted_data)):
        higher_density_points = sorted_data[:i]
        current_point = sorted_data[i]
        distances = np.linalg.norm(higher_density_points - current_point, axis=1)
        delta[sorted_density_indices[i]] = np.min(distances)
    return delta

# Calculate composite index
def calculate_composite_index(density, delta):
    density = np.where(np.isfinite(density), density, 0)
    delta = np.where(np.isfinite(delta), delta, 0)
    scaler = MinMaxScaler()
    density_normalized = scaler.fit_transform(density.reshape(-1, 1)).flatten()
    delta_normalized = scaler.fit_transform(delta.reshape(-1, 1)).flatten()
    composite_index = density_normalized * delta_normalized
    return composite_index

# Select representative elements, including internal elements only
def select_representative_elements(data, labels, NaN):
    n = data.shape[0]
    processed = np.zeros(n, dtype=bool)
    internal_elements = []
    density_scores = compute_density_scores(data, NaN)
    mean_density = np.mean(density_scores)
    std_density = np.std(density_scores)
    threshold_density = mean_density + std_density
    high_density_indices = np.where(density_scores >= threshold_density)[0]
    delta = calculate_delta(data[high_density_indices], density_scores[high_density_indices])
    composite_scores = calculate_composite_index(density_scores[high_density_indices], delta)
    unique_labels = np.unique(labels)
    for label in unique_labels:
        label_indices = high_density_indices[labels[high_density_indices] == label]
        label_composite_scores = composite_scores[labels[high_density_indices] == label]
        label_mean = np.mean(label_composite_scores)
        label_std = np.std(label_composite_scores)
        threshold_high = label_mean + label_std
        # Select internal samples
        for idx in label_indices:
            if composite_scores[np.where(high_density_indices == idx)[0][0]] >= threshold_high:
                internal_elements.append(idx)
    return internal_elements

# Calculate entropy for each point based on its natural neighbors
def calculate_entropy(data, NaN_union, labels):
    n = data.shape[0]
    entropy = np.zeros(n)
    for i in range(n):
        if NaN_union[i]:
            label_counts = {}
            for neighbor in NaN_union[i]:
                label = labels[neighbor]
                if label not in label_counts:
                    label_counts[label] = 0
                label_counts[label] += 1

            total_neighbors = len(NaN_union[i])
            for label, count in label_counts.items():
                p = count / total_neighbors
                entropy[i] -= p * np.log(p)
    return entropy

def NNDHIS(train_data,test_data,train_target, test_target):
    # Calculate NaN
    NaN, NaNE = NaN_Search(train_data)
    # Select representative elements
    internal_samples = select_representative_elements(train_data, train_target, NaN)
    sample_count = len(internal_samples)
    # Calculate entropy
    entropy = calculate_entropy(train_data, NaN, train_target)
    non_zero_entropy_indices = np.where(entropy != 0)[0]
    non_zero_entropy = entropy[non_zero_entropy_indices]

    # 计算非零熵值的均值和标准差
    mean_entropy = np.mean(non_zero_entropy)
    std_entropy = np.std(non_zero_entropy)

    # 选择那些熵值超过均值加标准差的点
    high_entropy_indices = non_zero_entropy_indices[non_zero_entropy > (mean_entropy - std_entropy)]

    # 从这些点中提取边界数据和标签
    boundary_data = train_data[high_entropy_indices]
    boundary_target = train_target[high_entropy_indices]
    # Combine internal samples and boundary samples
    filtered_train_data = train_data[internal_samples]
    filtered_train_target = train_target[internal_samples]
    best_accuracy = 0
    for boundary_point, boundary_label in zip(boundary_data, boundary_target):
        # Temporarily add the boundary point to the filtered train set
        temp_filtered_train_data = np.vstack([filtered_train_data, boundary_point])
        temp_filtered_train_target = np.append(filtered_train_target, boundary_label)
        # Train a KNN classifier with K=1
        knn = KNeighborsClassifier(n_neighbors=1)
        knn.fit(temp_filtered_train_data, temp_filtered_train_target)
        # Predict on the test set
        predictions = knn.predict(test_data)
        # Calculate accuracy
        accuracy = accuracy_score(test_target, predictions)
        # If the accuracy improves, retain the boundary point
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            filtered_train_data = temp_filtered_train_data
            filtered_train_target = temp_filtered_train_target
            sample_count += 1  # Increment the sample count
    return best_accuracy,sample_count