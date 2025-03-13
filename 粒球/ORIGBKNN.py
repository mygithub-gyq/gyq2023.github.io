from collections import Counter
import random
import time
import warnings
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score

from sklearn.model_selection import StratifiedKFold
#from generate_noise import generate_noise
from CLAS import my_kmeans
import numpy as np


class GranularBall:
    #定义粒球的基本属性
    def __init__(self,data) -> None:
        self.data = data
        self.num = len(data)     #data样本数
        self.label, self.purity = self.calLabelPurity()
        self.center = []
        self.radius = 0.0

    #计算粒球的标签及纯度
    def calLabelPurity(self):
        if self.num == 1:
            label = self.data[0][0]
            purity = 1.0
        else:
            count = Counter(self.data[:, 0])
            label = max(count, key=count.get)  #拥有最多同类的对象对应的标签，作为粒球标签
            purity = count[label] / self.num
        return label, purity


    #生成随机异类中心点
    #随机的中心点数，根据数据的标签数来定
    # def randomCenter(self):
    #     center_array = []
    #     for i in set(self.data[:, 0]):
    #         data_set = self.data[self.data[:, 0] == i, :][:,1:]
    #         random.seed(42)
    #         random_data = data_set[random.randrange(len(data_set)), :]
    #         center_array.append(random_data)
    #     center_array = np.array(center_array)
    #     return center_array

        # 生成2个异类随机中心点
    def randomCenter(self):
        center_array = []
        labels = list(set(self.data[:, 0]))  # 转换为列表
        random_label = random.sample(labels, 2)
        for i in random_label:
            data_set = self.data[self.data[:, 0] == i, :][:, 1:]
            random.seed(42)
            random_data = data_set[random.randrange(len(data_set)), :]
            center_array.append(random_data)
        center_array = np.array(center_array)
        return center_array

    #针对单一粒球，调用k-means做类簇切分
    #调用的自己编写的k-means，而不是python第三方包
    def splitGB(self):
        Clusterings = []
        random_centers = self.randomCenter()
        ClusterLists = my_kmeans.k_means(self.data, random_centers)
        for Cluster_data in ClusterLists:
            single_cluster = np.array(Cluster_data)
            if single_cluster.size != 0:
                Cluster = GranularBall(single_cluster)
                Clusterings.append(Cluster)
        return Clusterings


#计算粒球的中心及半径
def calCenterRadius(data):
    center = np.mean(data, axis=0)
    dis = calculateDist(data, center)
    radius = np.mean(dis)
    # radius = np.max(dis)
    return center, radius, dis

#计算对象间的欧式距离
#默认计算多个对象与单个对象之间的欧式距离
def calculateDist(A, B, flag = 0):
    if (flag == 0):
        return np.sqrt(np.sum((A - B)**2, axis=1))
    else:
        return np.sqrt(np.sum((A - B)**2))


# 划分粒球，根据纯度阈值设置停止划分的条件
def generateGBList(data, purity):
    GB_List = [GranularBall(data)]  #将初始粒球放入粒球列表
    i = 0  #游标位置
    GB_num = len(GB_List)
    while True:
        if GB_List[i].purity < purity:
            new_split_gbs = GB_List[i].splitGB()  #归来还是装备过基本粒球属性的粒球类
            if len(new_split_gbs) > 1:
                GB_List[i] = new_split_gbs[0]
                GB_List.extend(new_split_gbs[1:])
                GB_num += len(new_split_gbs) - 1  #更新GB_List长度
            else:
                GB_List[i] = new_split_gbs[0]
        else:
            GB_List[i].center, GB_List[i].radius = calCenterRadius(GB_List[i].data[:, 1:])[:-1]
            i += 1
        if i == GB_num:
            break
    return GB_List


# 论文"Granular ball computing classifiers for efficient, scalable and robust learning"
# GBKNN算法
def GB_KNN(X_test, Ball_list):
    dict_dis = {}
    pre_label_list = []
    for row in X_test:
        for ball in Ball_list:
            dis = calculateDist(row,ball.center,flag=1) - ball.radius
            dict_dis[ball] = dis
        predict_ball = min(dict_dis, key = dict_dis.get)
        pre_label_list.append(predict_ball.label)
    return pre_label_list

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

