import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import KFold
from sklearn.neighbors import KNeighborsClassifier
from ENN import ENN
from CNN import CNN
from LDIS import LDIS
from CDIS import CDIS
from CIS import CIS
from RIS3 import RIS3
from NNDHIS import NNDHIS
from sklearn.metrics.pairwise import euclidean_distances
import time
import warnings
from LSNaNIS import LSNaNIS
warnings.filterwarnings("ignore", category=FutureWarning)

def load_data(file_path):
    data = pd.read_csv(file_path, header=None)
    labels = data.iloc[:, -1]
    X = data.iloc[:, :-1].values
    y = labels.values
    scaler = MinMaxScaler()
    X = scaler.fit_transform(X)
    return X, y

param_ranges = {
    'ENN': list(range(1, 11)),
    'CNN': None,
    'LDIS': list(range(1, 11)),
    'CDIS': list(range(1, 11)),
    'CIS': (list(range(1, 11)), [i / 10 for i in range(11)]),
    'RIS3': [i / 10 for i in range(11)],
    'LSNaNIS': None,
    'DHIS': None
}

algorithms = {
    'ENN': ENN,
    'CNN': CNN,
    'LDIS': LDIS,
    'CDIS': CDIS,
    'CIS': CIS,
    'RIS3': RIS3,
    'LSNaNIS': LSNaNIS,
    'NNDHIS':NNDHIS
}

def compute_accuracy_knn(train_data, test_data, train_labels, test_labels):
    knn = KNeighborsClassifier(n_neighbors=1)
    knn.fit(train_data, train_labels)
    return knn.score(test_data, test_labels)

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

def cross_validate(X, y, algorithm_name, params=None):
    kf = KFold(n_splits=10, shuffle=True)
    accuracies = []
    selected_samples_counts = []
    best_params = []
    original_accuracies = []
    original_samples_counts = []
    fold_times = []  # 存储每次交叉验证的运行时间

    print(f"Running cross-validation for {algorithm_name}...")

    for train_index, test_index in kf.split(X):
        X_train, X_test = X[train_index], X[test_index]
        y_train, y_test = y[train_index], y[test_index]

        start_time = time.time()  # 开始计时

        original_accuracy = compute_accuracy_knn(ensure_2d(X_train), ensure_2d(X_test), y_train, y_test)
        original_samples_count = len(y_train)

        if algorithm_name == 'NNDHIS':
            accuracy,sample_count=algorithms[algorithm_name](X_train, X_test,y_train,y_test)
            accuracies.append(accuracy)
            selected_samples_counts.append(sample_count)

        if algorithm_name == 'LSNaNIS':
            selected_X, selected_y= algorithms[algorithm_name](X_train, y_train)
            selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
            accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
            accuracies.append(accuracy)
            selected_samples_counts.append(len(selected_X))

        if algorithm_name == 'CNN':
            selected_X, selected_y = algorithms[algorithm_name](X_train, y_train)
            selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
            accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
            accuracies.append(accuracy)
            selected_samples_counts.append(len(selected_y))

        elif algorithm_name == 'CIS':
            best_accuracy = 0
            best_param = None
            best_samples_count = 0  # 初始化最佳样本数
            k_values, selection_rates = params
            for k in k_values:
                for selection_rate in selection_rates:
                    selected_X, selected_y = algorithms[algorithm_name](X_train, y_train, k, selection_rate)
                    selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                    accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                    if accuracy > best_accuracy:
                        best_accuracy = accuracy
                        best_param = (k, selection_rate)
                        best_samples_count = len(selected_y)
            accuracies.append(best_accuracy)
            best_params.append(best_param)
            selected_samples_counts.append(best_samples_count)

        elif algorithm_name.startswith('RIS'):
            best_accuracy = 0
            best_param = None
            for k in params:
                selected_X, selected_y, radius = algorithms[algorithm_name](X_train, y_train, k)
                index = classify(X_test, selected_X, radius)
                accuracy = np.sum(selected_y[index] == y_test) / len(y_test)
                if accuracy > best_accuracy:
                    best_accuracy = accuracy
                    best_param = k
                    best_samples_count = len(selected_y)
            accuracies.append(best_accuracy)
            best_params.append(best_param)
            selected_samples_counts.append(best_samples_count)

        else:
            if params:
                best_accuracy = 0
                best_param = None
                for param in params:
                    selected_X, selected_y = algorithms[algorithm_name](X_train, y_train, param)
                    selected_X, selected_y = ensure_2d(selected_X), np.array(selected_y)
                    accuracy = compute_accuracy_knn(selected_X, ensure_2d(X_test), selected_y, y_test)
                    if accuracy > best_accuracy:
                        best_accuracy = accuracy
                        best_param = param
                        best_samples_count = len(selected_y)
                accuracies.append(best_accuracy)
                best_params.append(best_param)
                selected_samples_counts.append(best_samples_count)

        end_time = time.time()  # 结束计时
        elapsed_time = end_time - start_time
        fold_times.append(elapsed_time)  # 记录每次交叉验证的时间

        original_accuracies.append(original_accuracy)
        original_samples_counts.append(original_samples_count)

    avg_fold_time = np.mean(fold_times)
    print(f"Avg time per fold for {algorithm_name}: {avg_fold_time:.2f} seconds")

    return np.mean(accuracies), best_params, np.mean(selected_samples_counts), np.mean(original_accuracies), np.mean(
        original_samples_counts)

