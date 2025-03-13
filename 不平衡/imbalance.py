import os
import time
import numpy as np
import pandas as pd
from collections import defaultdict
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.preprocessing import MinMaxScaler
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (roc_auc_score, f1_score, matthews_corrcoef)
from imblearn.metrics import geometric_mean_score
from imblearn.under_sampling import (EditedNearestNeighbours, TomekLinks, NearMiss, ClusterCentroids, OneSidedSelection)
from imblearn.over_sampling import SMOTE, BorderlineSMOTE, SVMSMOTE, ADASYN
from imblearn.combine import SMOTETomek
from tqdm import tqdm
from kmeans_smote import KMeansSMOTE
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, message=".*n_jobs.*deprecated.*")
from CBHSID import CBHSID
from imblearn.over_sampling import RandomOverSampler
from collections import Counter
from sklearn.cluster import KMeans

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
        if sphere1['radius'] > 0:
            new_spheres.append(sphere1)
    return new_spheres

class ODOS:
    def __init__(self, feature_weights=None):
        self.feature_weights = feature_weights
        self.minority_class = None
        self.majority_class = None

    def fit_resample(self, X, y):
        self.minority_class = min(Counter(y), key=Counter(y).get)
        self.majority_class = max(Counter(y), key=Counter(y).get)

        if self.feature_weights is not None:
            X = X * self.feature_weights

        X_minority = X[y == self.minority_class]
        X_majority = X[y == self.majority_class]

        n_clusters_minority = int(np.sqrt(len(X_minority)))
        n_clusters_majority = int(np.sqrt(len(X_majority)))

        kmeans_minority = KMeans(n_clusters=n_clusters_minority, random_state=0).fit(X_minority)
        kmeans_majority = KMeans(n_clusters=n_clusters_majority, random_state=0).fit(X_majority)

        def compute_min_distances(cluster_centers):
            distances = np.linalg.norm(cluster_centers[:, np.newaxis] - cluster_centers, axis=2)
            np.fill_diagonal(distances, np.inf)
            return np.min(distances, axis=1)

        def optimize_individual_radius(cluster_points, initial_radius, min_radius, max_radius):
            best_radius = initial_radius
            best_coverage_ratio = compute_coverage_to_radius_ratio(cluster_points, initial_radius)
            for radius in np.linspace(min_radius, max_radius, 50):
                coverage_ratio = compute_coverage_to_radius_ratio(cluster_points, radius)
                if coverage_ratio > best_coverage_ratio:
                    best_radius = radius
                    best_coverage_ratio = coverage_ratio
            return best_radius

        def compute_coverage_to_radius_ratio(cluster_points, cluster_radius):
            return len(cluster_points) / cluster_radius if cluster_radius > 0 else 0

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

        minority_radii = initialize_radii(X_minority, kmeans_minority.cluster_centers_, kmeans_minority.labels_)
        majority_radii = initialize_radii(X_majority, kmeans_majority.cluster_centers_, kmeans_majority.labels_)

        spheres = []
        for i, center in enumerate(kmeans_minority.cluster_centers_):
            spheres.append({'center': center, 'radius': minority_radii[i], 'class': self.minority_class})
        for i, center in enumerate(kmeans_majority.cluster_centers_):
            spheres.append({'center': center, 'radius': majority_radii[i], 'class': self.majority_class})

        # 去除异类重叠
        spheres = merge_different_class_spheres(spheres)

        # 更新少数类簇
        updated_minority_clusters = [s for s in spheres if s['class'] == self.minority_class]

        sparse_factors = []
        for cluster in updated_minority_clusters:
            # 找出当前簇中所有少数类点
            cluster_label = kmeans_minority.predict([cluster['center']])[0]
            cluster_points = X_minority[kmeans_minority.labels_ == cluster_label]
            if len(cluster_points) == 0:
                sparse_factors.append(0)
                continue
            # 修改密度计算：簇内样本数的平方除以簇内所有样本到簇中心距离之和
            distances = np.linalg.norm(cluster_points - cluster['center'], axis=1)
            sum_distances = np.sum(distances)
            density = (len(cluster_points) ** 2) / (sum_distances + 1e-8)
            nearest_majority_distance = np.min(
                [np.linalg.norm(cluster['center'] - m['center']) - (cluster['radius'] + m['radius'])
                 for m in spheres if m['class'] == self.majority_class]
            )
            sparse_factors.append((1 / density) * nearest_majority_distance)

        total_synthetic_samples = len(X_majority) - len(X_minority)
        sampling_counts = np.round(
            np.array(sparse_factors) / np.sum(sparse_factors) * total_synthetic_samples
        ).astype(int)

        synthetic_samples = []
        for cluster, count in zip(updated_minority_clusters, sampling_counts):
            cluster_label = kmeans_minority.predict([cluster['center']])[0]
            cluster_points = X_minority[kmeans_minority.labels_ == cluster_label]
            if len(cluster_points) == 0 or count == 0:
                continue
            for _ in range(count):
                base_point = cluster['center']
                random_point = cluster_points[np.random.randint(0, len(cluster_points))]
                alpha = np.random.rand()
                synthetic_sample = base_point + alpha * (random_point - base_point)
                synthetic_samples.append(synthetic_sample)

        X_resampled = np.vstack((X, np.array(synthetic_samples)))
        y_resampled = np.hstack((y, [self.minority_class] * len(synthetic_samples)))
        return X_resampled, y_resampled




