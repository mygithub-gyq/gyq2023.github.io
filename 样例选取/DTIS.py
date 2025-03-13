# import numpy as np
# from sklearn.neighbors import KNeighborsClassifier
#
# def decision_partition_data(data, labels):
#     # Obtain the decision classes.
#     obj_num = len(labels)
#     label_class = np.unique(labels)
#     decision_class = {}
#     labels_class = {}
#     for i in range(len(label_class)):
#         partition = (labels == label_class[i])
#         decision_class[i] = data[partition]
#         labels_class[i] = labels[partition]
#     return decision_class, labels_class
#
# def decision_partition_data1(X, y):
#     labels = np.unique(y)
#     decision_class = []
#     for label in labels:
#         partition = (y == label)
#         partition_data = X[partition]
#         lambda_values = np.zeros(len(partition_data))
#         decision_class.append((partition_data, lambda_values))  # Append lambda values
#     return decision_class
#
# def cosine_similarity_matrix(data):
#     norm_data = data / np.linalg.norm(data, axis=1)[:, np.newaxis]
#     return np.dot(norm_data, norm_data.T)
#
# def sparsify_matrix(data, k, threshold):
#     cosine_sim = cosine_similarity_matrix(data)
#     n = data.shape[0]
#     sparse_matrix = np.zeros((n, n))
#     for i in range(n):
#         sorted_indices = np.argsort(-cosine_sim[i])[1:k + 1]  # 排除自身
#         for j in sorted_indices:
#             if cosine_sim[i, j] > threshold[i]:
#                 sparse_matrix[i, j] = cosine_sim[i, j]
#     return sparse_matrix
#
# def compute_specificity(matrix):
#     std_distances = np.std(matrix, axis=1)
#     return std_distances
#
# def compute_threshold(similarity_matrix, k, alpha=0.5):
#     n = similarity_matrix.shape[0]
#     # 计算全局阈值
#     global_threshold = np.mean(similarity_matrix)
#     # 计算个性化阈值
#     individual_thresholds = np.zeros(n)
#     for i in range(n):
#         sorted_indices = np.argsort(-similarity_matrix[i])[1:k + 1]  # 排除自身
#         individual_thresholds[i] = np.mean(similarity_matrix[i, sorted_indices])
#     # 组合阈值
#     combined_thresholds = alpha * global_threshold + (1 - alpha) * individual_thresholds
#     return combined_thresholds
#
# def DTIS(data, y, k):
#     final_indices = []
#     selected_data = []
#     selected_labels = []
#     similarity_matrix = cosine_similarity_matrix(data)
#     combined_thresholds = compute_threshold(similarity_matrix, k, alpha=0.5)
#     sparse_matrix = sparsify_matrix(data, k, combined_thresholds)
#     while np.count_nonzero(sparse_matrix) > 0:
#         coverage = np.count_nonzero(sparse_matrix, axis=1)
#         specificity = compute_specificity(sparse_matrix)  # 假设这个函数已定义
#         max_values = coverage * specificity
#         max_idx = np.argmax(max_values)
#         final_indices.append(max_idx)
#         selected_data.append(data[max_idx])  # 添加被选中的数据点
#         selected_labels.append(y[max_idx])  # 添加被选中的数据点的标签
#         selected_row = sparse_matrix[max_idx]
#         covered_indices = np.where(selected_row > 0)[0]
#         sparse_matrix[max_idx] = 0
#         sparse_matrix[covered_indices, :] = 0
#         sparse_matrix[:, covered_indices] = 0
#     return np.array(selected_data), np.array(selected_labels)
#
# def compute_accuracy_knn(train_data, test_data, train_labels, test_labels):
#     knn = KNeighborsClassifier(n_neighbors=1)
#     knn.fit(train_data, train_labels)
#     acc = knn.score(test_data, test_labels)
#     return acc
#
# def optimal_sel_data(data, labels, test_data, test_labels, acc):
#     max_acc = acc
#     while True:
#         acc_vec = []
#         obj_num = len(data)
#         for i in range(obj_num):
#             sel = [j for j in range(obj_num) if j != i]
#             now_data_X = data[sel]
#             now_data_y = labels[sel]
#             acc_1NN = compute_accuracy_knn(now_data_X, test_data, now_data_y, test_labels)
#             acc_vec.append(acc_1NN)
#         max_idx = acc_vec.index(max(acc_vec))
#         max_acc_new = max(acc_vec)
#         if max_acc_new > max_acc:
#             data = np.delete(data, max_idx, axis=0)
#             labels = np.delete(labels, max_idx, axis=0)
#             max_acc = max_acc_new
#         else:
#             break
#     opt_sel_data = data
#     return opt_sel_data, max_acc

