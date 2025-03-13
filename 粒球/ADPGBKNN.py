import time
import random
import numpy
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from CLAS import my_kmeans

from sklearn.metrics import accuracy_score, f1_score

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
    radius_mean = np.mean((((data_no_label - center) ** 2).sum(axis=1) ** 0.5))
    # radius_max = numpy.max((((data_no_label - center) ** 2).sum(axis=1) ** 0.5))
    return center, radius_mean


# Calculate distance
def calculate_distances(data, p):
    return ((data - p) ** 2).sum(axis=0) ** 0.5


# Determining the splitting conditions of granular-balls
# gb_dict {"label-x-y":[array(gb), array(distance)]
def splits(purity_init, gb_dict):
    gb_dict_new = {}
    gb_dict_temp = {}
    first = 1
    purity_init_temp = 0
    init_samples_count = 0
    while True:
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
        # print('gb_dict_temp:', gb_dict_temp.keys())
        for key in gb_dict_temp.keys():
            # print(key)
            gb_single = {}
            after_purity = []  # The purity of the child ball
            weight_p = 0  # Weighted Purity Sum of the child ball
            # Fetch dictionary data, including keys and values
            gb_single[key] = gb_dict_temp[key]
            # print('gb_single:', gb_single.keys())

            # 每个中心包含的样本
            gb = gb_single[key][0]
            cur_gb_samples_count = len(gb)
            # print(cur_gb_samples_count)
            # print(gb)
            p = get_label_and_purity(gb)[1]
            # print('p:', p)

            # 如果只有一个样本
            if len(gb) == 1:
                gb_dict_new.update(gb_single)
                continue
            gb_single_temp = gb_single.copy()

            ## 当前粒球的预划分子粒球
            gb_dict_re = splits_ball(gb_single).copy()
            if first == 1:
                for key0 in gb_dict_re.keys():
                    purity_init_temp = max(purity_init_temp, get_label_and_purity(gb_dict_re[key0][0])[1])
                purity_init = purity_init_temp
                init_samples_count = len(gb)
                # print(init_samples_count)
                first = 0
            # print('gb_dict_re:', gb_dict_re.keys())
            # for key0 in gb_dict_re.keys():
            #     after_purity.append(get_label_and_purity(gb_dict_re[key0][0])[1])
            # # print(after_purity)
            # average_p = np.mean(after_purity)

            ### 遍历预划分的子粒球
            for key0 in gb_dict_re.keys():
                weight_p = weight_p + get_label_and_purity(gb_dict_re[key0][0])[1] * (
                        len(gb_dict_re[key0][0]) / len(gb))
            # The weighted purity sum of the child balls is greater than the purity of the parent ball,
            # or the weighted purity sum of the child balls is less than the lower bound of purity

            if p <= purity_init or weight_p > p:
                gb_dict_new.update(gb_dict_re)
            else:
                gb_dict_new.update(gb_single_temp)

        # gb_plot(gb_dict_new)
        gb_dict_new = isOverlap(gb_dict_new)
        # record the number after a division
        ball_number_2 = len(gb_dict_new)
        # The number of granular-balls is the same as the number of granular-balls last divided, that is, it will not change
        if ball_number_1 == ball_number_2:
            break
    return gb_dict_new


