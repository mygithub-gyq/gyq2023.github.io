# import numpy as np
# import pandas as pd
# from CLAS.DCHIG import DCHIG
#
#
# # 添加噪声到标签
# def add_label_noise(y, noise_level, num_classes):
#     y_noisy = y.copy()
#     num_samples = len(y)
#     num_noisy_samples = int(noise_level * num_samples)
#
#     noisy_indices = np.random.choice(num_samples, num_noisy_samples, replace=False)
#
#     for idx in noisy_indices:
#         original_label = y[idx]
#         possible_labels = [label for label in range(num_classes) if label != original_label]
#         y_noisy[idx] = np.random.choice(possible_labels)
#
#     return y_noisy
#
#
# datasets = ['Diabetes.csv']
#
# from sklearn.model_selection import StratifiedKFold
# from sklearn.preprocessing import StandardScaler
#
# # 主函数
# def main():
#     noise_levels = np.round(np.linspace(0, 0.6, 7), 1)  # 设置噪声级别
#     k_values = np.arange(0.4, 2.05, 0.05)  # 你希望测试的 k 值范围
#
#     # 用于存储最终结果
#     best_k_results = []
#
#     for data_name in datasets:
#         file_path = fr'C:\Users\20583\Desktop\data\{data_name}'  # 假设是 CSV 格式文件
#         print(f'当前处理的是{data_name}')
#         data = pd.read_csv(file_path)
#         X = data.iloc[:, :-1].values
#         y = data.iloc[:, -1].values
#         num_classes = len(np.unique(y))
#
#         # 对数据进行标准化处理
#         scaler = StandardScaler()
#         X = scaler.fit_transform(X)
#
#         # 用于存储每个噪声级别下每个 k 对应的准确率
#         accuracy_matrix = {k: [] for k in k_values}
#
#         # 使用十折交叉验证
#         skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
#         # 为每个噪声级别测试
#         noise_level_accuracies = {noise_level: {k: [] for k in k_values} for noise_level in noise_levels}
#
#         # 为每个噪声级别测试
#         for noise_level in noise_levels:
#             # 十折交叉验证
#             for train_index, test_index in skf.split(X, y):
#                 X_train, X_test = X[train_index], X[test_index]
#                 y_train, y_test = y[train_index], y[test_index]
#
#                 # 仅对训练集标签添加噪声
#                 y_train_noisy = add_label_noise(y_train, noise_level, num_classes)
#
#                 # 对每个 k 值进行测试，记录在该噪声水平下的准确率
#                 for k in k_values:
#                     accuracy, _ = DCHIG(X_train, X_test, y_train_noisy, y_test, k)
#                     accuracy_matrix[k].append(accuracy)
#                     noise_level_accuracies[noise_level][k].append(accuracy)
#
#         # 计算每个噪声率下各 k 的平均准确率
#         avg_accuracy_for_noise_levels = {noise_level: [] for noise_level in noise_levels}
#         for noise_level in noise_levels:
#             avg_accuracy_for_noise_levels[noise_level] = {
#                 k: np.mean(accuracies) for k, accuracies in noise_level_accuracies[noise_level].items()}
#
#         # 计算每个 k 在所有噪声级别下的平均准确率
#         average_accuracies = {
#             k: np.mean([avg_accuracy_for_noise_levels[noise_level][k] for noise_level in noise_levels])
#             for k in k_values}
#
#         # 找到具有最大平均准确率的 k
#         best_k = max(average_accuracies, key=average_accuracies.get)
#         best_accuracy = average_accuracies[best_k]
#
#         # 打印该 k 在不同噪声水平下的准确率
#         print(f"\nBest k for {data_name}: {best_k:.2f}, with highest average accuracy: {best_accuracy:.4f}")
#         for noise_level in noise_levels:
#             print(f"  Noise level: {noise_level:.2f}, Accuracy: {avg_accuracy_for_noise_levels[noise_level][best_k]:.4f}")
#
#         # 记录当前数据集的最佳 k 值及其准确率
#         best_k_results.append((data_name, best_k, best_accuracy))
#
#         print("\n" + "-" * 50)  # 分隔线，表示数据集处理完成
#
#     # 打印所有数据集的最终结果
#     print("\nFinal Results for all datasets:")
#     for result in best_k_results:
#         data_name, best_k, best_accuracy = result
#         print(f"Dataset: {data_name}, Best k: {best_k:.2f}, Best Overall Accuracy: {best_accuracy:.4f}")
#
#
# if __name__ == "__main__":
#     main()

import numpy as np
import pandas as pd
import time
from CLAS.DCHIG import DCHIG
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from joblib import Parallel, delayed  # 并行处理