# import numpy as np
# import pandas as pd
# from sklearn.neighbors import KNeighborsClassifier, KDTree
# from sklearn.preprocessing import StandardScaler
# from sklearn.model_selection import KFold
# from tqdm import tqdm  # Import tqdm for progress bar
#
#
# class InstanceSelection:
#
#     @staticmethod
#     def cosine_similarity_matrix(data):
#         # Normalize data to unit length
#         norm_data = data / np.linalg.norm(data, axis=1)[:, np.newaxis]
#         return norm_data
#
#     @staticmethod
#     def compute_specificity(matrix):
#         mean_distances = np.mean(matrix, axis=1)
#         std_distances = np.min(matrix, axis=1)
#         return np.exp(std_distances)
#
#     @staticmethod
#     def find_turning_point(values):
#         # Step 1: Sort the values in ascending order
#         values_sorted = np.sort(values)
#         n = len(values_sorted)
#         DN = int(np.sqrt(n))  # Step 2: Calculate DN (square root of n rounded down)
#
#         mu = np.diff(values_sorted)  # Step 3: Compute differences μ_i
#
#         mu_selected = mu[-DN + 1:-1]  # selecting mu from n-DN+1 to n-2
#         # Step 4: Increase theta sensitivity by multiplying it with a factor
#         theta =  (np.sum(np.abs(np.diff(mu_selected))) / (DN - 2))  # Increased θ sensitivity
#
#         kp = []# Step 5: Find the turning point kp
#         for i in range(n - DN + 1, n - 2):
#             if abs(mu[i + 1] - mu[i]) >= theta:
#                 kp.append(i)
#         return np.max(kp)
#
#     @staticmethod
#     def sparsify_matrix(data, k, kp_threshold, min_similarity=0.2):
#         norm_data = InstanceSelection.cosine_similarity_matrix(data)
#         n = data.shape[0]
#         tree = KDTree(norm_data)
#         sparse_matrix = np.zeros((n, n))
#         for i in range(n):
#             distances, indices = tree.query(norm_data[i:i + 1], k=k + 1)  # k+1 because the point itself is included
#             indices = indices[0][1:]  # exclude self
#             distances = distances[0][1:]  # exclude self
#
#             for j, idx in enumerate(indices):
#                 if distances[j] > kp_threshold:
#                     sparse_matrix[i, idx] = 1  # Use binary similarity for sparse matrix
#         return sparse_matrix
#
#     @staticmethod
#     def compute_threshold(similarity_matrix, k):
#         n = similarity_matrix.shape[0]
#         # Step 1: Store the k-th nearest neighbor similarity for each point
#         kth_similarities = np.zeros(n)
#         for i in range(n):
#             sorted_similarities = np.sort(similarity_matrix[i])[::-1][1:k + 1]  # 排除自身
#             kth_similarities[i] = sorted_similarities[-1]  # 取第 k 个近邻的相似度
#
#         # Step 2: 将这些相似度值传入 find_turning_point
#         kp_idx = InstanceSelection.find_turning_point(kth_similarities)
#
#         # Step 3: 返回拐点对应的相似度值作为阈值 kp
#         kp_threshold = kth_similarities[kp_idx] if kp_idx is not None else np.min(kth_similarities)
#
#         return kp_threshold
#
#     @staticmethod
#     def DTIS(data, y, k):
#         final_indices = []
#         norm_data = InstanceSelection.cosine_similarity_matrix(data)
#         tree = KDTree(norm_data)
#         kp_threshold = InstanceSelection.compute_threshold(norm_data, k)  # 使用拐点计算阈值
#         sparse_matrix = InstanceSelection.sparsify_matrix(data, k, kp_threshold)  # 稀疏化矩阵
#         while np.count_nonzero(sparse_matrix) > 0:
#             coverage = np.count_nonzero(sparse_matrix, axis=1)
#             specificity = InstanceSelection.compute_specificity(sparse_matrix)
#             max_values = coverage * specificity
#             max_idx = np.argmax(max_values)
#             final_indices.append(max_idx)
#             selected_row = sparse_matrix[max_idx]
#             covered_indices = np.where(selected_row > 0)[0]
#             sparse_matrix[max_idx] = 0
#             sparse_matrix[covered_indices, :] = 0
#             sparse_matrix[:, covered_indices] = 0
#         return data[final_indices], y[final_indices]
#
#     @staticmethod
#     def compute_accuracy_knn(train_data, test_data, train_labels, test_labels):
#         knn = KNeighborsClassifier(n_neighbors=1)
#         knn.fit(train_data, train_labels)
#         acc = knn.score(test_data, test_labels)
#         return acc
#
#
# # 实例化 InstanceSelection 类
# instance_selector = InstanceSelection()
#
# # 读取数据
# data = pd.read_csv(
#     r'C:\Users\20583\Desktop\data\wine.csv', header=None)
# labels = data.iloc[:, -1]
# X = data.iloc[:, :-1].values
# y = labels.values
#
# # 归一化数据
# scaler = StandardScaler()
# X = scaler.fit_transform(X)
#
# # 定义 KFold 交叉验证
# kf = KFold(n_splits=10, shuffle=True)
#
# # 记录每一折的最佳精度和约简率
# accuracy_reduction_records = []
#
# # 开始交叉验证
# for train_index, test_index in tqdm(kf.split(X), total=kf.get_n_splits(), desc='Cross-Validation Progress'):
#     X_train_fold, X_val = X[train_index, :], X[test_index, :]
#     y_train_fold, y_val = y[train_index], y[test_index]
#
#     # 训练原始 KNN 模型
#     knn1 = KNeighborsClassifier(n_neighbors=1)
#     knn1.fit(X_train_fold, y_train_fold)
#     acc1 = knn1.score(X_val, y_val)
#
#     # 初始化最大值
#     max_product = 0
#     best_accuracy = 0
#     best_reduction_rate = 0
#
#     # 尝试不同的 k 值
#     for k in range(1, 11):
#         X_data, X_label = instance_selector.DTIS(X_train_fold, y_train_fold, k)
#         knn = KNeighborsClassifier(n_neighbors=1)
#         knn.fit(X_data, X_label)
#         acc = knn.score(X_val, y_val)
#
#         # 计算约简率
#         reduction_rate = 1 - len(X_data) / len(X_train_fold)
#
#         # 计算精度乘以约简率
#         product = acc * reduction_rate
#
#         # 更新最大乘积及其对应的精度和约简率
#         if product > max_product:
#             max_product = product
#             best_accuracy = acc
#             best_reduction_rate = reduction_rate
#
#     # 记录当前折的最佳精度和约简率
#     accuracy_reduction_records.append((best_accuracy, best_reduction_rate))
#
# # 计算每一折的精度和约简率的平均值
# mean_accuracy = np.mean([record[0] for record in accuracy_reduction_records])
# mean_reduction_rate = np.mean([record[1] for record in accuracy_reduction_records])
#
# print("\n每一折的最佳精度的平均值:", mean_accuracy)
# print("每一折的最佳约简率的平均值:", mean_reduction_rate)



