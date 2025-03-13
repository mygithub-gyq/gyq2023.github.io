import warnings
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.model_selection import KFold
from sklearn.preprocessing import MinMaxScaler
from CDIS import CDIS
from CIS import CIS
from CNN import CNN
from ENN import ENN
from LDIS import LDIS
from LSNaNIS import LSNaNIS
from GR import GR
from RIS2 import RIS2
from DCHIG import DCHIG
from DCHIG1 import DCHIG1
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
warnings.filterwarnings("ignore", category=FutureWarning)

param_ranges = {
    # 'ENN': list(range(1, 11)),
    # 'CNN': None,
    # 'LDIS': list(range(1, 11)),
    # 'CDIS': list(range(1, 11)),
    # 'CIS': (list(range(1, 11)), [0.5]),
    # 'RIS2': [i / 10 for i in range(11)],
    # 'LSNaNIS': None,
    # 'GR': None,
    # 'DCHIG': [i / 10 for i in range(4, 21)],  # k 的范围 0.4 到 2，步长为 0.05
    'DCHIG1': [i / 10 for i in range(4, 21)],
    # 'KNN': None,  # KNN 分类器
    # 'MLP': None,  # 多层感知机
    # 'LogisticRegression': None,  # 逻辑回归
    # 'NaiveBayes': None,  # 朴素贝叶斯
    # 'DecisionTree': None  # 决策树
}

algorithms = {
    # 'ENN': ENN,
    # 'CNN': CNN,
    # 'LDIS': LDIS,
    # 'CDIS': CDIS,
    # 'CIS': CIS,
    # 'RIS2': RIS2,
    # 'LSNaNIS': LSNaNIS,
    # 'GR': GR,
    # 'DCHIG': DCHIG,# 添加 DCHIG 到算法中
    'DCHIG1':DCHIG1,
    # 'KNN': KNeighborsClassifier(n_neighbors=1),  # KNN 分类器
    # 'MLP': MLPClassifier(max_iter=1000),  # 多层感知机
    # 'LogisticRegression': LogisticRegression(max_iter=1000),  # 逻辑回归
    # 'NaiveBayes': GaussianNB(),  # 朴素贝叶斯
    # 'DecisionTree': DecisionTreeClassifier()  # 决策树
}

def load_data(file_path):
    data = pd.read_csv(file_path, header=None)
    labels = data.iloc[:, -1]
    X = data.iloc[:, :-1].values
    y = labels.values
    scaler = MinMaxScaler()
    X = scaler.fit_transform(X)
    return X, y

def compute_accuracy_knn(train_data, test_data, train_labels, test_labels):
    knn = KNeighborsClassifier(n_neighbors=1)
    knn.fit(train_data, train_labels)
    predicted_labels = knn.predict(test_data)
    correct_predictions = np.sum(predicted_labels == test_labels)
    accuracy = correct_predictions / len(test_labels)
    return accuracy

def ensure_2d(array):
    array = np.array(array)
    if array.ndim == 1:
        return array.reshape(-1, 1)
    return array

def classify(X_test, X_selection, radius):
    radius = np.array(radius)
    radius_temp = radius + 1e-8
    dists = euclidean_distances(X_test, X_selection)
    normalized_dists = dists / radius_temp[:, np.newaxis].T
    index = np.argmin(normalized_dists, axis=1)
    return index

def compute_accuracy(classifier, X_train, X_test, y_train, y_test):
    classifier.fit(X_train, y_train)
    predicted_labels = classifier.predict(X_test)
    correct_predictions = np.sum(predicted_labels == y_test)
    accuracy = correct_predictions / len(y_test)
    return accuracy

def run_standard_classifiers(X_train, X_test, y_train, y_test):
    classifiers = {
        'KNN': KNeighborsClassifier(n_neighbors=1),
        'MLP': MLPClassifier(max_iter=1000),
        'LogisticRegression': LogisticRegression(max_iter=1000),
        'NaiveBayes': GaussianNB(),
        'DecisionTree': DecisionTreeClassifier()
    }

    results = {}
    for name, classifier in classifiers.items():
        accuracy = compute_accuracy(classifier, X_train, X_test, y_train, y_test)
        results[name] = accuracy
    return results
