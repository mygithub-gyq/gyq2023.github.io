#!/usr/bin/env python
# coding: utf-8

# In[3]:


import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from scipy.interpolate import make_interp_spline
from matplotlib.lines import Line2D

# 数据
datasets = [
    "Appe", "Iris", "Wine", "Sonar", "Segm", "Heart", "Breast", "Haber", "Iono", "Vote",
    "Wdbc", "Wbc", "Austra", "Blood", "Diabetes", "Vehicle", "Vowel", "German", "Cloud",
    "CMC", "Copy", "Spam", "Wilt", "Wave", "EEG", "Gamma", "Letter"
]

NNDHIS = [0.9131, 0.9733, 0.9400, 0.8518, 0.9210, 0.9293, 0.8751, 0.8539, 0.8814, 0.9637, 
          0.9854, 0.9864, 0.9239, 0.8736, 0.9018, 0.8056, 0.9142, 0.9108, 0.9889, 0.7779, 
          0.9462, 0.9422, 0.9701, 0.8920, 0.9374, 0.9249, 0.9779]

ENN = [0.9003, 0.9580, 0.9734, 0.8507, 0.8748, 0.8170, 0.7866, 0.7634, 0.8715, 0.9366, 
       0.9684, 0.9758, 0.8672, 0.7999, 0.7708, 0.6982, 0.8788, 0.7389, 0.9754, 0.5044, 
       0.8886, 0.9109, 0.9512, 0.7834, 0.8280, 0.8359, 0.9420]

CNN = [0.7590, 0.8287, 0.8598, 0.6223, 0.7276, 0.6926, 0.6351, 0.3720, 0.7105, 0.8638, 
       0.5900, 0.8771, 0.7249, 0.7115, 0.6457, 0.4869, 0.6951, 0.6251, 0.9474, 0.3435, 
       0.8721, 0.6460, 0.7493, 0.6772, 0.6969, 0.3915, 0.9160]

CDIS = [0.9075, 0.9773, 0.9710, 0.8590, 0.8967, 0.8515, 0.7274, 0.7623, 0.9151, 0.9287, 
        0.9680, 0.9804, 0.8761, 0.7797, 0.7643, 0.7017, 0.8768, 0.7175, 0.9684, 0.4928, 
        0.8777, 0.8920, 0.9541, 0.7658, 0.7986, 0.8061, 0.9324]

LDIS = [0.9065, 0.9760, 0.9702, 0.8545, 0.8876, 0.8593, 0.7448, 0.7594, 0.8929, 0.9246, 
        0.9719, 0.9804, 0.8804, 0.7746, 0.7635, 0.7062, 0.8727, 0.7129, 0.9679, 0.4949, 
        0.8737, 0.8918, 0.9558, 0.7834, 0.8055, 0.8080, 0.9408]

CIS = [0.9097, 0.9927, 0.9792, 0.8995, 0.9162, 0.8607, 0.7952, 0.7640, 0.9239, 0.9605, 
       0.9850, 0.9813, 0.8554, 0.7742, 0.7749, 0.7273, 0.8821, 0.7267, 0.9815, 0.4847, 
       0.8713, 0.9109, 0.9545, 0.7568, 0.8296, 0.8152, 0.9604]

RIS3 = [0.9150, 0.9667, 0.9792, 0.8837, 0.8948, 0.8544, 0.7816, 0.7685, 0.9564, 0.9400, 
        0.9705, 0.9775, 0.8771, 0.7762, 0.7685, 0.6955, 0.8723, 0.7343, 0.9677, 0.4847, 
        0.8652, 0.9168, 0.9467, 0.7915, 0.8146, 0.8329, 0.9378]

LSNaNIS = [0.8172, 0.9401, 0.9016, 0.7634, 0.8120, 0.7837, 0.7048, 0.6821, 0.8157, 0.9033, 
           0.9487, 0.9620, 0.8360, 0.7671, 0.7122, 0.6735, 0.8489, 0.6959, 0.9602, 0.4630, 
           0.8693, 0.8560, 0.9442, 0.8124, 0.8184, 0.8227, 0.9245]

# 设置图形样式
sns.set(font="Times New Roman", font_scale=1.5)
plt.figure(figsize=(12, 8), dpi=500)

# 为每个算法生成平滑曲线
x = np.arange(len(datasets))