import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsClassifier, KDTree
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import KFold
from tqdm import tqdm  # Import tqdm for progress bar


class InstanceSelection:

    @staticmethod
    def cosine_similarity_matrix(data):
        # Normalize data to unit length
        norm_data = data / np.linalg.norm(data, axis=1)[:, np.newaxis]
        return norm_data

    @staticmethod
    def compute_specificity(matrix, alpha):
        # Find the maximum distance (d) in each row
        max_distances = np.max(matrix, axis=1)
        # Return exp(-alpha * d) for each row, where alpha is the parameter
        return np.exp(-alpha * max_distances)

    @staticmethod
    def find_turning_point(values):
        # Step 1: Sort the values in ascending order
        values_sorted = np.sort(values)
        n = len(values_sorted)
        DN = int(np.sqrt(n))  # Step 2: Calculate DN (square root of n rounded down)

        mu = np.diff(values_sorted)  # Step 3: Compute differences μ_i

        mu_selected = mu[-DN + 1:-1]  # selecting mu from n-DN+1 to n-2
        # Step 4: Increase theta sensitivity by multiplying it with a factor
        theta = (np.sum(np.abs(np.diff(mu_selected))) / (DN - 2))  # Increased θ sensitivity

        kp = []  # Step 5: Find the turning point kp
        for i in range(n - DN + 1, n - 2):
            if abs(mu[i + 1] - mu[i]) >= theta:
                kp.append(i)
        return np.min(kp)

    @staticmethod
    def sparsify_matrix(data, k, kp_threshold, min_similarity=0.2):
        norm_data = InstanceSelection.cosine_similarity_matrix(data)
        n = data.shape[0]
        tree = KDTree(norm_data)
        sparse_matrix = np.zeros((n, n))
        for i in range(n):
            distances, indices = tree.query(norm_data[i:i + 1], k=k + 1)  # k+1 because the point itself is included
            indices = indices[0][1:]  # exclude self
            distances = distances[0][1:]  # exclude self

            for j, idx in enumerate(indices):
                if distances[j] > kp_threshold:
                    sparse_matrix[i, idx] = 1  # Use binary similarity for sparse matrix
        return sparse_matrix

    @staticmethod
    def compute_threshold(similarity_matrix, k):
        n = similarity_matrix.shape[0]
        # Step 1: Store the k-th nearest neighbor similarity for each point
        kth_similarities = np.zeros(n)
        for i in range(n):
            sorted_similarities = np.sort(similarity_matrix[i])[::-1][1:k + 1]  # 排除自身
            kth_similarities[i] = sorted_similarities[-1]  # 取第 k 个近邻的相似度

        # Step 2: 将这些相似度值传入 find_turning_point
        kp_idx = InstanceSelection.find_turning_point(kth_similarities)

        # Step 3: 返回拐点对应的相似度值作为阈值 kp
        kp_threshold = kth_similarities[kp_idx] if kp_idx is not None else np.min(kth_similarities)

        return kp_threshold

    @staticmethod
    def DTIS(data, y, k, alpha):
        final_indices = []
        norm_data = InstanceSelection.cosine_similarity_matrix(data)
        tree = KDTree(norm_data)
        kp_threshold = InstanceSelection.compute_threshold(norm_data, k)  # 使用拐点计算阈值
        sparse_matrix = InstanceSelection.sparsify_matrix(data, k, kp_threshold)  # 稀疏化矩阵
        while np.count_nonzero(sparse_matrix) > 0:
            coverage = np.count_nonzero(sparse_matrix, axis=1)
            specificity = InstanceSelection.compute_specificity(sparse_matrix, alpha)
            max_values = coverage * specificity
            max_idx = np.argmax(max_values)
            final_indices.append(max_idx)
            selected_row = sparse_matrix[max_idx]
            covered_indices = np.where(selected_row > 0)[0]
            sparse_matrix[max_idx] = 0
            sparse_matrix[covered_indices, :] = 0
            sparse_matrix[:, covered_indices] = 0
        return data[final_indices], y[final_indices]

    @staticmethod
    def compute_accuracy_knn(train_data, test_data, train_labels, test_labels):
        knn = KNeighborsClassifier(n_neighbors=1)
        knn.fit(train_data, train_labels)
        acc = knn.score(test_data, test_labels)
        return acc


