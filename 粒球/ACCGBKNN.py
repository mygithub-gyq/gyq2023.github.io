import ast
import math
import time
import warnings
from itertools import zip_longest

import pandas as pd
import random
import numpy
import scipy.io
import matplotlib.pyplot as plt
from sklearn.cluster import k_means
from sklearn.metrics import accuracy_score, f1_score
import numpy as np


# 1.输入数据data
# 2.打印绘制原始数据
# 3.判断粒球的纯度
# 4.纯度不满足要求，k-means划分粒球
# 5.绘制每个粒球的数据点
# 6.计算粒球均值，得到粒球中心和半径，绘制粒球

# Calculate label and purity of granular-balls
from sklearn.model_selection import StratifiedKFold


def get_label_and_purity(gb):
    # Calculate the number of data categories
    len_label = numpy.unique(gb[:, 0], axis=0)
    # print(len_label)

    if len(len_label) == 1:
        purity = 1.0
        label = len_label[0]
    else:
        num = gb.shape[0]
        gb_label_temp = {}
        for label in len_label.tolist():
            # Separate data with different labels
            gb_label_temp[sum(gb[:, 0] == label)] = label
        # print(gb_label_temp)
        # The proportion of the largest category of data in all data
        max_label = max(gb_label_temp.keys())
        purity = max_label / num if num else 1.0
        label = gb_label_temp[max_label]
    # print(label)
    # label, purity
    return label, purity


# Calculate granular-balls center and radius
def calculate_center_and_radius(gb):
    data_no_label = gb[:, 1:]
    # print(data_no_label)
    center = data_no_label.mean(axis=0)
    radius_mean = numpy.mean((((data_no_label - center) ** 2).sum(axis=1) ** 0.5))
    # radius_max = numpy.max((((data_no_label - center) ** 2).sum(axis=1) ** 0.5))
    return center, radius_mean


# Calculate distance
def calculate_distances(data, p):
    # print(data, p)
    return ((data - p) ** 2).sum(axis=0) ** 0.5


# draw granular-balls
def gb_plot(gb_dict, plt_type=0):
    color = {-1: 'r', 1: 'k', 0: 'b', 3: 'y', 4: 'g', 5: 'c', 6: 'm', 7: 'peru', 8: 'pink', 9: 'gold'}
    plt.figure(figsize=(5, 4))  # width and height of the image
    plt.axis([-1.2, 1.2, -1, 1])
    for key in gb_dict.keys():
        gb = gb_dict[key][0][:, 0:3]
        label, p = get_label_and_purity(gb)
        k = np.unique(gb[:, 0], axis=0)
        center, radius_mean = calculate_center_and_radius(gb)

        if plt_type == 0:
            # plot all points
            for i in k.tolist():
                data0 = gb[gb[:, 0] == i]
                plt.plot(data0[:, 1], data0[:, 2], '.', color=color[i], markersize=5)

        if plt_type == 0 or plt_type == 1:  # draw balls
            theta = numpy.arange(0, 2 * numpy.pi, 0.01)
            x = center[0] + radius_mean * numpy.cos(theta)
            y = center[1] + radius_mean * numpy.sin(theta)
            plt.plot(x, y, color[label], linewidth=0.8)

        plt.plot(center[0], center[1], 'x' if plt_type == 0 else '.', color=color[label])  # draw centers
    plt.show()


# draw granular-balls
def plot_gb(granular_ball_list, plt_type=0):
    color = {-1: 'r', 1: 'k', 0: 'b'}
    plt.figure(figsize=(5, 4))
    plt.axis([-1.2, 1.2, -1, 1])
    ball_num_str = str(len(granular_ball_list))
    for granular_ball in granular_ball_list:
        label, p = get_label_and_purity(granular_ball)
        center, radius= calculate_center_and_radius(granular_ball)

        if plt_type == 0:
            data0 = granular_ball[granular_ball[:, 0] == 0]
            data1 = granular_ball[granular_ball[:, 0] == 1]
            data2 = granular_ball[granular_ball[:, 0] == -1]
            plt.plot(data0[:, 1], data0[:, 2], '.', color=color[0], markersize=5)
            plt.plot(data1[:, 1], data1[:, 2], '.', color=color[1], markersize=5)
            plt.plot(data2[:, 1], data2[:, 2], '.', color=color[-1], markersize=5)

        if plt_type == 0 or plt_type == 1:
            theta = numpy.arange(0, 2 * numpy.pi, 0.01)
            x = center[0] + radius * numpy.cos(theta)
            y = center[1] + radius * numpy.sin(theta)
            plt.plot(x, y, color[label], linewidth=0.8)

        plt.plot(center[0], center[1], 'x' if plt_type == 0 else '.', color=color[label])

    plt.show()