def smooth_curve(y, x):
    x_new = np.linspace(x.min(), x.max(), 300)
    spline = make_interp_spline(x, y, k=3)
    y_smooth = spline(x_new)
    return x_new, y_smooth

x_new, NNDHIS_smooth = smooth_curve(NNDHIS, x)
_, ENN_smooth = smooth_curve(ENN, x)
_, CNN_smooth = smooth_curve(CNN, x)
_, CDIS_smooth = smooth_curve(CDIS, x)
_, LDIS_smooth = smooth_curve(LDIS, x)
_, CIS_smooth = smooth_curve(CIS, x)
_, RIS3_smooth = smooth_curve(RIS3, x)
_, LSNaNIS_smooth = smooth_curve(LSNaNIS, x)

# 颜色和标记风格
colors = ['blue', 'green', 'red', 'cyan', 'magenta', 'purple', 'lime', 'orange']
markers = ['o', 's', 'x', '+', '*', 'D', 'P', 'v']

# 绘制曲线和散点
for i, (y_smooth, color, marker, label) in enumerate(zip(
        [NNDHIS_smooth, ENN_smooth, CNN_smooth, CDIS_smooth, LDIS_smooth, CIS_smooth, RIS3_smooth, LSNaNIS_smooth],
        colors, markers, ['NNDHIS', 'ENN', 'CNN', 'CDIS', 'LDIS', 'CIS', 'RIS3', 'LSNaNIS'])):
    plt.plot(x_new + 1, y_smooth, color=color, linewidth=1, label=label)  # Offset x-values by 1
    plt.scatter(x + 1, [NNDHIS, ENN, CNN, CDIS, LDIS, CIS, RIS3, LSNaNIS][i], color=color, marker=marker, edgecolor='none')  # Remove edge color

# 设置自定义图例，标记和线条
legend_labels = [Line2D([0], [0], color=c, marker=m, markersize=8, linestyle='-', label=l) 
                 for c, m, l in zip(colors, markers, ['NNDHIS', 'ENN', 'CNN', 'CDIS', 'LDIS', 'CIS', 'RIS3', 'LSNaNIS'])]
plt.legend(handles=legend_labels, loc='lower left', bbox_to_anchor=(0, 0), prop={'size': 14})

# 设置标题和标签
plt.ylabel("Accuracy (%)")
plt.xticks(ticks=np.arange(0, 31, 5), labels=[f'{i}' for i in range(0, 31, 5)])
plt.xlim(0, 30)  # 设置x轴范围
plt.grid(True)

# 展示图形
plt.tight_layout()
plt.show()


# In[6]:


import matplotlib.pyplot as plt
import seaborn as sns
colors = ['blue', 'green', 'red', 'cyan', 'magenta', 'purple', 'lime', 'orange']
markers = ['o', 's', 'x', '+', '*', 'D', 'P', 'v']
# Data and corresponding markers/colors for each algorithm
methods = {
    "NNDHIS": {"accuracy": 91.71, "reduction": 95.94, "marker": markers[0], "color": colors[0]},
    "ENN": {"accuracy": 85.37, "reduction": 24.73, "marker": markers[1], "color": colors[1]},
    "CNN": {"accuracy": 69.14, "reduction": 86.11, "marker": markers[2], "color": colors[2]},
    "CDIS": {"accuracy": 85.00, "reduction": 61.93, "marker": markers[3], "color": colors[3]},
    "LDIS": {"accuracy": 85.04, "reduction": 56.76, "marker": markers[4], "color": colors[4]},
    "CIS": {"accuracy": 86.20, "reduction": 39.13, "marker": markers[5], "color": colors[5]},
    "RIS3": {"accuracy": 85.82, "reduction": 80.48, "marker": markers[6], "color": colors[6]},
    "LSNaNIS": {"accuracy": 81.63, "reduction": 79.50, "marker": markers[7], "color": colors[7], "markersize": 200}
}

# Set up the figure and style
sns.set(style="whitegrid", font="Arial", font_scale=1.5)
plt.rcParams['font.family'] = 'Times New Roman'
plt.figure(figsize=(8, 6), dpi=300)

# Plot each algorithm
for method, props in methods.items():
    plt.scatter(
        props["accuracy"], props["reduction"], 
        marker=props["marker"], color=props["color"], 
        s=props.get("markersize", 150), label=method, edgecolor='black'
    )