# 实例化 InstanceSelection 类
# 实例化 InstanceSelection 类
# instance_selector = InstanceSelection()
#
# # 数据集列表
# datasets =['Spam.csv']
#
#
# # 打开日志文件以追加方式写入
# with open("results_log7.txt", "a") as log_file:
#     for data in datasets:
#         print(f"当前的数据集是 {data}")
#         path = fr'C:\Users\20583\Desktop\data\{data}'
#         try:
#             # 读取数据
#             data = pd.read_csv(path, header=None)
#             labels = data.iloc[:, -1]
#             X = data.iloc[:, :-1].values
#             y = labels.values
#
#             # 归一化数据
#             scaler = StandardScaler()
#             X = scaler.fit_transform(X)
#             n = X.shape[0]
#
#             # 定义 KFold 交叉验证
#             kf = KFold(n_splits=5, shuffle=True)
#
#             # 记录每一折的最佳精度、约简率和参数组合
#             accuracy_reduction_records = []
#
#             # 开始交叉验证
#             for fold, (train_index, test_index) in enumerate(
#                     tqdm(kf.split(X), total=kf.get_n_splits(), desc='Cross-Validation Progress')):
#                 X_train_fold, X_val = X[train_index, :], X[test_index, :]
#                 y_train_fold, y_val = y[train_index], y[test_index]
#
#                 # 训练原始 KNN 模型
#                 knn1 = KNeighborsClassifier(n_neighbors=1)
#                 knn1.fit(X_train_fold, y_train_fold)
#                 acc1 = knn1.score(X_val, y_val)
#
#                 # 初始化最大值
#                 max_product = 0
#                 best_accuracy = 0
#                 best_reduction_rate = 0
#                 best_params = (0, 0)  # 用于存储最优的 k 和 alpha 参数
#
#                 # 存储每个 k 下的准确率和约简率
#                 k_accuracy_reduction_records = []
#
#                 # 尝试不同的 k 和 alpha 值
#                 for k in range(5, 300):  # 遍历 k 从 1 到 n//2
#                     for alpha in range(1):  # 遍历 alpha 从 0 到 1
#                         X_data, X_label = instance_selector.DTIS(X_train_fold, y_train_fold, k, alpha)
#                         knn = KNeighborsClassifier(n_neighbors=1)
#                         knn.fit(X_data, X_label)
#                         acc = knn.score(X_val, y_val)
#
#                         # 计算约简率
#                         reduction_rate = 1 - len(X_data) / len(X_train_fold)
#
#                         # 记录每个 k 下的准确率和约简率
#                         k_accuracy_reduction_records.append((k, alpha, acc, reduction_rate))
#
#                         # 计算精度乘以约简率
#                         product = acc * reduction_rate
#
#                         # 更新最大乘积及其对应的精度、约简率和参数
#                         if product > max_product:
#                             max_product = product
#                             best_accuracy = acc
#                             best_reduction_rate = reduction_rate
#                             best_params = (k, alpha)
#
#                 # 将每个 k 下的准确率和约简率写入日志文件
#                 for record in k_accuracy_reduction_records:
#                     log_file.write(f"数据集: {data}, 折数: {fold + 1}, k: {record[0]}, alpha: {record[1]}, "
#                                    f"准确率: {record[2]:.4f}, 约简率: {record[3]:.4f}\n")
#
#                 # 记录当前折的最佳精度、约简率和参数组合
#                 accuracy_reduction_records.append((best_accuracy, best_reduction_rate, best_params))
#
#                 # 将每折的最佳结果写入日志文件
#                 log_file.write(f"数据集: {data}, 折数: {fold + 1}, 最佳精度: {best_accuracy:.4f}, "
#                                f"最佳约简率: {best_reduction_rate:.4f}, 最佳参数 (k, alpha): {best_params}\n")
#
#             # 计算每一折的精度、约简率的平均值以及最佳参数组合
#             mean_accuracy = np.mean([record[0] for record in accuracy_reduction_records])
#             mean_reduction_rate = np.mean([record[1] for record in accuracy_reduction_records])
#             best_params_overall = max(accuracy_reduction_records, key=lambda x: x[0] * x[1])[2]  # 找到整体最佳的 k 和 alpha 参数
#
#             # 打印每个数据集的平均结果
#             print(f"\n数据集 {data} 的每一折的最佳精度的平均值: {mean_accuracy:.4f}")
#             print(f"数据集 {data} 的每一折的最佳约简率的平均值: {mean_reduction_rate:.4f}")
#             print(f"数据集 {data} 的整体最佳参数 (k, alpha): {best_params_overall}")
#
#             # 将当前数据集的平均结果写入日志文件
#             log_file.write(f"\n数据集: {data}, 平均精度: {mean_accuracy:.4f}, "
#                            f"平均约简率: {mean_reduction_rate:.4f}, 整体最佳参数 (k, alpha): {best_params_overall}\n\n")
#         except Exception as e:
#             print(e)

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons, make_circles
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