def splits(purity, gb_dict):
    gb_dict_new = {}
    while True:
        # Copy a temporary list, and then traverse the value
        if len(gb_dict_new) == 0:
            # initial assignment
            gb_dict_temp = gb_dict.copy()
        else:
            # Subsequent traversal assignment
            gb_dict_temp = gb_dict_new.copy()
        gb_dict_new = {}
        # record the number before a division
        ball_number_1 = len(gb_dict_temp)
        # print("ball_number_1:", ball_number_1)
        for key in gb_dict_temp.keys():
            gb_single = {}
            # Fetch dictionary data, including keys and values
            gb_single[key] = gb_dict_temp[key]
            # print("gb_single:", gb_single)
            gb = gb_single[key][0]
            # print(len(gb))

            # purity
            p = get_label_and_purity(gb)[1]
            # print(p)
            # Determine whether the purity meets the requirements, if not, continue to divide
            if p < purity and len(gb) != 1:
                # print(gb_single)
                gb_dict_re = splits_ball(gb_single).copy()
                gb_dict_new.update(gb_dict_re)
            else:
                gb_dict_new.update(gb_single)
                continue
        # gb_dict_new = adjust_center(gb_dict_new)
        # record the number after a division
        ball_number_2 = len(gb_dict_new)
        # print("ball_number_2:", len(gb_dict_new))
        # The number of granular-balls is the same as the number of granular-balls last divided, that is, it will not change
        if ball_number_1 == ball_number_2:
            break

        # draw granular-balls
        # gb_plot(gb_dict_new)

    # draw granular-balls
    # gb_plot(gb_dict_new)
    return gb_dict_new

# split granular-balls
def splits_ball(gb_dict):
    # {center: [gb, distances]}
    center = []  # old center
    distances_other_class = []  # distance to heterogeneous data points
    balls = []  # The result after clustering
    center_other_class = []
    ball_list = {}  # Returned dictionary result, key: center point, value (ball , distance from data to center)
    distances_other_temp = []

    centers_dict = []  # centers
    gbs_dict = []  # data
    distances_dict = []  # distances

    # Fetch dictionary data, including keys and values
    gb_dict_temp = gb_dict.popitem()
    for center_split in gb_dict_temp[0].split('_'):
        center.append(float(center_split))
    center = np.array(center)
    gb = gb_dict_temp[1][0]  # Get granular-ball data
    distances = gb_dict_temp[1][1]  # Take out the distance to the old center
    # print('center:', center)
    # print('gb:', gb)
    # print('distances:', distances)
    centers_dict.append(center)  # old center join the centers


    # Take a new center
    len_label = numpy.unique(gb[:, 0], axis=0)
    # When the input has only one type of data, select a point different from the original center
    if len(len_label) > 1:
        gb_class = len(len_label)
    else:
        gb_class = 2
    # Take multiple centers for multiple types of data
    len_label = len_label.tolist()
    for i in range(0, gb_class - 1):
        # print(len_label)
        if len(len_label) < 2:
            # When de-overlapping, there is no heterogeneous point situation
            gb_temp = np.delete(gb, distances.index(0), axis=0)  # Remove the old center
            ran = random.randint(0, len(gb_temp) - 1)
            center_other_temp = gb_temp[ran]  # Take a new center
            center_other_class.append(center_other_temp)
        else:
            if center[0] in len_label:
                len_label.remove(center[0])
            gb_temp = gb[gb[:, 0] == len_label[i], :]  # Extract heterogeneous data

            # random center of heterogeneity
            ran = random.randint(0, len(gb_temp) - 1)
            center_other_temp = gb_temp[ran]

            # center_other_temp = select_center(gb_temp)
            # print(center_other_temp)
            center_other_class.append(center_other_temp)
            # print(distances.index(max(distances)))
    # print('center_other_class:', center_other_class)
    # join the centers
    centers_dict.extend(center_other_class)
    # print('centers_dict:', centers_dict)

    # Store all data distance to old center
    distances_other_class.append(distances)
    # Calculate the distance to each new center
    for center_other in center_other_class:
        balls = []  # The result after clustering
        distances_other = []
        for feature in gb:
            distances_other.append(calculate_distances(feature[1:], center_other[1:]))
        # new centers
        # distances_dict.append(distances_other)
        distances_other_temp.append(distances_other)  # Temporary storage distance to each new center
        # Store all data distance to new center
        distances_other_class.append(distances_other)
    # print('distances_other_class:', len(distances_other_class))

    # The distance from a certain data to the original center and the new center, take the smallest for classification
    for i in range(len(distances)):
        distances_temp = []
        distances_temp.append(distances[i])
        for distances_other in distances_other_temp:
            distances_temp.append(distances_other[i])
        # print('distances_temp:', distances_temp)
        classification = distances_temp.index(min(distances_temp))  # 0:old center；1,2...：new centers
        balls.append(classification)
    # Clustering situation
    balls_array = np.array(balls)
    # print("Clustering situation：", balls_array)

    # Assign data based on clustering
    for i in range(0, len(centers_dict)):
        gbs_dict.append(gb[balls_array == i, :])
    # print('gbs_dict:', gbs_dict)

    # assign new distance
    i = 0
    for j in range(len(centers_dict)):
        distances_dict.append([])
    # print('distances_dict:', distances_dict)
    for label in balls:
        distances_dict[label].append(distances_other_class[label][i])
        i += 1
    # print('distances_dict:', distances_dict)

    # packed into a dictionary
    for i in range(len(centers_dict)):
        gb_dict_key = str(float(centers_dict[i][0]))
        for j in range(1, len(centers_dict[i])):
            gb_dict_key += '_' + str(float(centers_dict[i][j]))
        gb_dict_value = [gbs_dict[i], distances_dict[i]]  # Pellets + distance to centers
        ball_list[gb_dict_key] = gb_dict_value

    # print('ball_list:', ball_list)
    return ball_list

