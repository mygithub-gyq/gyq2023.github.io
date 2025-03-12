import pandas as pd
import numpy as np
from scipy import stats
import warnings

warnings.filterwarnings("ignore")

# ==================== 1. 数据加载 ====================
DATA_PATH = r'C:\Users\20583\Desktop\按序号_护理本科实习生人文关怀能力相关调查_406_406.xlsx'
df = pd.read_excel(DATA_PATH)
print("- 数据加载完成，样本量：", df.shape[0])

# ==================== 2. 列名映射 ====================
BASE_MAPPING = {
    '1.您的性别:': '性别',
    '2.您的年龄:': '年龄',
    '3.政治面貌:': '政治面貌',
    '4.父母职业：': '父母职业',
    '5.家庭所在地:': '家庭所在地',
    '6.家庭经济情况在当地属于：': '家庭经济情况',
    '7.是否有照顾他人的经历?': '照顾经历',
    '8.自己是否有过住院经历': '住院经历',
    '9.家人总体的健康状况：': '家人健康',
    '10.对目前所学专业的喜爱程度': '专业喜爱',
    '11.毕业后从事护理工作的意愿：': '从业意愿',
    '12.您接受过人文关怀知识情况(课程、书籍、讲座):': '人文教育',
    '13.入学时生源性质：': '生源类型',
    '14.高考时第一志愿：': '第一志愿',
    '15.是否为独生子女': '独生子女'
}

# 重命名 DataFrame 中的列
df.rename(columns=BASE_MAPPING, inplace=True)

# ==================== 3. 逆向计分 ====================
REVERSE_ITEMS = {
    'Q4': 7, 'Q8': 7, 'Q10': 7, 'Q11': 7, 'Q12': 7,
    'Q13': 7, 'Q14': 7, 'Q15': 7, 'Q16': 7, 'Q28': 7,
    'Q29': 7, 'Q32': 7
}
for item, max_score in REVERSE_ITEMS.items():
    if item in df.columns:
        df[item] = max_score - df[item] + 1

