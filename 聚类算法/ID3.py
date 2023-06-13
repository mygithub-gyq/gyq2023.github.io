import pandas as pd
import numpy as np
import math

class Node:
    def __init__(self, fkey=None, fval=None, output=None, children=None):
        self.fkey = fkey # 特征名
        self.fval = fval # 特征值
        self.output = output # 当前节点的输出值
        self.children = {} if children is None else children # 子节点

class ID3:
    def __init__(self, eps=0.01):
        self.eps = eps # 最小信息熵增益阈值
        self.tree = None # 决策树

# 计算数据集的信息熵
    def entropy(self, y):
        n = len(y)
        unique, counts = np.unique(y, return_counts=True)
        entropy = 0
        for i in range(len(unique)):
            pi = counts[i] / n
            entropy += -pi * math.log2(pi)
        return entropy

# 计算数据集按某个特征划分后的信息熵
    def conditional_entropy(self, X, y, fkey, fval):
        instances = X[fkey]
        indices = np.where(instances == fval)
        y_subset = y[indices]
        entropy_subset = self.entropy(y_subset)
        return entropy_subset

# 计算信息熵增益
    def information_gain(self, X, y, fkey):
        n = len(y)
        entropy_before = self.entropy(y)
        entropy_after = 0
        unique, counts = np.unique(X[fkey], return_counts=True)
        for i in range(len(unique)):
            pi = counts[i] / n
            entropy_after += pi * self.conditional_entropy(X, y, fkey, unique[i])
        gain = entropy_before - entropy_after
        return gain

# 生成决策树
    def fit(self, X, y, feature_names):
        self.tree = self._build_tree(X, y, feature_names)

# 递归生成决策树
    def _build_tree(self, X, y, feature_names):
        # 生成当前节点
        node = Node()
        # 当前数据集中所有输出值相同
        if len(np.unique(y)) == 1:
            node.output = y[0]
            return node
        # 当前数据集中没有特征可划分
        if len(feature_names) == 0:
            node.output = np.bincount(y).argmax()
            return node
        # 选择信息熵增益最大的特征
        gain_max = -1
        for fkey in feature_names:
            gain = self.information_gain(X, y, fkey)
            if gain > gain_max:
                gain_max = gain
                best_fkey = fkey
        # 当信息熵增益小于阈值时，停止划分
        if gain_max < self.eps:
            node.output = np.bincount(y).argmax()
            return node
        # 根据最佳特征划分数据集
        unique, counts = np.unique(X[best_fkey], return_counts=True)
        for i in range(len(unique)):
            fval = unique[i]
            indices = np.where(X[best_fkey] == fval)
            X_subset = X.iloc[indices].drop(columns=[best_fkey])
            y_subset = y[indices]
            if len(y_subset) == 0:
                child_node = Node()
                child_node.output = np.bincount(y).argmax()
            else:
                feature_names_subset = feature_names.copy()
                feature_names_subset.remove(best_fkey)
                child_node = self._build_tree(X_subset, y_subset, feature_names_subset)
            child_node.fkey = best_fkey
            child_node.fval = fval
            node.children[fval] = child_node
        return node

    # 预测输出值
    def predict(self, X_test):
        y_pred = []
        for i in range(len(X_test)):
            node = self.tree
            while node.children:
                fval = X_test[node.fkey][i]
                if fval not in node.children:
                    break
                node = node.children[fval]
            y_pred.append(node.output)
        return np.array(y_pred)

df = pd.read_csv('data.csv')
X = df.drop(columns=['PlayTennis'])
y = df['PlayTennis']
feature_names = X.columns.tolist()

# 训练模型
model = ID3()
model.fit(X, y, feature_names)

# 预测输出值
X_test = pd.DataFrame({'Outlook': ['Sunny', 'Rainy', 'Overcast'],
                       'Temperature': ['Cool', 'Mild', 'Hot'],
                       'Humidity': ['Normal', 'High', 'High'],
                       'Wind': ['Weak', 'Strong', 'Weak']})
y_pred = model.predict(X_test)
print(y_pred)


