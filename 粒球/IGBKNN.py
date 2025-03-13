import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.model_selection import StratifiedKFold
import random


# 计算欧几里得距离
def euclidean_distance(x1, x2):
    return np.linalg.norm(x1 - x2)


# 计算一个样本到其他类别的最短距离和第二短距离
def min_distance_to_other_classes(sample, label, dataset, labels):
    min_dist = float('inf')
    second_min_dist = float('inf')

    # 遍历所有样本，计算到其他类别的最短和第二近距离
    for idx, (other_sample, other_label) in enumerate(zip(dataset, labels)):
        if other_label != label:  # 只计算到其他类别的距离
            dist = euclidean_distance(sample, other_sample)
            if dist < min_dist:
                second_min_dist = min_dist
                min_dist = dist
            elif dist < second_min_dist:
                second_min_dist = dist

    return min_dist, second_min_dist


# 局部优化：更新粒球的中心和半径
def optimize_granular_ball(ball):
    current_samples = ball[3]  # 粒球内的样本
    if not current_samples:
        return ball  # 如果粒球内没有样本，直接返回原始粒球

    # 重新计算中心
    new_center = np.mean([sample[0] for sample in current_samples], axis=0)

    # 重新计算半径：簇内样本到中心的平均距离
    new_radius = np.mean([euclidean_distance(new_center, sample[0]) for sample in current_samples])

    # 更新粒球
    return [new_center, ball[1], new_radius, current_samples]


def generate_granular_balls(dataset, labels):
    balls = []  # 用于存储生成的粒球
    D_star = list(zip(dataset, labels))  # 数据 + 标签
    unique_labels = set(labels)
    remaining_samples = list(D_star)  # 剩余的样本
    ball_count = 0  # 用于记录粒球个数

    while remaining_samples:
        k = len(unique_labels)  # 选择 k 个异类样本作为临时中心

        # 确保 k 不会超过剩余样本数
        k = min(k, len(remaining_samples))

        # 如果剩余样本数不足 k，抛出警告并调整 k
        if k <= 0:
            print("Remaining samples are too few, terminating early.")
            break

        selected_centers = random.sample(remaining_samples, k)  # 随机选 k 个样本

        for i, (sample, label) in enumerate(selected_centers):
            min_dist, second_min_dist = min_distance_to_other_classes(sample, label, dataset, labels)

            # 初始化粒球
            current_samples = [(sample, label)]  # 粒球内的样本初始为该点
            radius = min_dist  # 初始半径为最短距离

            # 根据半径找到所有在范围内的样本
            for s, sample_label in D_star:
                if sample_label == label and euclidean_distance(s, sample) <= radius:
                    current_samples.append((s, sample_label))

            if len(current_samples) == 1:  # 如果粒球内只有一个点，调整半径为第二近距离
                radius = second_min_dist
                current_samples = [(sample, label)]  # 清空当前样本，重新计算

                for s, sample_label in D_star:
                    if sample_label == label and euclidean_distance(s, sample) <= radius:
                        current_samples.append((s, sample_label))

                # 如果粒球内仍只有一个点，跳过该粒球
                if len(current_samples) == 1:
                    print(f"Skipping ball for label {label} with 1 sample.")
                    continue  # 跳过该粒球

            # 执行局部优化
            optimized_ball = optimize_granular_ball([sample, label, radius, current_samples])
            balls.append(optimized_ball)
            ball_count += 1

            # 更新数据集 D_star：删除粒球中的样本
            remaining_samples = [item for item in remaining_samples if
                                 not any(np.array_equal(item[0], sample[0]) for sample in current_samples)]


    return balls, ball_count


# 数据加噪声
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


# 交叉验证与分类
def run_cross_validation(X, y, noise_level):
    fold_accuracies = []
    fold_ball_counts = []  # 用于记录每一折的粒球数量
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for train_index, test_index in skf.split(X, y):
        X_train, X_test = X[train_index], X[test_index]
        y_train, y_test = y[train_index], y[test_index]

        # 标准化数据
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        # 生成粒球并进行分类
        balls, ball_count = generate_granular_balls(X_train, y_train)
        predictions = [classify_sample(balls, x) for x in X_test]

        # 计算准确率
        accuracy = accuracy_score(y_test, predictions)
        fold_accuracies.append(accuracy)

        # 记录粒球个数
        fold_ball_counts.append(ball_count)

    # 计算该噪声级别下的平均粒球个数（按训练集样本比例计算）
    average_ball_count = np.mean(fold_ball_counts)

    return np.mean(fold_accuracies), average_ball_count


# 分类样本
def classify_sample(balls, x):
    closest_ball = None
    closest_distance = float('inf')

    for ball in balls:
        dist = euclidean_distance(x, ball[0])

        if dist < closest_distance:  # 更新最近粒球
            closest_distance = dist
            closest_ball = ball

    return closest_ball[1]  # 返回该粒球的标签


# 主函数
def main():
    datasets = ['austra.csv', 'Diabetes.csv', 'German.csv', 'Wave.csv', 'optdigits.csv',
                'texture.csv', 'wdbc.csv', 'fourclass.csv', 'pen.csv', 'splice.csv', 'svmguide1.csv', 'image-seg.csv',
                'Letter.csv', 'yeast.csv']
    noise_levels = np.round(np.linspace(0, 0.6, 7), 1)

    for data_name in datasets:
        print(f'当前处理的是 {data_name}')
        file_path = fr'C:\Users\20583\Desktop\data\{data_name}'  # 假设是 CSV 格式文件
        data = pd.read_csv(file_path)
        X = data.iloc[:, :-1].values
        y = data.iloc[:, -1].values
        num_classes = len(np.unique(y))

        # 对每个噪声级别进行处理
        for noise_level in noise_levels:
            noisy_y = add_label_noise(y, noise_level, num_classes)
            accuracy, ball_count = run_cross_validation(X, noisy_y, noise_level)
            print(f"噪声级别: {noise_level:.2f}, 准确率: {accuracy:.4f}, 平均粒球个数: {ball_count:.4f}")


if __name__ == "__main__":
    main()


#
# def IGBKNN(X_train,  X_test, y_train,y_test):
#     # 生成粒球并进行分类
#     balls = generate_granular_balls(X_train, y_train)
#     predictions = [classify_sample(balls, x) for x in X_test]
#
#     # 计算准确率
#     accuracy = accuracy_score(y_test, predictions)
#     return accuracy