# ==================== 4. 计算 CAI 分数 ====================
knowing_items = ['Q2', 'Q3', 'Q6', 'Q7', 'Q9', 'Q19', 'Q22', 'Q26', 'Q30', 'Q31', 'Q33', 'Q34', 'Q35', 'Q36']
courage_items = ['Q4', 'Q8', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q23', 'Q25', 'Q28', 'Q29', 'Q32']
patience_items = ['Q1', 'Q5', 'Q10', 'Q17', 'Q18', 'Q20', 'Q21', 'Q24', 'Q27', 'Q37']

df['认知维度得分'] = df[knowing_items].sum(axis=1)
df['勇气维度得分'] = df[courage_items].sum(axis=1)
df['耐心维度得分'] = df[patience_items].sum(axis=1)
df['CAI总分'] = df['认知维度得分'] + df['勇气维度得分'] + df['耐心维度得分']


# ==================== 5. Cronbach’s α 计算 ====================
def cronbach_alpha(data):
    """计算 Cronbach's α 系数，data 为包含各题得分的 DataFrame"""
    data = data.dropna()
    items = data.values
    n_items = items.shape[1]
    variances = items.var(axis=0, ddof=1)
    total_variance = items.sum(axis=1).var(ddof=1)
    alpha = (n_items / (n_items - 1)) * (1 - variances.sum() / total_variance)
    return alpha


all_items = [f'Q{i}' for i in range(1, 38)]
CAI_alpha = cronbach_alpha(df[all_items])
alpha_knowing = cronbach_alpha(df[knowing_items])
alpha_courage = cronbach_alpha(df[courage_items])
alpha_patience = cronbach_alpha(df[patience_items])

print("\n【Cronbach’s α 系数】")
print(f"总量表 CAI: α = {CAI_alpha:.2f}")
print(f"认知维度: α = {alpha_knowing:.2f}")
print(f"勇气维度: α = {alpha_courage:.2f}")
print(f"耐心维度: α = {alpha_patience:.2f}")

# ==================== 6. 分组比较（按基本信息变量） ====================
# 初始化报告内容
report = ""

# 第一组：个人情况的分析
personal_vars = ['性别', '年龄', '政治面貌', '独生子女']
existing_personal_vars = [var for var in personal_vars if var in df.columns]
report += "\n存在的个人情况分组变量:\n"
report += f"{existing_personal_vars}\n"

for var in existing_personal_vars:
    report += f"\n【分组变量：{var}】\n"
    group_stats = df.groupby(var)[['CAI总分', '认知维度得分', '勇气维度得分', '耐心维度得分']].agg(
        count=('CAI总分', 'count'),
        mean_CAI=('CAI总分', 'mean'),
        std_CAI=('CAI总分', 'std'),
        mean_knowing=('认知维度得分', 'mean'),
        std_knowing=('认知维度得分', 'std'),
        mean_courage=('勇气维度得分', 'mean'),
        std_courage=('勇气维度得分', 'std'),
        mean_patience=('耐心维度得分', 'mean'),
        std_patience=('耐心维度得分', 'std')
    )

    # Display the complete group stats
    report += f"{group_stats.to_string()}\n"

    # Perform ANOVA or t-test based on the number of unique groups
    unique_groups = df[var].nunique()
    if unique_groups == 2:  # t-test for 2 groups
        group1 = df[df[var] == df[var].unique()[0]]['CAI总分']
        group2 = df[df[var] == df[var].unique()[1]]['CAI总分']
        t_stat, p_value = stats.ttest_ind(group1, group2, nan_policy='omit')
        report += f"t检验 (CAI总分) for {var}: t = {t_stat:.2f}, p = {p_value:.4f}\n"
    else:  # ANOVA for more than 2 groups
        groups = [group['CAI总分'].dropna() for name, group in df.groupby(var)]
        anova_result = stats.f_oneway(*groups)
        report += f"ANOVA 检验 (CAI总分) for {var}: F = {anova_result.statistic:.2f}, p = {anova_result.pvalue:.4f}\n"

# 第二组：家庭背景的分析
family_vars = ['家庭所在地', '家庭经济情况', '父母职业']
existing_family_vars = [var for var in family_vars if var in df.columns]
report += "\n存在的家庭背景分组变量:\n"
report += f"{existing_family_vars}\n"

for var in existing_family_vars:
    report += f"\n【分组变量：{var}】\n"
    group_stats = df.groupby(var)[['CAI总分', '认知维度得分', '勇气维度得分', '耐心维度得分']].agg(
        count=('CAI总分', 'count'),
        mean_CAI=('CAI总分', 'mean'),
        std_CAI=('CAI总分', 'std'),
        mean_knowing=('认知维度得分', 'mean'),
        std_knowing=('认知维度得分', 'std'),
        mean_courage=('勇气维度得分', 'mean'),
        std_courage=('勇气维度得分', 'std'),
        mean_patience=('耐心维度得分', 'mean'),
        std_patience=('耐心维度得分', 'std')
    )

    report += f"{group_stats.to_string()}\n"

    # Perform ANOVA or t-test based on the number of unique groups
    unique_groups = df[var].nunique()
    if unique_groups == 2:  # t-test for 2 groups
        group1 = df[df[var] == df[var].unique()[0]]['CAI总分']
        group2 = df[df[var] == df[var].unique()[1]]['CAI总分']
        t_stat, p_value = stats.ttest_ind(group1, group2, nan_policy='omit')
        report += f"t检验 (CAI总分) for {var}: t = {t_stat:.2f}, p = {p_value:.4f}\n"
    else:  # ANOVA for more than 2 groups
        groups = [group['CAI总分'].dropna() for name, group in df.groupby(var)]
        anova_result = stats.f_oneway(*groups)
        report += f"ANOVA 检验 (CAI总分) for {var}: F = {anova_result.statistic:.2f}, p = {anova_result.pvalue:.4f}\n"

# 第三组：专业情况的分析
major_vars = ['生源类型', '第一志愿', '专业喜爱', '从业意愿']
existing_major_vars = [var for var in major_vars if var in df.columns]
report += "\n存在的专业情况分组变量:\n"
report += f"{existing_major_vars}\n"

for var in existing_major_vars:
    report += f"\n【分组变量：{var}】\n"
    group_stats = df.groupby(var)[['CAI总分', '认知维度得分', '勇气维度得分', '耐心维度得分']].agg(
        count=('CAI总分', 'count'),
        mean_CAI=('CAI总分', 'mean'),
        std_CAI=('CAI总分', 'std'),
        mean_knowing=('认知维度得分', 'mean'),
        std_knowing=('认知维度得分', 'std'),
        mean_courage=('勇气维度得分', 'mean'),
        std_courage=('勇气维度得分', 'std'),
        mean_patience=('耐心维度得分', 'mean'),
        std_patience=('耐心维度得分', 'std')
    )

    report += f"{group_stats.to_string()}\n"

    # Perform ANOVA or t-test based on the number of unique groups
    unique_groups = df[var].nunique()
    if unique_groups == 2:  # t-test for 2 groups
        group1 = df[df[var] == df[var].unique()[0]]['CAI总分']
        group2 = df[df[var] == df[var].unique()[1]]['CAI总分']
        t_stat, p_value = stats.ttest_ind(group1, group2, nan_policy='omit')
        report += f"t检验 (CAI总分) for {var}: t = {t_stat:.2f}, p = {p_value:.4f}\n"
    else:  # ANOVA for more than 2 groups
        groups = [group['CAI总分'].dropna() for name, group in df.groupby(var)]
        anova_result = stats.f_oneway(*groups)
        report += f"ANOVA 检验 (CAI总分) for {var}: F = {anova_result.statistic:.2f}, p = {anova_result.pvalue:.4f}\n"

# 第四组：健康状况与人文关怀知识的分析
health_vars = ['家人健康', '照顾经历', '住院经历', '人文教育']
existing_health_vars = [var for var in health_vars if var in df.columns]
report += "\n存在的健康与人文关怀知识分组变量:\n"
report += f"{existing_health_vars}\n"

for var in existing_health_vars:
    report += f"\n【分组变量：{var}】\n"
    group_stats = df.groupby(var)[['CAI总分', '认知维度得分', '勇气维度得分', '耐心维度得分']].agg(
        count=('CAI总分', 'count'),
        mean_CAI=('CAI总分', 'mean'),
        std_CAI=('CAI总分', 'std'),
        mean_knowing=('认知维度得分', 'mean'),
        std_knowing=('认知维度得分', 'std'),
        mean_courage=('勇气维度得分', 'mean'),
        std_courage=('勇气维度得分', 'std'),
        mean_patience=('耐心维度得分', 'mean'),
        std_patience=('耐心维度得分', 'std')
    )

    report += f"{group_stats.to_string()}\n"

    # Perform ANOVA or t-test based on the number of unique groups
    unique_groups = df[var].nunique()
    if unique_groups == 2:  # t-test for 2 groups
        group1 = df[df[var] == df[var].unique()[0]]['CAI总分']
        group2 = df[df[var] == df[var].unique()[1]]['CAI总分']
        t_stat, p_value = stats.ttest_ind(group1, group2, nan_policy='omit')
        report += f"t检验 (CAI总分) for {var}: t = {t_stat:.2f}, p = {p_value:.4f}\n"
    else:  # ANOVA for more than 2 groups
        groups = [group['CAI总分'].dropna() for name, group in df.groupby(var)]
        anova_result = stats.f_oneway(*groups)
        report += f"ANOVA 检验 (CAI总分) for {var}: F = {anova_result.statistic:.2f}, p = {anova_result.pvalue:.4f}\n"

# ==================== 7. 关怀能力水平划分 ====================
bins = [-np.inf, 203.10, 220.30, np.inf]
labels = ['较低', '中等', '较高']
df['关怀能力水平'] = pd.cut(df['CAI总分'], bins=bins, labels=labels)

# ==================== 8. 文字报告 ====================
desc_stats = {}  # 定义 desc_stats
dims = ['认知维度得分', '勇气维度得分', '耐心维度得分', 'CAI总分']
for col in dims:
    desc_stats[col] = {
        'min': df[col].min(),
        'max': df[col].max(),
        'mean': df[col].mean(),
        'std': df[col].std()
    }

report += f"""
【CAI 量表分析报告】

1. 量表构成：
   本问卷包含 37 个题目，其中按标准划分为：
   - 认知维度（14 题）：{', '.join(knowing_items)}
   - 勇气维度（13 题）：{', '.join(courage_items)}
   - 耐心维度（10 题）：{', '.join(patience_items)}

2. 分数统计（实际样本）：
   - 认知维度得分：最小值={desc_stats['认知维度得分']['min']:.2f}, 最大值={desc_stats['认知维度得分']['max']:.2f}, 均值={desc_stats['认知维度得分']['mean']:.2f}, 标准差={desc_stats['认知维度得分']['std']:.2f}
   - 勇气维度得分：最小值={desc_stats['勇气维度得分']['min']:.2f}, 最大值={desc_stats['勇气维度得分']['max']:.2f}, 均值={desc_stats['勇气维度得分']['mean']:.2f}, 标准差={desc_stats['勇气维度得分']['std']:.2f}
   - 耐心维度得分：最小值={desc_stats['耐心维度得分']['min']:.2f}, 最大值={desc_stats['耐心维度得分']['max']:.2f}, 均值={desc_stats['耐心维度得分']['mean']:.2f}, 标准差={desc_stats['耐心维度得分']['std']:.2f}
   - CAI 总分：最小值={desc_stats['CAI总分']['min']:.2f}, 最大值={desc_stats['CAI总分']['max']:.2f}, 均值={desc_stats['CAI总分']['mean']:.2f}, 标准差={desc_stats['CAI总分']['std']:.2f}

3. 信度分析：
   - CAI 总量表 Cronbach’s α = {CAI_alpha:.2f}
   - 认知维度 Cronbach’s α = {alpha_knowing:.2f}
   - 勇气维度 Cronbach’s α = {alpha_courage:.2f}
   - 耐心维度 Cronbach’s α = {alpha_patience:.2f}

4. 分组比较：
   基本信息变量（如性别、年级、民族、独生子女、班干部、参加社团、政治面貌等）对 CAI 总分及各维度得分的差异见附表。

5. 关怀能力水平：
   根据文献分界：CAI总分 > 220.30 为较高，203.10～220.30 为中等，<203.10 为较低。
   本样本中，各组分布情况请参见数据输出。

【备注】本报告为初步分析结果，详细统计检验结果及多重比较见后续表格输出。
"""

# ==================== 9. 结果保存 ====================
with open('CAI_分析报告7.txt', 'w', encoding='utf-8') as f_report:
    f_report.write(report)

print("\n分析完成，结果已保存至 'CAI_分析报告1.txt'")


