import numpy as np
from sklearn.metrics import accuracy_score
from math import sqrt
import pandas as pd
from sklearn.cluster import KMeans


# 数据加载函数
def load_data(file_path):
    data = pd.read_csv(file_path, header=None)
    labels = data.iloc[:, -1]
    X = data.iloc[:, :-1].values
    y = labels.values
    return X, y

# 计算欧几里得距离
def euclidean_distance(x, y):
    return np.sqrt(np.sum((x - y) ** 2))

# 选择第一个聚类中心（数据的均值）
def select_first_center(data):
    return np.mean(data, axis=0)

# 选择后续的聚类中心
def select_next_centers(data, k, first_center):
    distances = np.array([euclidean_distance(first_center, point) for point in data])
    farthest_point = data[np.argmax(distances)]
    distances_from_farthest = np.array([euclidean_distance(farthest_point, point) for point in data])
    second_farthest_point = data[np.argmax(distances_from_farthest)]
    d = euclidean_distance(farthest_point, second_farthest_point)

    centers = [first_center]
    while len(centers) < k:
        candidate = data[np.random.choice(len(data))]
        distances = np.array([euclidean_distance(candidate, center) for center in centers])
        if np.all(distances >= (d / k)*0.5):  # 放宽条件
            centers.append(candidate)

    return np.array(centers)

# 自定义初始化方法
def initialize_centroids_custom(X, k, alpha=0.8):
    data = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)  # 处理无效值
    first_center = select_first_center(data)
    custom_centers = select_next_centers(data, k, first_center)
    # 如果质心数不足，则补充随机点
    while len(custom_centers) < k:
        random_point = data[np.random.choice(len(data))]
        custom_centers = np.vstack([custom_centers, random_point])

    return custom_centers

# 使用自定义质心优化KMeans聚类
def kmeans_refine_centroids(X, initial_centroids, num_clusters):
    kmeans = KMeans(n_clusters=num_clusters, init=initial_centroids, n_init=1, random_state=42)
    kmeans.fit(X)
    return kmeans.cluster_centers_, kmeans.labels_

# 计算每个簇之间的最小距离
def compute_min_distances(cluster_centers):
    min_distances = []
    n_clusters = len(cluster_centers)
    for i in range(n_clusters):
        min_distance = float('inf')
        for j in range(n_clusters):
            if i != j:
                distance = np.linalg.norm(cluster_centers[i] - cluster_centers[j])
                min_distance = min(min_distance, distance)
        min_distances.append(min_distance)
    return np.array(min_distances)

# 优化单个簇的半径
# 优化单个簇的半径
def optimize_individual_radius(cluster_points, initial_radius, min_radius, max_radius, step=0.01):
    best_radius = initial_radius
    best_ratio = compute_coverage_to_radius_ratio(cluster_points, initial_radius)

    # 先确保 min_radius 和 max_radius 有足够的差值
    if max_radius - min_radius < step:
        min_radius = max_radius - step  # 调整最小半径，使得范围足够大

    # 在有效的范围内进行优化
    for radius in np.arange(min_radius, max_radius, step):
        ratio = compute_coverage_to_radius_ratio(cluster_points, radius)
        if ratio > best_ratio:
            best_ratio = ratio
            best_radius = radius
    return best_radius


# 初始化半径范围
def initialize_radii(X, cluster_centers, labels):
    radii = []
    min_distances = compute_min_distances(cluster_centers)
    for i in range(len(cluster_centers)):
        cluster_points = X[labels == i]
        distances = np.linalg.norm(cluster_points - cluster_centers[i], axis=1)
        initial_radius = min_distances[i]
        min_radius = 0.25 * min_distances[i]
        max_radius = 0.75 * min_distances[i]
        optimized_radius = optimize_individual_radius(cluster_points, initial_radius, min_radius, max_radius)
        radii.append(optimized_radius)
    return np.array(radii)

# 计算覆盖度与半径比
def compute_coverage_to_radius_ratio(cluster_points, cluster_radius):
    return len(cluster_points) / np.exp(cluster_radius) if cluster_radius > 0 else 0