# 数据加载和处理
folder_path = r'C:\Users\20583\Desktop\imbalance_final'
csv_files = [f for f in os.listdir(folder_path) if f.endswith('.csv')]
csv_files.sort()

# 初始化结果保存结构
results = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list))))

# # 遍历每个CSV文件
# for filename in tqdm(csv_files, desc="Processing Datasets", unit="dataset"):
#     print(f"正在处理的数据集: {filename}")
#
#     data = pd.read_csv(os.path.join(folder_path, filename), header=None)
#     data = data.apply(pd.to_numeric, errors='coerce')
#
#     y = data.iloc[1:, -1].values
#     X = data.iloc[1:, :-1].values
#
#     class_counts = pd.Series(y).value_counts()
#     majority_class = class_counts.idxmax()
#     minority_class = class_counts.idxmin()
#     imbalance_ratio = class_counts[majority_class] / class_counts[minority_class]
#     print(f"原始不平衡比率: {imbalance_ratio:.2f}")
#
#     if np.any(np.isnan(X)) or np.any(np.isnan(y)):
#         print(f"跳过数据集 {filename}，因为它包含NaN值。")
#         continue
#
#     # 数据标准化
#     scaler = MinMaxScaler()
#     X = scaler.fit_transform(X)
#
#     # 计算特征权重
#     variances = np.var(X, axis=0)
#     feature_weights = 1 / (variances)
#     feature_weights = feature_weights / np.sum(feature_weights)
#
#     sss = StratifiedShuffleSplit(n_splits=5, test_size=0.2)
#
#     sampling_methods = {
#         "Original": None,
#         "Random Oversampling": RandomOverSampler(random_state=0),
#         # "NCL": EditedNearestNeighbours(n_neighbors=3),
#         # "Tomek": TomekLinks(),
#         # "NearMiss": NearMiss(),
#         "Centroids": ClusterCentroids(),
#         "Borderline SMOTE": BorderlineSMOTE(random_state=0),
#         # "SVM SMOTE": SVMSMOTE(random_state=0),
#         "SMOTE-Tomek": SMOTETomek(random_state=0),
#         # "OSS": OneSidedSelection(random_state=0),
#         # "ADASYN": ADASYN(random_state=0),
#         "ODOS": ODOS(feature_weights=feature_weights),  # 传入特征权重
#         "kmeans_smote" :  KMeansSMOTE(kmeans_args={'n_clusters': 50},smote_args={'k_neighbors': 3}),
#         "CBHSID": CBHSID(X,y)
#
#     }
#
#     classifiers = {
#         'SVM': SVC(probability=True, random_state=0),
#         '1NN': KNeighborsClassifier(n_neighbors=1),
#         'Random Forest': RandomForestClassifier(random_state=0),
#         'Logistic Regression': LogisticRegression(max_iter=200, random_state=0),
#         'Naive Bayes': GaussianNB()
#     }
#
#     for train_index, test_index in tqdm(sss.split(X, y), desc="Splitting Data", total=5, unit="split"):
#         X_train, X_test = X[train_index], X[test_index]
#         y_train, y_test = y[train_index], y[test_index]
#
#         for sampling_name, sampler in sampling_methods.items():
#             if sampling_name == "Original":
#                 X_resampled, y_resampled = X_train, y_train
#             elif sampling_name == "CBHSID":
#                 X_resampled, y_resampled = CBHSID(X_train, y_train)
#             else:
#                 X_resampled, y_resampled = sampler.fit_resample(X_train, y_train)
#             # 对特征加权（仅限 SABIS）
#             if sampling_name == "ODOS" and isinstance(sampler, ODOS) and sampler.feature_weights is not None:
#                 X_test_weighted = X_test * sampler.feature_weights
#             else:
#                 X_test_weighted = X_test
#
#             imbalance_ratio_resampled = sum(y_resampled == 0) / sum(y_resampled == 1)
#
#             for clf_name, clf in classifiers.items():
#                 start_time = time.time()
#                 clf.fit(X_resampled, y_resampled)
#                 y_pred = clf.predict(X_test_weighted)  # 使用特征加权后的测试集
#                 elapsed_time = time.time() - start_time
#
#                 auc = roc_auc_score(y_test, clf.predict_proba(X_test_weighted)[:, 1]) if hasattr(clf,
#                                                                                                  "predict_proba") else 'N/A'
#                 f1 = f1_score(y_test, y_pred, average='weighted')
#                 gmean = geometric_mean_score(y_test, y_pred)
#                 mcc = matthews_corrcoef(y_test, y_pred)
#
#                 results[filename][clf_name][sampling_name]['AUC'].append(auc)
#                 results[filename][clf_name][sampling_name]['F1'].append(f1)
#                 results[filename][clf_name][sampling_name]['Gmean'].append(gmean)
#                 results[filename][clf_name][sampling_name]['Elapsed Time'].append(elapsed_time)
#                 results[filename][clf_name][sampling_name]['Imbalance Ratio'].append(imbalance_ratio_resampled)
#                 results[filename][clf_name][sampling_name]['MCC'].append(mcc)
#
#     print(f"\n数据集: {filename}")
#     for clf_name, samplings in results[filename].items():
#         print(f"  分类器: {clf_name}")
#         for sampling_name, metrics in samplings.items():
#             avg_auc = np.mean(metrics['AUC']) if metrics['AUC'] != 'N/A' else 'N/A'
#             avg_f1 = np.mean(metrics['F1']) if metrics['F1'] else 0
#             avg_gmean = np.mean(metrics['Gmean']) if metrics['Gmean'] else 0
#             avg_time = np.mean(metrics['Elapsed Time']) if metrics['Elapsed Time'] else 0
#             # avg_imbalance_ratio = np.mean(metrics['Imbalance Ratio']) if metrics['Imbalance Ratio'] else 'N/A'
#             avg_mcc = np.mean(metrics['MCC']) if metrics['MCC'] else 0
#
#             print(f"    {sampling_name}: AUC: {avg_auc}, F1: {avg_f1:.4f}, Gmean: {avg_gmean:.4f}, "
#                   f"MCC: {avg_mcc:.4f}, Time: {avg_time:.4f}s")
#
# print("\n所有数据集处理完毕！")