# Customize the plot to resemble Nature style
plt.xlabel('Accuracy (%)')
plt.ylabel('Reduction (%)')
plt.xlim(65, 100)
plt.ylim(20, 100)
plt.legend(frameon=False)
plt.grid(True, linestyle='--', linewidth=0.7, color='gray')

# Adjusting the figure layout and aesthetics
plt.tight_layout()

# Make the border (spines) black
ax = plt.gca()
ax.spines['top'].set_color('black')
ax.spines['right'].set_color('black')
ax.spines['bottom'].set_color('black')
ax.spines['left'].set_color('black')

# Show the plot
plt.show()


# In[7]:


import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Sample data
datasets = [f"Dataset {i+1}" for i in range(27)]
data = {
    "NNDHIS": [0.9535,0.9601,0.9620,0.9445,0.9379,0.9620,0.9509,0.9541,0.9741,0.9734,0.9659,0.9749,0.9705,0.9553,0.9497,0.9454,0.9541,0.9504,0.9804,0.9432,0.9596,0.9817,0.9729,0.9519,0.9589,0.9585,0.9581],
    "ENN": [0.2009, 0.0597, 0.0411, 0.1677, 0.1471, 0.4076, 0.4058, 0.3695, 0.1115, 0.2639, 0.0500, 0.0357, 0.3707, 0.3136, 0.3154, 0.3348, 0.1551, 0.3860, 0.1147, 0.6899, 0.1513, 0.0902, 0.0584, 0.5587, 0.1734, 0.2020, 0.5018],
    "CNN": [0.7937, 0.9386, 0.9247, 0.9212, 0.8206, 0.6779, 0.6344, 0.8678, 0.9262, 0.8662, 0.9811, 0.9638, 0.7463, 0.9834, 0.8775, 0.8636, 0.8487, 0.6122, 0.9340, 0.8202, 0.9616, 0.9836, 0.9586, 0.6685, 0.8308, 0.9891, 0.8544],
    "CDIS": [0.6342, 0.6550, 0.6477, 0.6467, 0.6383, 0.6270, 0.5994, 0.5782, 0.6467, 0.6450, 0.6817, 0.5495, 0.6162, 0.4758, 0.6471, 0.5855, 0.4729, 0.6706, 0.6048, 0.5999, 0.5590, 0.6627, 0.5365, 0.7676, 0.6510, 0.6792, 0.6425],
    "LDIS": [0.6233, 0.5964, 0.5813, 0.6011, 0.5857, 0.6154, 0.5642, 0.5373, 0.5991, 0.6057, 0.6386, 0.5151, 0.5879, 0.4548, 0.6066, 0.5199, 0.3868, 0.6167, 0.5382, 0.5548, 0.5266, 0.6167, 0.5119, 0.7133, 0.5550, 0.5613, 0.5127],
    "CIS": [0.4233, 0.3490, 0.1847, 0.2067, 0.3481, 0.6455, 0.5322, 0.5936, 0.5654, 0.4996, 0.4457, 0.5926, 0.5620, 0.5044, 0.5542, 0.3324, 0.0641, 0.5158, 0.3835, 0.4039, 0.5779, 0.0403, 0.2210, 0.4805, 0.0200, 0.2403, 0.2778],
    "RIS3": [0.7727, 0.9027, 0.8914, 0.7323, 0.7330, 0.8429, 0.8460, 0.8485, 0.7809, 0.8327, 0.9275, 0.9472, 0.9118, 0.8789, 0.7781, 0.5465, 0.7415, 0.7639, 0.9439, 0.7104, 0.7684, 0.7800, 0.8710, 0.8010, 0.6313, 0.7206, 0.8238],
    "LSNaNIS": [0.8504, 0.8762, 0.8775, 0.6834, 0.7899, 0.7915, 0.7268, 0.7722, 0.9348, 0.8680, 0.9151, 0.9655, 0.8518, 0.8306, 0.6747, 0.6078, 0.7870, 0.6378, 0.8811, 0.6681, 0.8641, 0.8247, 0.9345, 0.9431, 0.5188, 0.7687, 0.6208]
}

# Set up the seaborn style and font
sns.set(font="Times New Roman", font_scale=1.5)
fig, axes = plt.subplots(nrows=4, ncols=2, figsize=(14, 18), sharey=True, dpi=300)
fig.subplots_adjust(hspace=0.3, wspace=0.2)