# de-overlap
def isOverlap(gb_dict):
    Flag = True
    later_dict = gb_dict.copy()
    while True:
        ball_number_1 = len(gb_dict)
        centers = []  # centers
        keys = []  # keys
        dict_overlap = {}  # overlapped balls
        center_radius = {}  # {center:[center, gb, max_distances, radius]}
        for key in later_dict.keys():
            center, radius_mean = calculate_center_and_radius(later_dict[key][0])
            center_radius[key] = [center, later_dict[key][0], later_dict[key][1], radius_mean]
            center_temp = []
            keys.append(key)
            for center_split in key.split('_'):
                center_temp.append(float(center_split))
            centers.append(center_temp)
        centers = np.array(centers)

        # The first division uses the incoming granular-ball parameters, and the next uses only overlapping granules
        if Flag:
            later_dict = {}
            Flag = False
        for i, center01 in enumerate(centers):
            for j, center02 in enumerate(centers):
                if i < j and center01[0] != center02[0]:
                    # If the labels of the two balls are different and the distance between the centers of
                    # the two balls is less than the sum of the radii of the two balls (the boundaries overlap)
                    if calculate_distances(center_radius[keys[i]][0], center_radius[keys[j]][0]) < \
                            center_radius[keys[i]][3] + center_radius[keys[j]][3]:
                        dict_overlap[keys[i]] = center_radius[keys[i]][1:3]
                        dict_overlap[keys[j]] = center_radius[keys[j]][1:3]
                        # print(center_radius[keys[i]][3], center_radius[keys[j]][3])

                        # if center_radius[keys[i]][3]<center_radius[keys[j]][3]:
                        #     dict_overlap[keys[i]] = center_radius[keys[i]][1:3]
                        # if 0.2836400852204842 < 0.31031341335900386:
                        #     print(center_radius[keys[i]][3], center_radius[keys[j]][3])

                        # else:
                        #     dict_overlap[keys[j]] = center_radius[keys[j]][1:3]


        # gb_plot(gb_dict)
        # print('dict_overlap:', dict_overlap.keys())
        # When the number of overlapping granular-balls is 0, return
        # print("#############################",len(dict_overlap))
        if len(dict_overlap) == 0:
            gb_dict.update(later_dict)
            ball_number_2 = len(gb_dict)
            if ball_number_1 != ball_number_2:
                Flag = True
                later_dict = gb_dict.copy()
            else:
                return gb_dict
        gb_dict_single = dict_overlap.copy()  # Copy a temporary list, and then traverse the value
        for i in range(len(gb_dict_single)):
            gb_single = {}
            # Get dictionary data, including key values
            dict_temp = gb_dict_single.popitem()
            gb_single[dict_temp[0]] = dict_temp[1]
            # print('gb_single:', gb_single)
            # If the granular-ball is a single point, do not continue to divide
            if len(dict_temp[1][0]) == 1:
                # later_dict.update(gb_single)
                continue
            gb_dict_new = splits_ball(gb_single).copy()
            # print('gb_dict_new:', gb_dict_new.keys())
            later_dict.update(gb_dict_new)
        # print('later_dict:', later_dict.keys())


# split granular-balls
def splits_ball(gb_dict):
    #gb_dict {center: [gb(二维数组), distances(一维数组)]}
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


def adpGBKNN(ball_dict, test_array):
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
import json
def GBKNN_density(ball_dict, test_array):
    dict_dis = {}
    pre_label_list = []
    for row in test_array:
        for ballCenter in ball_dict:
            dis = calculate_distances(row, ballCenter["center"]) - ballCenter["radius"]
            # dict_dis[json.dumps(ballCenter)] = dis
            temp = {"label": int(ballCenter["label"]), "density":float(ballCenter["density"])}
            dict_dis[json.dumps(temp)] = float(dis)
        # predict_ball = min(dict_dis, key=dict_dis.get)
        # pre_label_list.append(predict_ball.label)
        count = sum(1 for value in dict_dis.values() if value < 0)
        if count == 0 or count == 1:
            predict_ball = min(dict_dis, key = dict_dis.get)
            pre_label_list.append(json.loads(predict_ball)["label"])
        else:
            inner_dict = [json.loads(key) for key, value in dict_dis.items() if value < 0]
            predict_ball = max(inner_dict, key=lambda x: x["density"])
            pre_label_list.append(predict_ball["label"])
    return pre_label_list

def plot(data):
    x = data[:,0]
    y = data[:, 1]
    # tx = Test[:,0]
    # ty = Test[:,1]
    radius = data[:, 2]
    colorList = data[:, 3]
    fig, ax = plt.subplots()
    for i in range(len(data)):
        color = 'green' if colorList[i] == 1 else 'red'
        circle = plt.Circle((x[i], y[i]), radius[i], color=color, alpha=0.5, fill=False,lw=2)
        ax.add_artist(circle)
        ax.scatter(x[i], y[i], color=color,marker='x',s=25,zorder=5)
    # for i in range(len(Test)):
        # ax.scatter(tx[i], ty[i],color="green", marker='x',s=25,zorder=5)
    ax.set_aspect('equal', 'box')
    # 设置坐标轴范围
    ax.set_xlim([0, 1])
    ax.set_ylim([0, 1])

    # 添加标题
    # plt.title("Scatter of Circles with Different Colors")
    # 显示图形
    plt.show()


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