# Assuming InstanceSelection class is defined or imported here
instance_selector = InstanceSelection()


# Function to plot original and reduced dataset with smaller markers
def plot_original_and_representative(X, y, X_reduced, y_reduced, title):
    plt.figure(figsize=(12, 5),dpi=150)

    # Define markers, colors, and marker size
    markers = ['o', '^']  # 'o' for circles, '^' for triangles
    colors = ['red', 'blue']
    marker_size = 30  # Adjust this value to make markers smaller or larger

    # Plot original dataset
    plt.subplot(1, 2, 1)
    for label in np.unique(y):
        plt.scatter(X[y == label, 0], X[y == label, 1],
                    facecolors='none', edgecolors=colors[label],
                    marker=markers[label], label=f'Class {label}', s=marker_size)
    plt.title(f"Original {title} Dataset")
    plt.legend()

    # Plot reduced dataset
    plt.subplot(1, 2, 2)
    for label in np.unique(y_reduced):
        plt.scatter(X_reduced[y_reduced == label, 0], X_reduced[y_reduced == label, 1],
                    facecolors='none', edgecolors=colors[label],
                    marker=markers[label], label=f'Class {label}', s=marker_size)
    plt.title(f"Representative Samples of {title} Dataset")
    plt.legend()

    plt.tight_layout()
    plt.show()