def main():
    warnings.filterwarnings("ignore")  # 忽略警告
    datasets = [
                'spam.csv']

    # purity = 1
    n_splits = 5
    noise_rate = 0
    for data_nm in datasets:
        print(f"当前数据集是{data_nm}")
        filepath = fr'C:\Users\20583\Desktop\data\{data_nm}'
        data_frame = pd.read_csv(filepath, header=None)

        # 确保数据最后一列是标签，前面是特征
        data = data_frame.values
        features = data[:, :-1]
        labels = data[:, -1]

        # 十折交叉验证
        skf = StratifiedKFold(n_splits, shuffle=True, random_state=42)  # 10折交叉验证划分数据
        sum_acc, sum_f1, sum_ball, sum_time = 0.0, 0.0, 0, 0.0
        purity_domain = 0.8
        step = 0.1
        max_acc = 0
        max_acc_purity = 6.0

        while purity_domain <= 1.0:
            this_purity_acc_sum, this_purity_f1_sum, this_time, this_ballNum = 0.0, 0.0, 0.0, 0.0
            for train_index, test_index in skf.split(features, labels):
                train_features, test_features = features[train_index], features[test_index]
                train_labels, test_labels = labels[train_index], labels[test_index]

                # 给训练集的标签添加噪声
                train_labels_noisy = add_label_noise(train_labels, noise_rate)

                # 构造带有噪声的训练集
                train_data_noisy = np.column_stack((train_labels_noisy, train_features))

                start = time.time()
                Ball_list = generateGBList(train_data_noisy, purity_domain)
                pre_test = GB_KNN(test_features, Ball_list)
                end = time.time()
                times = end - start

                acc = accuracy_score(test_labels, pre_test)
                f1 = f1_score(test_labels, pre_test, average='macro')
                ball_num = len(Ball_list)

                this_purity_acc_sum += acc
                this_purity_f1_sum += f1
                this_time += times
                this_ballNum += ball_num

            this_purity_acc_avg = this_purity_acc_sum / n_splits
            if this_purity_acc_avg > max_acc:
                max_acc = this_purity_acc_avg
                max_acc_purity = purity_domain
            sum_acc += this_purity_acc_sum
            sum_f1 += this_purity_f1_sum
            sum_ball += this_ballNum
            sum_time += this_time
            print(purity_domain, '###', this_purity_acc_avg)
            purity_domain = round(purity_domain + step, 2)

        print('Max accuracy of', data_nm, ':', round(max_acc, 3))
        print('Max acc_purity of ', data_nm, ':', max_acc_purity)
        print('Average accuracy of', data_nm, ':', round(sum_acc / (n_splits * 21), 3))
        print('Total time of', data_nm, ':', sum_time * 1000 / n_splits)
        print('Average ballNum of', data_nm, ':', sum_ball / (n_splits * 21))
        print('noise_rate of ', data_nm, ':', noise_rate)


if __name__ == '__main__':
    main()


# import warnings
# import pandas as pd
# import time
# import numpy as np
# from sklearn.metrics import accuracy_score, f1_score
# from sklearn.model_selection import StratifiedKFold
#
#
# def add_label_noise(y, noise_level):
#     """
#     Add noise to the labels of the dataset.
#     """
#     y = np.asarray(y, dtype=int)
#     unique_classes = np.unique(y)
#     noisy_indices = np.random.choice(len(y), int(noise_level * len(y)), replace=False)
#     y_noisy = y.copy()
#     for idx in noisy_indices:
#         current_label = y[idx]
#         possible_labels = unique_classes[unique_classes != current_label]
#         new_label = np.random.choice(possible_labels)
#         y_noisy[idx] = new_label
#     return y_noisy
#
#
# def ORIGBKNN(X_train,  X_test, y_train, y_test):
#     accuracies_by_purity = []  # List to store accuracies at different purity levels
#     purity_domain = 0.8
#     train_data_noisy = np.column_stack((y_train, X_train))
#     while purity_domain <= 1:
#         start = time.time()
#         Ball_list = generateGBList(train_data_noisy, purity_domain)
#         pre_test = GB_KNN(X_test, Ball_list)
#         end = time.time()
#         acc = accuracy_score(y_test, pre_test)
#         f1 = f1_score(y_test, pre_test, average='macro')
#         times = end - start
#         accuracies_by_purity.append((purity_domain, acc))
#         purity_domain = round(purity_domain + 0.01, 2)
#     return accuracies_by_purity
#
