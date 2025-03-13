import pandas as pd
from scipy.stats import friedmanchisquare

# 1. 读取 Excel 数据
# 假设 Excel 文件名为 "data.xlsx"，数据在第一张表中
df = pd.read_excel(r'C:\Users\20583\Desktop\论文初稿\样例选取结果.xlsx', header=None,sheet_name="RAT")

# 2. 转换数据格式
# 按行表示实验条件，按列表示不同算法
data_values = df.values  # 转换为 NumPy 数组
data_transposed = data_values.T  # 转置为列优先格式

# 3. 执行 Friedman 检验
stat, p = friedmanchisquare(*data_transposed)

# 4. 输出结果
print(f"Friedman 检验统计量: {stat:.4f}")
print(f"p 值: {p:.4e}")

# 判断显著性
if p < 0.05:
    print("存在显著性差异 (拒绝原假设)")
else:
    print("不存在显著性差异 (无法拒绝原假设)")