# 合并异类粒球
def merge_different_class_spheres(spheres):
    new_spheres = []
    for i in range(len(spheres)):
        sphere1 = spheres[i]
        for j in range(i + 1, len(spheres)):
            sphere2 = spheres[j]
            distance = np.linalg.norm(sphere1['center'] - sphere2['center'])
            overlap_ratio = (sphere1['radius'] + sphere2['radius']) - distance
            if overlap_ratio > 0 and sphere1['class'] != sphere2['class']:
                adjustment1 = (sphere2['radius'] / (sphere1['radius'] + sphere2['radius'])) * overlap_ratio
                adjustment2 = (sphere1['radius'] / (sphere1['radius'] + sphere2['radius'])) * overlap_ratio
                sphere1['radius'] -= adjustment1
                sphere2['radius'] -= adjustment2
                sphere1['radius'] = max(sphere1['radius'], 0)
                sphere2['radius'] = max(sphere2['radius'], 0)
        new_spheres.append(sphere1)
    return new_spheres

# 主函数 DCHIG
# def DCHIG(X_train, X_test, y_train, y_test, k):
#     spheres = []
#     total_spheres = 0
#
#     for class_label in np.unique(y_train):
#         X_class_train = X_train[y_train == class_label]
#         N = len(X_class_train)
#         num_clusters = max(1, int(k * int(sqrt(N))))
#
#         initial_centroids = initialize_centroids_custom(X_class_train, num_clusters, alpha=0.8)
#         final_centroids, labels = kmeans_refine_centroids(X_class_train, initial_centroids, num_clusters)
#         optimized_radii = initialize_radii(X_class_train, final_centroids, labels)
#
#         spheres_for_class = []
#         for i, center in enumerate(final_centroids):
#             sphere = {
#                 'center': center,
#                 'radius': optimized_radii[i],
#                 'class': class_label
#             }
#             spheres_for_class.append(sphere)
#
#         spheres.extend(spheres_for_class)
#         total_spheres += len(spheres_for_class)
#
#     spheres = merge_different_class_spheres(spheres)
#
#     # 分类预测
#     predictions = []
#     for sample in X_test:
#         min_distance = float('inf')
#         predicted_class = None
#
#         for sphere in spheres:
#             distance = np.linalg.norm(sample - sphere['center'])
#             if distance <= sphere['radius']:
#                 predicted_class = sphere['class']
#                 break
#             elif distance < min_distance:
#                 min_distance = distance
#                 predicted_class = sphere['class']
#
#         predictions.append(predicted_class)
#
#     accuracy = accuracy_score(y_test, predictions)
#     mean_reduction_rate = (len(X_train) - total_spheres) / len(X_train)
#
#     return accuracy, mean_reduction_rate

def DCHIG(X_train, X_test, y_train, y_test, k):
    spheres = []
    total_spheres = 0

    for class_label in np.unique(y_train):
        X_class_train = X_train[y_train == class_label]
        N = len(X_class_train)
        num_clusters = max(1, int(k * int(sqrt(N))))

        # 初始化并优化簇的中心
        initial_centroids = initialize_centroids_custom(X_class_train, num_clusters, alpha=0.8)
        final_centroids, labels = kmeans_refine_centroids(X_class_train, initial_centroids, num_clusters)

        # 计算每个簇的半径：簇中心到簇内点的最远距离
        spheres_for_class = []
        for i, center in enumerate(final_centroids):
            cluster_points = X_class_train[labels == i]
            distances = np.linalg.norm(cluster_points - center, axis=1)
            radius = max(distances)

            sphere = {
                'center': center,
                'radius': radius,
                'class': class_label
            }
            spheres_for_class.append(sphere)

        spheres.extend(spheres_for_class)
        total_spheres += len(spheres_for_class)

    spheres = merge_different_class_spheres(spheres)

    # 分类预测
    predictions = []
    for sample in X_test:
        min_distance = float('inf')
        predicted_class = None

        for sphere in spheres:
            distance = np.linalg.norm(sample - sphere['center'])
            if distance <= sphere['radius']:
                predicted_class = sphere['class']
                break
            elif distance < min_distance:
                min_distance = distance
                predicted_class = sphere['class']

        predictions.append(predicted_class)

    accuracy = accuracy_score(y_test, predictions)
    mean_reduction_rate = (len(X_train) - total_spheres) / len(X_train)

    return accuracy, mean_reduction_rate