def accGBKNN(ball_dict, test_array):
    dict_list = []
    pre_list = []
    for row in test_array:
        for ballCenter in ball_dict:
            dis = calculate_distances(row, ballCenter["center"]) - ballCenter["radius"]
            ballCenter["dis"] = dis
            dict_list.append(ballCenter)
        min_dict = min(dict_list, key=lambda x: x["dis"])
        result = min_dict["label"]
        pre_list.append(result)

    return pre_list

def add_label_noise(y, noise_level):
    y = np.asarray(y, dtype=int)
    unique_classes = np.unique(y)
    noisy_indices = np.random.choice(len(y), int(noise_level * len(y)), replace=False)
    y_noisy = y.copy()
    for idx in noisy_indices:
        current_label = y[idx]
        possible_labels = unique_classes[unique_classes != current_label]
        new_label = np.random.choice(possible_labels)
        y_noisy[idx] = new_label
    return y_noisy

datasets = ['mushroom.csv']
def main():
    warnings.filterwarnings("ignore")  # ignore warning
    # data_list = ['fourclass', 'mushroom', 'breastcancer-scale', 'votes', 'splice', 'ecoli', 'sonar', 'parkinsons_scale',
    #              'image-seg_scale', 'pen', 'svmguide1(label)', 'svmguide3(label)', 'creditApproval(label)']
    data_list = ['spect']
    purity = 0.95  # 纯度阈值
    n_splits = 5  # 5折交叉验证
    for data_nm in datasets:
        filepath = fr'C:\Users\20583\Desktop\data\{data_nm}'
        data_frame = pd.read_csv(filepath, header=None)
        data = data_frame.values
        features = data[:, :-1]
        labels = data[:, -1]

        ### 十折交叉验证
        skf = StratifiedKFold(n_splits, shuffle=True, random_state=42)  # 10折交叉验证划分数据
        sum_acc, sum_f1, num_gb = 0.0, 0.0, 0
        stdlst = []
        times = 0.0
        for train_index, test_index in skf.split(features, labels):
            train_features, X_test = features[train_index], features[test_index]
            train_labels, Y_test = labels[train_index], labels[test_index]

            # 给训练集的标签添加噪声
            train_labels_noisy = add_label_noise(train_labels, 0.2)

            # 构造带有噪声的训练集
            train = np.column_stack((train_labels_noisy, train_features))
            start = time.time()
            ball_list = []
            # center_init = data[random.randint(0, len(train) - 1), :]
            random.seed(42)
            center_init = random.choice(train)
            # print(center_init)
            # The distance from the initial center to the data
            distance_init = []
            for feature in train:
                distance_init.append(calculate_distances(feature[1:], center_init[1:]))

            # packed into a dictionary:{center: [gb, distances]}
            gb_dict = {}
            gb_dict_key = str(center_init.tolist()[0])
            for j in range(1, len(center_init)):
                gb_dict_key += '_' + str(center_init.tolist()[j])
            gb_dict_value = [train, distance_init]
            gb_dict[gb_dict_key] = gb_dict_value

            # first time drawing a sphere
            # gb_plot2(gb_dict)
            # print(gb_dict)

            # Classification
            gb_dict = splits(purity=purity, gb_dict=gb_dict)
            # print(gb_dict)

            k_centers = []
            splits_k = len(gb_dict)
            for key in gb_dict.keys():
                k_center = []
                for k in key.split('_'):
                    k_center.append(float(k))
                k_centers.append(k_center[1:])
            # print(np.array(k_centers))
            # Perform a global division
            label_cluster = \
            k_means(X=train[:, 1:], n_clusters=splits_k, n_init=2, init=np.array(k_centers), random_state=42)[1]
            for single_label in range(splits_k):
                ball_list.append(train[label_cluster == single_label, :])
            # gb_plot2(gb_dict)
            # draw granular-balls
            # plot_gb(ball_list)
            # plot_gb(ball_list, 1)
            # print(len(ball_list))
            # print(ball_list)
            # record number
            num_gb += len(ball_list)
            # record end time
            end = time.time()
            times = (end - start) + times

            # print('Number of granular-balls：', len(gb_dict))
            # print('time', round((end - start) * 1000, 0))
            # ball_list 里面记录的是数据集生成的各个粒球包含的样本 还需要根据样本重新计算其标签、中心、半径
            centerList, radiusList, label = [], [], []
            for gb in ball_list:
                center, radius = calculate_center_and_radius(gb)  # 每个gb是一个二维数组, 表示包含在粒球内的样本
                centerList.append(center)
                radiusList.append(radius)
                l, p = get_label_and_purity(gb)
                label.append(l)
            ballInfo = []  # [{label:1, center:[], radius:1},{}] 所有球的标签，中心，半径
            for i in range(len(label)):
                ballInfo.append({"label": label[i], "center": centerList[i], "radius": radiusList[i]})
            # print(ballInfo)
            pre_test = accGBKNN(ballInfo, X_test)

            acc = accuracy_score(Y_test, pre_test)
            f1 = f1_score(Y_test, pre_test, average='macro')
            sum_f1 += f1
            sum_acc += acc
            stdlst.append(acc)
        standard = round(np.std(stdlst), 3)

        print('Average accuracy of', data_nm, ':', round(sum_acc / n_splits, 3))
        print('std', data_nm, standard)
        print('Average f1 of', data_nm, ':', sum_f1 / n_splits)
        print('Average number of balls for', data_nm, ':', num_gb / n_splits)
        print('Average time of', data_nm, ':', times * 1000 / n_splits)
        print('########################################')
        # with open('accelerate.txt', 'a') as file:
        #     file.write('Average accuracy of '+data_nm+':'+str(round(sum_acc / n_splits, 3))+'\n')
        #     file.write('Average number of balls for '+data_nm+':'+str(num_gb / n_splits)+'\n')
        #     file.write('Average time of '+data_nm+':'+str(times * 1000 / n_splits)+'\n')
        #     file.write('#######################################################'+'\n')