# # Generate Moon dataset
# X_moon, y_moon = make_moons(n_samples=500, noise=0.1)
# X_moon = StandardScaler().fit_transform(X_moon)
#
# # Split into training and test sets
# X_train_moon, X_test_moon, y_train_moon, y_test_moon = train_test_split(X_moon, y_moon, test_size=0.1, random_state=42)
#
# # Select representative samples for Moon dataset with k=15
# X_reduced_moon, y_reduced_moon = instance_selector.DTIS(X_train_moon, y_train_moon, k=15, alpha=0)
#
# # Plot the original and reduced Moon dataset
# plot_original_and_representative(X_train_moon, y_train_moon, X_reduced_moon, y_reduced_moon, "Moon")

for i in range(10):
    # Generate Circle dataset
    X_circle, y_circle = make_circles(n_samples=500, noise=0.1, factor=0.5)
    X_circle = StandardScaler().fit_transform(X_circle)

    # Split into training and test sets
    X_train_circle, X_test_circle, y_train_circle, y_test_circle = train_test_split(X_circle, y_circle, test_size=0.3,
                                                                                    random_state=42)

    # Select representative samples for Circle dataset with k=15
    X_reduced_circle, y_reduced_circle = instance_selector.DTIS(X_train_circle, y_train_circle, k=15, alpha=0)

    # Plot the original and reduced Circle dataset
    plot_original_and_representative(X_train_circle, y_train_circle, X_reduced_circle, y_reduced_circle, "Circle")
