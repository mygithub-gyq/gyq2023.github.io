import pandas as pd
def get_wtl(lst):
    result = {"Win": 0, "Tie": 0, "Lose": 0}
    ori = lst[0]
    for i in range(1, len(lst)):
        if abs(lst[i] - ori) < 0.01:
            result["Tie"] += 1
        elif ori > lst[i] + 0.01:
            result["Win"] += 1
        elif lst[i] > ori + 0.01:
            result["Lose"] += 1
    return result

df = pd.read_excel(r'C:\Users\20583\Desktop\论文初稿\样例选取结果.xlsx', header=None,sheet_name="EFF")

# 对每一行应用函数
df['WTL_Result'] = df.apply(lambda row: get_wtl(row.tolist()), axis=1)

# 将结果写回Excel文件
df.to_excel(r'C:\Users\20583\Desktop\EFF.xlsx', index=False)




# import pandas as pd
#
# # 读取 Excel 文件，假设两个文件分别是 file1.xlsx 和 file2.xlsx
# df1 = pd.read_excel(r'C:\Users\20583\Desktop\论文初稿\样例选取结果.xlsx', header=None,sheet_name="EFF")  # 第一个表格
# df2 = pd.read_excel(r'C:\Users\20583\Desktop\论文初稿\num粒球.xlsx', header=None,sheet_name="EFF")  # 第二个表格
#
# # 确保两个表格形状相同
# if df1.shape != df2.shape:
#     raise ValueError("两个Excel表格的形状不相同，无法合并。")
#
# # 初始化一个空的 DataFrame 用于存储结果
# result_df = pd.DataFrame(index=df1.index, columns=df1.columns)
#
# # 遍历 DataFrame 中的每个元素，将对应的值和排名合并
# for i in range(df1.shape[0]):  # 遍历行
#     for j in range(df1.shape[1]):  # 遍历列
#         value = df1.iloc[i, j]
#         rank = df2.iloc[i, j]
#         # 格式化数据
#         formatted_value = f"{value:.4f}"  # 括号外面的值保留四位小数
#         formatted_rank = f"{int(rank)}" if rank.is_integer() else f"{rank:.1f}"  # 括号里的值为整数或保留一位小数
#         # 合并结果
#         result_df.iloc[i, j] = f"{formatted_value}({formatted_rank})"
#
# # 将结果保存到新的 Excel 文件
# result_df.to_excel(r'C:\Users\20583\Desktop\12.19.EFF.xlsx', index=False, header=False)
#
# print("合并完成，结果已保存为 'merged_result13.xlsx'")