if __name__ == '__main__':
    main()

# def ACCGBKNN(X_train, X_test, y_train, y_test):
#     accuracies_by_purity = []
#     purity_domain = 0.8
#     X_train = np.column_stack((y_train, X_train))
#     while purity_domain <= 1:
#         start = time.time()
#         ball_list = []
#         random.seed(42)
#         center_init = random.choice(X_train)
#         distance_init = []
#         for feature in X_train:
#             distance_init.append(calculate_distances(feature[1:], center_init[1:]))
#         gb_dict = {}
#         gb_dict_key = str(center_init.tolist()[0])
#         for j in range(1, len(center_init)):
#             gb_dict_key += '_' + str(center_init.tolist()[j])
#         gb_dict_value = [X_train, distance_init]
#         gb_dict[gb_dict_key] = gb_dict_value
#         gb_dict = splits(purity=purity_domain, gb_dict=gb_dict)
#         k_centers = []
#         splits_k = len(gb_dict)
#         for key in gb_dict.keys():
#             k_center = []
#             for k in key.split('_'):
#                 k_center.append(float(k))
#             k_centers.append(k_center[1:])
#         label_cluster = \
#         k_means(X=X_train[:, 1:], n_clusters=splits_k, n_init=2, init=np.array(k_centers), random_state=42)[1]
#         for single_label in range(splits_k):
#             ball_list.append(X_train[label_cluster == single_label, :])
#         # num_gb += len(ball_list)
#         end = time.time()
#         # times = (end - start) + times
#         centerList, radiusList, label = [], [], []
#         for gb in ball_list:
#             center, radius = calculate_center_and_radius(gb)
#             centerList.append(center)
#             radiusList.append(radius)
#             l, p = get_label_and_purity(gb)
#             label.append(l)
#         ballInfo = []
#         for i in range(len(label)):
#             ballInfo.append({"label": label[i], "center": centerList[i], "radius": radiusList[i]})
#         pre_test = accGBKNN(ballInfo, X_test)
#         acc = accuracy_score(y_test, pre_test)
#         f1 = f1_score(y_test, pre_test, average='macro')
#         times = end - start
#         accuracies_by_purity.append((purity_domain, acc))
#         purity_domain = round(purity_domain + 0.01, 2)
#     return accuracies_by_purity
