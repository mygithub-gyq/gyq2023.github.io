import pandas as pd
import numpy as np
import statsmodels.api as sm
from sklearn.preprocessing import StandardScaler
from statsmodels.stats.outliers_influence import variance_inflation_factor

# ==================== 1. 数据加载 ====================
DATA_PATH = r'C:\Users\20583\Desktop\数据.xlsx'
df = pd.read_excel(DATA_PATH)

# ==================== 2. 分类变量映射 ====================
df['性别'] = df['性别'].map({1: '男', 2: '女'})
df['年龄'] = df['年龄'].map({1: '18-22', 2: '22-24', 3: '24以上'})
df['政治面貌'] = df['政治面貌'].map({1: '党员', 2: '共青团员', 3: '预备党员', 4: '群众'})
df['父母职业'] = df['父母职业'].map({1: '农民', 2: '商人', 3: '教师', 4: '公务员', 5: '医疗人员', 6: '工人'})
df['家庭所在地'] = df['家庭所在地'].map({1: '农村', 2: '城市'})
df['家庭经济情况'] = df['家庭经济情况'].map({1: '富裕', 2: '中等', 3: '困难'})
df['照顾经历'] = df['照顾经历'].map({1: '有', 2: '无'})
df['住院经历'] = df['住院经历'].map({1: '有', 2: '无'})
df['生源类型'] = df['生源类型'].map({1: '文科生', 2: '理科生'})
df['第一志愿'] = df['第一志愿'].map({1: '护理学', 2: '非护理学'})
df['独生子女'] = df['独生子女'].map({1: '是'})

# ==================== 3. 定义因变量和自变量 ====================
y = df['CAI总分']
X = df[['性别', '年龄', '政治面貌', '父母职业', '家庭所在地', '家庭经济情况', '照顾经历', '住院经历', '家人健康',
        '专业喜爱', '从业意愿', '人文教育', '生源类型', '第一志愿', '独生子女', '情感与自我意识得分',
        '社会互动与关爱他人得分', '人际沟通与包容得分']]

# ==================== 4. 进行哑变量转换 ====================
X = pd.get_dummies(X, drop_first=True)  # 生成哑变量，防止虚拟变量陷阱

# ==================== 5. 处理缺失值 ====================
X = X.apply(pd.to_numeric, errors='coerce')  # 确保所有列都是数值型
X = X.fillna(X.mean())  # 仅填充数值列的缺失值
y = y.fillna(y.mean())

# ==================== 6. 数据标准化 ====================
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X = pd.DataFrame(X_scaled, columns=X.columns)  # 保持列名

# ==================== 7. 逐步回归（Stepwise Regression） ====================
def stepwise_selection(X, y, significance_level=0.05):
    """逐步回归，自动选择最优自变量"""
    included = []
    while True:
        changed = False
        excluded = list(set(X.columns) - set(included))
        new_pval = pd.Series(index=excluded)  # 计算新变量的 P 值
        for new_column in excluded:
            model = sm.OLS(y, sm.add_constant(pd.DataFrame(X[included + [new_column]]))).fit()
            new_pval[new_column] = model.pvalues[new_column]
        best_pval = new_pval.min()
        if best_pval < significance_level:
            best_feature = new_pval.idxmin()
            included.append(best_feature)
            changed = True

        model = sm.OLS(y, sm.add_constant(pd.DataFrame(X[included]))).fit()
        pvalues = model.pvalues.iloc[1:]  # 不考虑截距项
        worst_pval = pvalues.max()
        if worst_pval > significance_level:
            worst_feature = pvalues.idxmax()
            included.remove(worst_feature)
            changed = True

        if not changed:
            break

    return included

# ==================== 8. 运行逐步回归 ====================
selected_features = stepwise_selection(X, y)

# ==================== 9. 使用最优变量进行最终回归分析 ====================
X_selected = X[selected_features]  # 只保留逐步回归选出的变量
X_with_const = sm.add_constant(X_selected)  # 添加截距项
model = sm.OLS(y, X_with_const).fit()

# ==================== 10. 计算 VIF（方差膨胀因子） ====================
vif_data = pd.DataFrame()
vif_data["feature"] = X_selected.columns
vif_data["VIF"] = [variance_inflation_factor(X_selected.values, i) for i in range(X_selected.shape[1])]

# ==================== 11. 计算杜宾-瓦森统计量（DW） ====================
dw = sm.stats.durbin_watson(model.resid)

# ==================== 12. 结果写入 txt 文件 ====================
output_file = "regression_results.txt"
with open(output_file, "w", encoding="utf-8") as f:
    f.write("逐步回归选择的最优自变量：\n")
    f.write(", ".join(selected_features) + "\n\n")

    f.write("最终回归模型结果：\n")
    f.write(model.summary().as_text() + "\n\n")

    f.write("VIF 值（方差膨胀因子）：\n")
    f.write(vif_data.to_string(index=False) + "\n\n")

    f.write(f"杜宾-瓦森统计量（Durbin-Watson）： {dw}\n")

# ==================== 13. 控制台输出最终结果 ====================
print(f"回归分析结果已保存到 {output_file}")