datasets = ['wdbc.csv', 'fourclass.csv']

def main():
    np.set_printoptions(suppress=True) # ignore warning
    # data_list = ['fourclass', 'breastcancer', 'pen', 'svmguide1', 'diabetes', 'creditApproval', 'spectfheart',
    #              'optdigits', 'Raisin', 'thyroid', 'phoneme', 'electrical', 'housevotes', 'HTRU2', 'codrna']
    data_list = ['fourclass']
    n_splits = 10
    noise_rate = 0
    for data_nm in datasets:
        filepath = fr'C:\Users\20583\Desktop\data\{data_nm}'
        print(f"当前数据集是{data_nm}")
        data_frame = pd.read_csv(filepath, header=None)
        data = data_frame.values
        features = data[:, :-1]
        labels = data[:, -1]

        ### 十折交叉验证
        skf = StratifiedKFold(n_splits, shuffle=True, random_state=42)  # 10折交叉验证划分数据
        sum_acc, sum_f1, num_gb = 0.0, 0.0, 0
        times = 0.0

        for train_index, test_index in skf.split(features, labels):
            train_features, X_test = features[train_index], features[test_index]
            train_labels, Y_test = labels[train_index], labels[test_index]

            # 给训练集的标签添加噪声
            train_labels_noisy = add_label_noise(train_labels, 0.5)

            # 构造带有噪声的训练集
            train = np.column_stack((train_labels_noisy, train_features))
            start = time.time()
            ball_list = []
            purity_init = get_label_and_purity(train)[1]
            # center_init = train[random.randint(0, len(train) - 1), :]
            random.seed(42)
            center_init = random.choice(train)

            distance_init = []
            for feature in train:
                # The distance from the initial center to the data
                distance_init.append(calculate_distances(feature[1:], center_init[1:]))
            # print('distance_init:', len(distance_init))

            # packed into a dictionary:{center: [gb, distances]}
            gb_dict = {}
            gb_dict_key = str(center_init.tolist()[0])
            for j in range(1, len(center_init)):
                gb_dict_key += '_' + str(center_init.tolist()[j])
            gb_dict_value = [train, distance_init]
            gb_dict[gb_dict_key] = gb_dict_value

            # draw granular-balls
            # gb_plot(gb_dict)

            # Classification
            gb_dict = splits(purity_init=purity_init, gb_dict=gb_dict)
            # print('gb_dict', gb_dict)
            k_centers = []
            splits_k = len(gb_dict)
            # print(splits_k)
            for key in gb_dict.keys():
                k_center = []
                for k in key.split('_'):
                    k_center.append(float(k))
                k_centers.append(k_center[1:])
            # print(np.array(k_centers))
            # Perform a global division
            ball_list = my_kmeans.k_means(train, np.array(k_centers), iter=1)
            # plot_gb(ball_list)
            # label_cluster = \
            # k_means(X=train[:, 1:], n_clusters=splits_k, n_init=1, init=np.array(k_centers), random_state=42)[1]
            # for single_label in range(splits_k):
            #     ball_list.append(train[label_cluster == single_label, :])
            num_gb += len(ball_list)


            # gb_plot(gb_dict)
            # plot_gb(ball_list)
            centerList, radiusList, label, density = [], [], [], []
            # print("balllist###################",ball_list)
            for gb in ball_list:
                center, radius = calculate_center_and_radius(gb)  # 每个gb是一个二维数组
                centerList.append(center)
                radiusList.append(radius)
                l, p = get_label_and_purity(gb)
                label.append(l)
                # 密度
                den = float('inf') if radius == 0 else gb.shape[0] / radius
                density.append(den)
            ballInfo = []  # [{label:1, center:[], radius:1},{}] 所有球的标签，中心，半径
            for i in range(len(label)):
                ballInfo.append({"label": label[i], "center": centerList[i], "radius": radiusList[i], "density":density[i]})

            end = time.time()
            # pre_test = adpGBKNN(ballInfo, X_test)
            pre_test = GBKNN_density(ballInfo,X_test)
            times = (end - start) + times
            acc = accuracy_score(Y_test, pre_test)
            # print("acc",acc)
            # print('curTime', 1000*(end-start))
            # plot(plotData)
            f1 = f1_score(Y_test, pre_test, average='macro')
            sum_f1 += f1
            sum_acc += acc
        # data = allGBs
        print('Average accuracy of', data_nm, ':', round(sum_acc / n_splits, 3))
        print('Average f1 of', data_nm, ':', sum_f1 / n_splits)
        print('Average number of balls for', data_nm, ':', num_gb / n_splits)
        print('Average time of', data_nm, ':', times * 1000 / n_splits)
        print('noise_rate of ', data_nm, ':', noise_rate)
        print('##########################################')
        fp = '../RandomKnn/PAGBG/noise' + str(noise_rate) + 'Res/' + 'adapknnPaper2-v4-' + str(noise_rate) + 'noise.txt'
        # with open(fp, 'a') as file:
        #     file.write('Average accuracy of ' + data_nm + ':' + str(round(sum_acc / n_splits, 3)) + '\n')
        #     file.write('Average number of balls for ' + data_nm + ':' + str(num_gb / n_splits) + '\n')
        #     file.write('Average f1 of ' + data_nm + ':' + str(sum_f1 / n_splits) + '\n')
        #     file.write('Average time of ' + data_nm + ':' + str(times * 1000 / n_splits) + '\n')
        #     file.write('noise_rate of ' + data_nm + ':' + str(noise_rate) + '\n')
        #     file.write('#######################################################' + '\n')
        #     file.write('\n')