# More distinct and professional color palette
colors = ['blue', 'green', 'red', 'cyan', 'magenta', 'purple', 'lime', 'orange']

# Plot each algorithm
for idx, (algo, scores) in enumerate(data.items()):
    row, col = divmod(idx, 2)
    ax = axes[row, col]
    ax.plot(range(1, 28), scores, marker='o', color=colors[idx], label=algo, linestyle='-', linewidth=2)
    ax.set_xticks(np.arange(0, 31, 5))
    ax.set_xticklabels(np.arange(0, 31, 5))
    ax.set_ylabel('Reduction(%)', fontsize=18)
    ax.legend(loc='best')
    ax.grid(True)  # Remove grid lines
    ax.set_ylim(0, 1)  # Set consistent y-axis range

# Remove empty subplots
for i in range(len(data), 8):
    fig.delaxes(axes[i // 2, i % 2])

plt.show()


# In[1]:


import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Sample data
datasets = [f"Dataset {i+1}" for i in range(27)]
data = {
    "NNDHIS": [0.9835, 0.9886, 0.9895, 0.9775, 0.9776, 0.9794, 0.9758, 0.9757, 0.9882, 0.9843, 0.9846, 0.9849, 0.9756, 0.9670, 0.9703, 0.9684, 0.9753, 0.9683, 0.9840, 0.9579, 0.9641, 0.9699, 0.9609, 0.9593, 0.8994, 0.8946, 0.9484],
    "ENN": [0.9835, 0.9861, 0.9852, 0.9808, 0.9821, 0.9842, 0.9844, 0.9851, 0.9811, 0.9818, 0.9791, 0.9816, 0.9799, 0.9817, 0.9800, 0.9782, 0.9809, 0.9761, 0.9780, 0.9732, 0.9669, 0.8964, 0.9551, 0.9095, 0.8918, 0.8863, 0.8755],
    "CNN": [0.9904, 0.9919, 0.9926, 0.9931, 0.9931, 0.9940, 0.9940, 0.9943, 0.9947, 0.9952, 0.9958, 0.9962, 0.9946, 0.9964, 0.9964, 0.9952, 0.9966, 0.9937, 0.9956, 0.9955, 0.9960, 0.9958, 0.9962, 0.9884, 0.9878, 0.9959, 0.9845],
    "CDIS": [0.9835, 0.9839, 0.9820, 0.9808, 0.9821, 0.9842, 0.9833, 0.9831, 0.9811, 0.9818, 0.9803, 0.9824, 0.9817, 0.9820, 0.9813, 0.9828, 0.9847, 0.9788, 0.9801, 0.9797, 0.9695, 0.9402, 0.9558, 0.9683, 0.9335, 0.9337, 0.9780],
    "LDIS": [0.9865, 0.9861, 0.9872, 0.9833, 0.9848, 0.9866, 0.9867, 0.9862, 0.9834, 0.9843, 0.9830, 0.9854, 0.9845, 0.9847, 0.9841, 0.9856, 0.9879, 0.9809, 0.9829, 0.9823, 0.9713, 0.9396, 0.9580, 0.9700, 0.9361, 0.9352, 0.9803],
    "CIS": [0.8591, 0.8819, 0.8879, 0.8946, 0.8906, 0.9091, 0.9108, 0.9094, 0.9115, 0.9194, 0.9224, 0.9344, 0.9366, 0.9378, 0.9299, 0.9346, 0.9396, 0.9387, 0.9368, 0.9417, 0.9471, 0.9572, 0.9576, 0.9539, 0.9624, 0.9605, 0.9625],
    "RIS3": [0.9537, 0.9497, 0.9259, 0.8644, 0.9043, 0.9137, 0.9256, 0.9413, 0.8622, 0.8847, 0.8391, 0.8834, 0.8622, 0.9066, 0.8830, 0.8374, 0.8887, 0.8162, 0.8570, 0.8334, 0.8071, 0.5825, 0.8026, 0.7746, 0.5856, 0.5893, 0.5131],
    "LSNaNIS": [0.9904, 0.9919, 0.9895, 0.9881, 0.9882, 0.9896, 0.9897, 0.9887, 0.9908, 0.9866, 0.9863, 0.9869, 0.9865, 0.9870, 0.9830, 0.9821, 0.9837, 0.9811, 0.9826, 0.9814, 0.9747, 0.9652, 0.9678, 0.9707, 0.9234, 0.9332, 0.9253]
}
# Set up the seaborn style and font
sns.set(font="Times New Roman", font_scale=1.5)
fig, axes = plt.subplots(nrows=4, ncols=2, figsize=(14, 18), sharey=True, dpi=300)
fig.subplots_adjust(hspace=0.3, wspace=0.2)

# More distinct and professional color palette
colors = ['blue', 'green', 'red', 'cyan', 'magenta', 'purple', 'lime', 'orange']


# Plot each algorithm
for idx, (algo, scores) in enumerate(data.items()):
    row, col = divmod(idx, 2)
    ax = axes[row, col]
    ax.plot(range(1, 28), scores, marker='o', color=colors[idx], label=algo, linestyle='-', linewidth=2)
    ax.set_xticks(np.arange(0, 31, 5))
    ax.set_xticklabels(np.arange(0, 31, 5))
    ax.set_ylabel('EE(%)', fontsize=18)
    ax.legend(loc='best')
    ax.grid(True)  # Remove grid lines
    ax.set_ylim(-0.05, 1.05)  # Set consistent y-axis range

# Remove empty subplots
for i in range(len(data), 8):
    fig.delaxes(axes[i // 2, i % 2])

plt.show()


# In[2]:


import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
from scipy.interpolate import griddata

# 数据
accuracy = np.array([0.9171, 0.8537, 0.6914, 0.8500, 0.8504, 0.8620, 0.8582, 0.8163])
reduction_rate = np.array([0.9594, 0.247284327, 0.861068609, 0.619288165, 0.567636911, 0.391283901, 0.804778934, 0.794997403])
time = np.array([0.9686, 0.9631, 0.9938, 0.9748, 0.9773, 0.9270, 0.8292, 0.9776])
algorithms = ['NNDHIS', 'ENN', 'CNN', 'CDIS', 'LDIS', 'CIS', 'RIS3', 'LSNaNIS']

# 创建网格
accuracy_grid, reduction_rate_grid = np.meshgrid(np.linspace(accuracy.min(), accuracy.max(), 50),
                                                 np.linspace(reduction_rate.min(), reduction_rate.max(), 50))

# 使用 griddata 进行插值
time_grid = griddata((accuracy, reduction_rate), time, (accuracy_grid, reduction_rate_grid), method='linear')
plt.rcParams['font.family'] = 'Times New Roman'
# 创建图形
fig = plt.figure(figsize=(20, 18),dpi=500)
ax = fig.add_subplot(111, projection='3d')

# 绘制曲面图
surf = ax.plot_surface(accuracy_grid, reduction_rate_grid, time_grid, cmap='viridis', edgecolor='none', alpha=0.8)

# 添加标签
ax.set_xlabel('Accuracy(%)', fontsize=16)
ax.set_ylabel('Reduction(%)', fontsize=16)
ax.set_zlabel('EE(%)', fontsize=16, rotation=90)

# 标记算法位置，调整 `ENN` 和 `NNDHIS` 的位置
offset = 0.0001
for i, txt in enumerate(algorithms):
    # 为 `ENN` 和 `NNDHIS` 设定不同的偏移量
    if txt in ['ENN','CNN', 'NDHIS']:
        ax.text(accuracy[i], reduction_rate[i], time[i] + offset * 0.5, txt, fontsize=12, ha='center', color='black')
    else:
        ax.text(accuracy[i], reduction_rate[i], time[i] + offset, txt, fontsize=12, ha='center', color='black')

# 设置 y 轴范围
ax.set_ylim(0.4, reduction_rate.max())

# 设置 z 轴范围和刻度间隔
ax.set_zlim(0.8, 1)
ax.set_zticks(np.arange(0.8, 1.05, 0.05))

# 调整坐标轴刻度
ax.tick_params(axis='both', which='major', labelsize=14)

# 调整视角
ax.view_init(elev=30, azim=-35)

# 移动 z 轴到左边
ax.zaxis.set_label_position('left')
ax.zaxis.set_ticks_position('none')

# 保存图形为高分辨率图片
fig.savefig('3d_surface_plot.png', dpi=300)

# 显示图形
plt.show()


# In[ ]:




