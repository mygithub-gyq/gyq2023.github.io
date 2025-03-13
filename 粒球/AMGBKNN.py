from collections import Counter
import time
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import StratifiedKFold
import numpy as np

class GranularBall:
    #Some basic attributes of GB
    def __init__(self, data) -> None:
        self.data = data
        self.center, self.radius = calCenterRadius(data[:, 1:])
        self.num = len(data)
        self.label, self.purity = calLabelPurity(data)


#Calculate the label and purity of GB
def calLabelPurity(data):
    if len(data) > 1:
        count = Counter(data[:, 0])
        label = max(count, key=count.get)
        purity = count[label] / len(data)
    else:
        label = data[0][0]
        purity = 1.0
    return label, purity


#Calculate the center and radius of GB
def calCenterRadius(data):
    center = np.mean(data, axis=0)
    dis = calculateDist(data, center)
    radius = np.mean(dis)
    return center, radius

#Calculate the Euclidean distance between objects
def calculateDist(A, B, flag=0):
    if (flag == 0):
        return np.sqrt(np.sum((A - B)**2, axis=1))
    else:
        return np.sqrt(np.sum((A - B)**2))



#Constructing clusters formed by the majority of samples in data
def generateOmegaCluster(data):
    cluster = []
    todo_data = []
    count = Counter(data[:, 0])
    label = max(count, key=count.get)
    Omega_Group = data[data[:, 0] == label]
    center = np.mean(Omega_Group[:, 1:], axis=0)
    dis = np.around(calculateDist(data[:, 1:], center), 6)
    Omega_Group_dis = dis[data[:, 0] == label]
    radius = np.around(np.mean(Omega_Group_dis), 6)
    for i in range(len(data)):
        if dis[i] <= radius:
            cluster.append(data[i])
        else:
            todo_data.append(data[i])
    cluster = np.array(cluster)
    todo_data = np.array(todo_data)
    return cluster, todo_data


# Eliminate conflicting relationships：merging heterogeneous nested GBs
def removeConflicts(ball_list):
    gb_remove_tmp = []
    for i in range(len(ball_list) - 1):
        if ball_list[i] in gb_remove_tmp:
            continue
        for j in range(i + 1, len(ball_list)):
            if (ball_list[j] in gb_remove_tmp):
                continue
            if (ball_list[i].label != ball_list[j].label) and (calculateDist(
                    ball_list[i].center, ball_list[j].center,
                    flag=1) <= abs(ball_list[i].radius - ball_list[j].radius)):
                ball_list[j].data = np.concatenate(
                    (ball_list[j].data, ball_list[i].data))
                ball_list[j].label, ball_list[j].purity = calLabelPurity(
                    ball_list[j].data)
                ball_list[j].center, ball_list[j].radius = calCenterRadius(
                    ball_list[j].data[:, 1:])
                gb_remove_tmp.append(ball_list[i])
                break
    for ball in set(gb_remove_tmp):
        ball_list.remove(ball)
    return ball_list

#For any GB, iteratively split it
# Returns the GranularBall class equipped with basic attributes
def splitGB(gb):
    todo_data = gb
    label_num = len(np.unique(gb[:, 0]))
    todo_data_num = len(todo_data)
    ball_list = []
    ball_list_new = []
    while label_num != todo_data_num:
        cluster, todo_data_tmp = generateOmegaCluster(todo_data)
        if len(cluster) > 1:  #去掉离群点构成粒球
            new_ball = GranularBall(cluster)
            ball_list.append(new_ball)
        todo_data = todo_data_tmp
        todo_data_num = len(todo_data)
        if todo_data_num > 1:
            label_num = len(np.unique(todo_data[:, 0]))
        else:
            break
    if len(ball_list) > 1:  #Eliminate conflicts
        ball_list_new = removeConflicts(ball_list)
    return ball_list_new


# Iteratively construct GBs that meet threshold conditions for the entire training dataset
def generateGBList(data, purity):
    GB_List = [GranularBall(data)]
    i = 0  #cursor
    GB_num = len(GB_List)
    while True:
        if GB_List[i].purity < purity:
            new_split_gbs = splitGB(GB_List[i].data)
            if len(new_split_gbs) > 1:
                GB_List[i] = new_split_gbs[0]
                GB_List.extend(new_split_gbs[1:])
            elif len(new_split_gbs) == 1 and (len(new_split_gbs[0].data)
                                              != len(GB_List[i].data)):
                GB_List.pop(i)
                GB_List.append(new_split_gbs[0])
            else:
                GB_List.pop(i)
            GB_num = len(GB_List)
        else:
            i += 1
        if i == GB_num:
            break
    return GB_List

# Determine the label of the test sample
def GB_KNN(X_test, Ball_list):
    predict_label = []
    ball_centers = []
    ball_num_list = []
    for ball in Ball_list:
        ball_centers.append(ball.center)
        ball_num_list.append(ball.num)
    samp_all = np.sum(ball_num_list)
    ball_density_list = ball_num_list / samp_all
    for row in X_test:
        dis = (calculateDist(row, ball_centers) - ball_density_list).tolist()
        predict_ball = Ball_list[dis.index(min(dis))]
        predict_label.append(predict_ball.label)
    return predict_label, samp_all
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

import warnings

# def main():
#     warnings.filterwarnings("ignore")  # 忽略警告
#     # data_list = ['fourclass', 'mushroom', 'breastcancer-scale', 'votes', 'splice', 'ecoli', 'sonar', 'parkinsons_scale',
#     #              'image-seg_scale', 'pen', 'Yeast', 'spect', 'svmguide1(label)', 'svmguide3(label)', 'COIL20',
#     #              'COIL100',
#     #              'diabetes', 'australian_scale', 'balance', 'skin-seg_scale', 'creditApproval(label)', 'codrna(label)',
#     #              'letter(quchong)']
#     datasets = ['austra.csv', 'Diabetes.csv', 'German.csv', 'Wave.csv', 'optdigits.csv',
#                 'texture.csv', 'wdbc.csv', 'fourclass.csv', 'pen.csv', 'splice.csv', 'svmguide1.csv', 'image-seg.csv',
#                 'Letter.csv','yeast.csv','spam.csv','mushroom.csv']
#     n_splits = 5
#     noise_rate = 0.0
#     for data_nm in datasets:
#         file_path = fr'C:\Users\20583\Desktop\data\{data_nm}'
#         data_frame = pd.read_csv(file_path, header=None)
#
#         data = data_frame.values
#         features = data[:, :-1]
#         labels = data[:, -1]
#         ### 十折交叉验证
#         skf = StratifiedKFold(n_splits, shuffle=True, random_state=42)  # 10折交叉验证划分数据
#         sum_acc, sum_f1, sum_ball, sum_time, sum_samp = 0.0, 0.0, 0, 0.0, 0.0
#         purity_domain = 0.8
#         step = 0.01
#         max_acc = 0
#         max_acc_purity = 8.0
#         while purity_domain <= 1:
#             this_purity_acc_sum, this_purity_f1_sum, this_time, this_ballNum = 0.0, 0.0, 0.0, 0.0
#             for train_index, test_index in skf.split(features, labels):
#                 train_features, X_test = features[train_index], features[test_index]
#                 train_labels, Y_test = labels[train_index], labels[test_index]
#
#                 # 给训练集的标签添加噪声
#                 train_labels_noisy = add_label_noise(train_labels, 0)
#
#                 # 构造带有噪声的训练集
#                 train = np.column_stack((train_labels_noisy, train_features))
#                 start = time.time()
#                 Ball_list = generateGBList(train, purity_domain)
#                 pre_test, samp_num = GB_KNN(X_test, Ball_list)
#                 end = time.time()
#                 sum_samp += samp_num
#                 times = end - start
#                 acc = accuracy_score(Y_test, pre_test)
#                 f1 = f1_score(Y_test, pre_test, average='macro')
#                 ball_num = len(Ball_list)
#                 this_purity_acc_sum += acc
#                 this_purity_f1_sum += f1
#                 this_time += times
#                 this_ballNum += ball_num
#             this_purity_acc_avg = this_purity_acc_sum / n_splits
#             if this_purity_acc_avg > max_acc:
#                 max_acc = this_purity_acc_avg
#                 max_acc_purity = purity_domain
#             # max_acc = max_acc if max_acc>this_purity_acc_avg else this_purity_acc_avg
#             sum_acc += this_purity_acc_sum
#             sum_f1 += this_purity_f1_sum
#             sum_ball += this_ballNum
#             sum_time += this_time
#             # print(purity_domain, '###', this_purity_acc_avg)
#             # with open('amknn5折纯度0.8-1.txt', 'a') as file:
#             #     file.write('purity: ' + str(purity_domain) + ' ### ' + 'acc: ' + str(this_purity_acc_avg) + '\n')
#             purity_domain = round(purity_domain + step, 2)
#         print('Max accuracy of', data_nm, ':', round(max_acc, 3))
#         print('Max acc_purity of ', data_nm, ':', max_acc_purity)
#         print('Average accuracy of', data_nm, ':', round(sum_acc / (n_splits * 21), 3))
#         print('Total time of', data_nm, ':', sum_time * 1000 / n_splits)
#         print('Average ballNum of', data_nm, ':', sum_ball / (n_splits * 21))
#         print('noise_rate of ', data_nm, ':', noise_rate)
#         print('########################################')
# if __name__ == '__main__':
#     main()