# 添加噪声到标签
def add_label_noise(y, noise_level, num_classes):
    y_noisy = y.copy()
    num_samples = len(y)
    num_noisy_samples = int(noise_level * num_samples)

    noisy_indices = np.random.choice(num_samples, num_noisy_samples, replace=False)

    for idx in noisy_indices:
        original_label = y[idx]
        possible_labels = [label for label in range(num_classes) if label != original_label]
        y_noisy[idx] = np.random.choice(possible_labels)

    return y_noisy

datasets = ['austra.csv', 'Diabetes.csv', 'Spam.csv', 'mushroom.csv', 'German.csv', 'Wave.csv', 'optdigits.csv',
            'texture.csv', 'wdbc.csv', 'fourclass.csv', 'pen.csv', 'splice.csv', 'svmguide1.csv', 'image-seg.csv',
            'Letter.csv']  # 数据集列表

noise_levels = np.round(np.linspace(0, 0.6, 7), 1)  # 噪声级别
k_values = np.arange(0.4, 2.05, 0.05)  # k 值范围

# 单数据集处理逻辑
def process_dataset(data_name):
    file_path = fr'C:\Users\20583\Desktop\data\{data_name}'  # 数据路径
    print(f'当前处理的是 {data_name}')
    data = pd.read_csv(file_path)
    X = data.iloc[:, :-1].values
    y = data.iloc[:, -1].values
    num_classes = len(np.unique(y))

    # 数据标准化
    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    # 用于存储每个噪声级别下每个 k 对应的准确率
    noise_level_accuracies = {noise_level: {k: [] for k in k_values} for noise_level in noise_levels}

    start_time = time.time()  # 开始计时

    # 噪声水平循环
    for noise_level in noise_levels:
        # 十折交叉验证
        skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
        for train_index, test_index in skf.split(X, y):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]

            # 添加噪声
            y_train_noisy = add_label_noise(y_train, noise_level, num_classes)

            # 测试每个 k 值
            for k in k_values:
                accuracy, _ = DCHIG(X_train, X_test, y_train_noisy, y_test, k)
                noise_level_accuracies[noise_level][k].append(accuracy)

    end_time = time.time()  # 结束计时
    elapsed_time = end_time - start_time
    print(f"处理 {data_name} 耗时: {elapsed_time:.2f} 秒")

    # 计算平均准确率
    avg_accuracy_for_noise_levels = {
        noise_level: {k: np.mean(accuracies) for k, accuracies in noise_level_accuracies[noise_level].items()}
        for noise_level in noise_levels
    }

    # 保存每个噪声水平、 k 值和平均准确率
    all_results = []
    for noise_level in noise_levels:
        for k, avg_accuracy in avg_accuracy_for_noise_levels[noise_level].items():
            all_results.append([data_name, noise_level, k, avg_accuracy])

    # 找到全局最佳 k 值
    average_accuracies = {
        k: np.mean([avg_accuracy_for_noise_levels[noise_level][k] for noise_level in noise_levels])
        for k in k_values
    }
    best_k = max(average_accuracies, key=average_accuracies.get)
    best_accuracy = average_accuracies[best_k]

    return data_name, elapsed_time, all_results, (data_name, best_k, best_accuracy)

# # 主函数
def main():
    # 使用并行处理所有数据集
    results = Parallel(n_jobs=-1)(delayed(process_dataset)(data_name) for data_name in datasets)

    # 解析结果
    all_results = []
    best_k_results = []
    for data_name, elapsed_time, dataset_results, best_k_result in results:
        all_results.extend(dataset_results)
        best_k_results.append(best_k_result)

    # 保存结果到 CSV 文件
    results_df = pd.DataFrame(all_results, columns=["Dataset", "Noise_Level", "k", "Avg_Accuracy"])
    results_df.to_csv("all_results.csv", index=False)
    print("详细结果已保存到 all_results.csv")

    # 保存最佳 k 值结果
    best_k_df = pd.DataFrame(best_k_results, columns=["Dataset", "Best_k", "Best_Accuracy"])
    best_k_df.to_csv("best_k_results.csv", index=False)
    print("最佳 k 值结果已保存到 best_k_results.csv")

    # 打印最终结果
    print("\nFinal Results for all datasets:")
    for result in best_k_results:
        data_name, best_k, best_accuracy = result
        print(f"Dataset: {data_name}, Best k: {best_k:.2f}, Best Overall Accuracy: {best_accuracy:.4f}")


if __name__ == "__main__":
    main()

# def KMGBKNN(X_train, X_test, y_train, y_test):
#     accuracies_by_k = []
#     k = 0.4
#     while k <= 2:
#         accuracy, _ = DCHIG(X_train, X_test, y_train, y_test, k)
#         accuracies_by_k.append((k, accuracy))
#         k = round(k + 0.05, 2)
#     return accuracies_by_k