for filename in tqdm(csv_files, desc="Processing Datasets", unit="dataset"):
    try:
        print(f"正在处理的数据集: {filename}")
        data = pd.read_csv(os.path.join(folder_path, filename), header=None)
        data = data.apply(pd.to_numeric, errors='coerce')

        y = data.iloc[1:, -1].values
        X = data.iloc[1:, :-1].values

        # 如果检测到 NaN 值，则跳过该数据集
        if np.any(np.isnan(X)) or np.any(np.isnan(y)):
            print(f"跳过数据集 {filename}，因为它包含 NaN 值。")
            continue

        # 数据标准化
        scaler = MinMaxScaler()
        X = scaler.fit_transform(X)

        # 计算特征权重
        variances = np.var(X, axis=0)
        feature_weights = 1 / variances
        feature_weights = feature_weights / np.sum(feature_weights)

        # 交叉验证拆分
        sss = StratifiedShuffleSplit(n_splits=5, test_size=0.2)

        sampling_methods = {
            "Original": None,
            "Random Oversampling": RandomOverSampler(random_state=0),
            "Centroids": ClusterCentroids(),
            "Borderline SMOTE": BorderlineSMOTE(random_state=0),
            "SMOTE-Tomek": SMOTETomek(random_state=0),
            "ODOS": ODOS(feature_weights=feature_weights),
            "kmeans_smote": KMeansSMOTE(kmeans_args={'n_clusters': 50}, smote_args={'k_neighbors': 3}),
            "CBHSID": CBHSID(X, y)
        }

        classifiers = {
            'SVM': SVC(probability=True, random_state=0),
            '1NN': KNeighborsClassifier(n_neighbors=1),
            'Random Forest': RandomForestClassifier(random_state=0),
            'Logistic Regression': LogisticRegression(max_iter=200, random_state=0),
            'Naive Bayes': GaussianNB()
        }

        for train_index, test_index in tqdm(sss.split(X, y), desc="Splitting Data", total=5, unit="split"):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]

            for sampling_name, sampler in sampling_methods.items():
                if sampling_name == "Original":
                    X_resampled, y_resampled = X_train, y_train
                elif sampling_name == "CBHSID":
                    X_resampled, y_resampled = CBHSID(X_train, y_train)
                else:
                    X_resampled, y_resampled = sampler.fit_resample(X_train, y_train)

                if sampling_name == "ODOS" and isinstance(sampler, ODOS) and sampler.feature_weights is not None:
                    X_test_weighted = X_test * sampler.feature_weights
                else:
                    X_test_weighted = X_test

                imbalance_ratio_resampled = sum(y_resampled == 0) / sum(y_resampled == 1)

                for clf_name, clf in classifiers.items():
                    start_time = time.time()
                    clf.fit(X_resampled, y_resampled)
                    y_pred = clf.predict(X_test_weighted)
                    elapsed_time = time.time() - start_time

                    auc = roc_auc_score(y_test, clf.predict_proba(X_test_weighted)[:, 1]) if hasattr(clf, "predict_proba") else 'N/A'
                    f1 = f1_score(y_test, y_pred, average='weighted')
                    gmean = geometric_mean_score(y_test, y_pred)
                    mcc = matthews_corrcoef(y_test, y_pred)

                    results[filename][clf_name][sampling_name]['AUC'].append(auc)
                    results[filename][clf_name][sampling_name]['F1'].append(f1)
                    results[filename][clf_name][sampling_name]['Gmean'].append(gmean)
                    results[filename][clf_name][sampling_name]['Elapsed Time'].append(elapsed_time)
                    results[filename][clf_name][sampling_name]['Imbalance Ratio'].append(imbalance_ratio_resampled)
                    results[filename][clf_name][sampling_name]['MCC'].append(mcc)

        print(f"\n数据集: {filename}")
        for clf_name, samplings in results[filename].items():
            print(f"  分类器: {clf_name}")
            for sampling_name, metrics in samplings.items():
                avg_auc = np.mean(metrics['AUC']) if metrics['AUC'] != 'N/A' else 'N/A'
                avg_f1 = np.mean(metrics['F1']) if metrics['F1'] else 0
                avg_gmean = np.mean(metrics['Gmean']) if metrics['Gmean'] else 0
                avg_time = np.mean(metrics['Elapsed Time']) if metrics['Elapsed Time'] else 0
                avg_mcc = np.mean(metrics['MCC']) if metrics['MCC'] else 0

                print(f"    {sampling_name}: AUC: {avg_auc}, F1: {avg_f1:.4f}, Gmean: {avg_gmean:.4f}, "
                      f"MCC: {avg_mcc:.4f}, Time: {avg_time:.4f}s")

    except Exception as e:
        print(f"跳过数据集 {filename}，原因：{str(e)}")
        continue

print("\n所有数据集处理完毕！")