if __name__ == '__main__':
    main()


# def ADPGBKNN(X_train, y_train, X_test, y_test):
#     accuracies_by_purity = []  # List to store (purity, accuracy) pairs
#     purity_domain = 0.8
#     times = 0  # Initialize time variable
#     num_gb = 0  # Initialize num_gb counter
#     while purity_domain <= 1.0:
#         start = time.time()
#         train = np.column_stack((y_train, X_train))  # Combine labels and features
#         ball_list = []
#         purity_init = get_label_and_purity(train)[1]
#         random.seed(42)
#         center_init = random.choice(train)
#         distance_init = [calculate_distances(feature[1:], center_init[1:]) for feature in train]  # Calculate distances
#         gb_dict = {}
#         gb_dict_key = str(center_init.tolist()[0])
#         for j in range(1, len(center_init)):
#             gb_dict_key += '_' + str(center_init.tolist()[j])
#         gb_dict_value = [train, distance_init]
#         gb_dict[gb_dict_key] = gb_dict_value
#         gb_dict = splits(purity_init=purity_domain, gb_dict=gb_dict)
#         k_centers = []
#         splits_k = len(gb_dict)
#         for key in gb_dict.keys():
#             k_center = [float(k) for k in key.split('_')[1:]]  # Skip the label part
#             k_centers.append(k_center)
#         ball_list = my_kmeans.k_means(train, np.array(k_centers), iter=1)
#         num_gb += len(ball_list)
#         centerList, radiusList, label, density = [], [], [], []
#         for gb in ball_list:
#             center, radius = calculate_center_and_radius(gb)
#             centerList.append(center)
#             radiusList.append(radius)
#             l, p = get_label_and_purity(gb)
#             label.append(l)
#             den = float('inf') if radius == 0 else gb.shape[0] / radius
#             density.append(den)
#         ballInfo = []
#         for i in range(len(label)):
#             ballInfo.append(
#                 {"label": label[i], "center": centerList[i], "radius": radiusList[i], "density": density[i]})
#         pre_test = GBKNN_density(ballInfo, X_test)
#         end = time.time()
#         times += (end - start)
#         acc = accuracy_score(y_test, pre_test)
#         f1 = f1_score(y_test, pre_test, average='macro')
#         accuracies_by_purity.append((purity_domain, acc))
#         purity_domain = round(purity_domain + 0.01, 2)
#     return accuracies_by_purity