def run_experiments(X, y, algorithms, param_ranges, repetitions=10):
    overall_results = {alg: {'accuracy': [], 'params': [], 'samples_count': [], 'original_accuracy': [], 'original_samples_count': [], 'avg_fold_time': []} for alg in algorithms}

    for _ in range(repetitions):
        for alg_name in algorithms:
            print(f"Running experiment for {alg_name}...")
            if param_ranges[alg_name]:
                accuracy, best_params, samples_count, original_accuracy, original_samples_count = cross_validate(X, y, alg_name, param_ranges[alg_name])
                overall_results[alg_name]['accuracy'].append(accuracy)
                overall_results[alg_name]['params'].append(best_params)
                overall_results[alg_name]['samples_count'].append(samples_count)
                overall_results[alg_name]['original_accuracy'].append(original_accuracy)
                overall_results[alg_name]['original_samples_count'].append(original_samples_count)
            else:
                accuracy, best_params, samples_count, original_accuracy, original_samples_count = cross_validate(X, y, alg_name)
                overall_results[alg_name]['accuracy'].append(accuracy)
                overall_results[alg_name]['samples_count'].append(samples_count)
                overall_results[alg_name]['original_accuracy'].append(original_accuracy)
                overall_results[alg_name]['original_samples_count'].append(original_samples_count)

    final_results = {}
    for alg_name in algorithms:
        final_results[alg_name] = {
            'accuracy': np.mean(overall_results[alg_name]['accuracy']),
            'params': np.mean([p for p in overall_results[alg_name]['params'] if p is not None], axis=0) if overall_results[alg_name]['params'] else None,
            'samples_count': np.mean(overall_results[alg_name]['samples_count']),
            'original_accuracy': np.mean(overall_results[alg_name]['original_accuracy']),
            'original_samples_count': np.mean(overall_results[alg_name]['original_samples_count'])
        }

    return final_results

# 数据集
#
datasets =['Appendicitis.csv','Iris.csv','Wine.csv','Sonar.csv','Segmentation.csv','Heart.csv','Breast.csv',
           'Haberman.csv','Ionosphere.csv','Vote.csv','Wdbc.csv','Wbc.csv','austra.csv','Blood.csv','Diabetes.csv',
           'Vehicle.csv','Vowel.csv','German.csv','Cloud.csv','CMC.csv','CopyOfMagic04.csv','Spam.csv','Wilt.csv','Wave.csv',
           'EEG.csv','Gamma.csv','Letter.csv']


for data in datasets:
    print(f"当前的数据集是 {data}")
    path = fr'C:\Users\20583\Desktop\data\data\{data}'
    X, y = load_data(path)
    # 运行实验
    results = run_experiments(X, y, algorithms, param_ranges)
    print(results)