def cross_validate(X, y, algorithms, param_ranges):
    kf = KFold(n_splits=10, shuffle=True)
    overall_results = {alg_name: {} for alg_name in algorithms}
    # 存储标准分类器的结果
    standard_results = {classifier: [] for classifier in
                        ['KNN', 'MLP', 'LogisticRegression', 'NaiveBayes', 'DecisionTree']}
    for train_index, test_index in kf.split(X):
        X_train, X_test = X[train_index], X[test_index]
        y_train, y_test = y[train_index], y[test_index]

        # 第一部分：直接训练标准分类器，并保存精度
        standard_results_per_fold = run_standard_classifiers(X_train, X_test, y_train, y_test)

        # 将每个分类器的结果保留
        for classifier_name, accuracy in standard_results_per_fold.items():
            standard_results[classifier_name].append(accuracy)

        for algorithm_name, algorithm in algorithms.items():
            original_accuracy = compute_accuracy_knn(ensure_2d(X_train), ensure_2d(X_test), y_train, y_test)
            if algorithm_name == 'LSNaNIS':
                selected_X, selected_y = algorithm(X_train, y_train)
                selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                reduction_rate = 1 - len(selected_y) / len(y_train)
                combined_metric = accuracy * reduction_rate

                overall_results[algorithm_name][None] = overall_results[algorithm_name].get(None, []) + [
                    (accuracy, reduction_rate, combined_metric)]

            elif  algorithm_name == 'DCHIG':
                k_values = param_ranges[algorithm_name]
                for k in k_values:
                    accuracy, reduction_rate = algorithm(X_train, X_test, y_train, y_test, k)
                    combined_metric = accuracy * reduction_rate
                    overall_results[algorithm_name].setdefault(k, []).append((accuracy, reduction_rate, combined_metric))

            elif  algorithm_name == 'DCHIG1':
                k_values = param_ranges[algorithm_name]
                for k in k_values:
                    accuracy, reduction_rate = algorithm(X_train, X_test, y_train, y_test, k)
                    combined_metric = accuracy * reduction_rate
                    overall_results[algorithm_name].setdefault(k, []).append((accuracy, reduction_rate, combined_metric))

            elif algorithm_name == 'CNN':
                selected_X, selected_y = algorithm(X_train, y_train)
                selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                reduction_rate = 1 - len(selected_y) / len(y_train)
                combined_metric = accuracy * reduction_rate
                overall_results[algorithm_name][None] = overall_results[algorithm_name].get(None, []) + [
                    (accuracy, reduction_rate, combined_metric)]

            elif algorithm_name == 'GR':
                selected_X, selected_y = algorithm(X_train, y_train)
                selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                reduction_rate = 1 - len(selected_y) / len(y_train)
                combined_metric = accuracy * reduction_rate
                overall_results[algorithm_name].setdefault(k, []).append((accuracy, reduction_rate, combined_metric))

            elif algorithm_name == 'CIS':
                k_values, selection_rates = param_ranges[algorithm_name]
                for k in k_values:
                    for selection_rate in selection_rates:
                        selected_X, selected_y = algorithm(X_train, y_train, k, selection_rate)
                        selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                        accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                        reduction_rate = 1 - len(selected_y) / len(y_train)
                        combined_metric = accuracy * reduction_rate
                        overall_results[algorithm_name].setdefault((k, selection_rate), []).append((accuracy, reduction_rate, combined_metric))

            elif algorithm_name.startswith('RIS'):
                for k in param_ranges[algorithm_name]:
                    selected_X, selected_y, radius = algorithm(X_train, y_train, k)
                    index = classify(X_test, selected_X, radius)
                    accuracy = np.sum(selected_y[index] == y_test) / len(y_test)
                    reduction_rate = 1 - len(selected_y) / len(y_train)
                    combined_metric = accuracy * reduction_rate
                    overall_results[algorithm_name].setdefault(k, []).append((accuracy, reduction_rate, combined_metric))

            else:
                if param_ranges[algorithm_name]:
                    for param in param_ranges[algorithm_name]:
                        selected_X, selected_y = algorithm(X_train, y_train, param)
                        selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                        accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                        reduction_rate = 1 - len(selected_y) / len(y_train)
                        combined_metric = accuracy * reduction_rate
                        overall_results[algorithm_name].setdefault(param, []).append((accuracy, reduction_rate, combined_metric))

    # 计算每个算法每个参数的平均结果
    averaged_results = {}
    for algorithm, accuracies in standard_results.items():
        avg_accuracy = np.mean(accuracies)
        print(f"{algorithm} 的平均准确率: {avg_accuracy:.4f}")
    for alg_name, params in overall_results.items():
        averaged_results[alg_name] = {}
        for param, results in params.items():
            accuracies, reduction_rates, combined_metrics = zip(*results)
            avg_accuracy = np.mean(accuracies)
            avg_reduction_rate = np.mean(reduction_rates)
            avg_combined_metric = np.mean(combined_metrics)
            averaged_results[alg_name][param] = (avg_accuracy, avg_reduction_rate, avg_combined_metric)

    return averaged_results

def run_experiments(X, y, algorithms, param_ranges, repetitions=1):
    final_results = {}

    for _ in range(repetitions):
        overall_results = cross_validate(X, y, algorithms, param_ranges)

        for alg_name, results in overall_results.items():
            if alg_name not in final_results:
                final_results[alg_name] = {}
            for param, metrics in results.items():
                if param not in final_results[alg_name]:
                    final_results[alg_name][param] = []
                final_results[alg_name][param].append(metrics)

    # 计算最终结果的平均值并找出最佳参数
    best_results = {}
    for alg_name, params in final_results.items():
        best_accuracy_metric = 0
        best_param = None
        for param, metrics_list in params.items():
            accuracies, reduction_rates, combined_metrics = zip(*metrics_list)
            avg_accuracy = np.mean(accuracies)
            avg_reduction_rate = np.mean(reduction_rates)

            # 计算最佳指标
            if avg_accuracy * avg_reduction_rate > best_accuracy_metric:
                best_accuracy_metric = avg_accuracy * avg_reduction_rate
                best_param = param
                best_results[alg_name] = {
                    'best_param': best_param,
                    'best_metric': best_accuracy_metric,
                    'avg_accuracy': avg_accuracy,
                    'avg_reduction_rate': avg_reduction_rate
                }

    return best_results

# # 数据集
# datasets = ['wine.csv','wbc.csv', 'Wdbc.csv', 'austra.csv', 'Diabetes.csv',
#             'Vehicle.csv', 'Vowel.csv', 'German.csv', 'Cloud.csv',
#             'CopyOfMagic04.csv', 'Spam.csv', 'Wilt.csv', 'Wave.csv',
#             'EEG.csv', 'Gamma.csv', 'Letter.csv','optdigits.csv','texture.csv','robot.csv']
datasets=['mushroom.csv']
for data in datasets:
    print(f"当前的数据集是 {data}")
    path = fr'C:\Users\20583\Desktop\data\{data}'
    X, y = load_data(path)
    # 运行实验
    results = run_experiments(X, y, algorithms, param_ranges)
    print(results)