def main():
    datasets = [ 'mushroom.csv']
    n_splits = 5  # Cross-validation splits
    noise_levels = [0, 0.1, 0.2, 0.3, 0.4, 0.5]  # Different noise levels to evaluate
    for noise_rate in noise_levels:
        print(f"Noise rate: {noise_rate}")
        for data_nm in datasets:
            file_path = fr'C:\Users\20583\Desktop\data\{data_nm}'
            data_frame = pd.read_csv(file_path, header=None)
            data = data_frame.values
            features = data[:, :-1]
            labels = data[:, -1]

            skf = StratifiedKFold(n_splits, shuffle=True, random_state=42)  # 5-fold cross-validation
            total_ball_count = 0
            total_time = 0.0
            purity_domain = 0.8
            step = 0.01
            while purity_domain <= 1:
                this_ball_num_sum = 0.0
                for train_index, test_index in skf.split(features, labels):
                    train_features, X_test = features[train_index], features[test_index]
                    train_labels, Y_test = labels[train_index], labels[test_index]

                    # Adding noise to the labels based on current noise_rate
                    train_labels_noisy = add_label_noise(train_labels, noise_rate)

                    # Construct the noisy training set
                    train = np.column_stack((train_labels_noisy, train_features))
                    start = time.time()
                    Ball_list = generateGBList(train, purity_domain)
                    pre_test, samp_num = GB_KNN(X_test, Ball_list)
                    end = time.time()

                    # Update total ball count and time
                    total_ball_count += len(Ball_list)
                    total_time += (end - start)
                    this_ball_num_sum += len(Ball_list)

                avg_ball_num = this_ball_num_sum / n_splits
                purity_domain = round(purity_domain + step, 2)

            # Output results
            print(f"Dataset: {data_nm}, Avg Ball Count: {total_ball_count / (n_splits * 21):.2f}, Avg Time: {total_time / n_splits:.4f} sec")
        print('########################################')

if __name__ == '__main__':
    main()

# def AMGBKNN(X_train, X_test, y_train,y_test):
#     accuracies_by_purity = []
#     purity_domain = 0.8
#     while purity_domain <= 1.0:
#         start = time.time()
#         train = np.column_stack((y_train, X_train))
#         Ball_list = generateGBList(train, purity_domain)
#         pre_test, samp_num = GB_KNN(X_test, Ball_list)
#         end = time.time()
#         times = end - start
#         acc = accuracy_score(y_test, pre_test)
#         f1 = f1_score(y_test, pre_test, average='macro')
#         accuracies_by_purity.append((purity_domain, acc))
#         purity_domain = round(purity_domain + 0.01, 2)
#     return accuracies_by_purity