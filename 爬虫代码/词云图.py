#导包
import jieba #中文分词
from wordcloud import WordCloud #词云
import numpy as np #数据计算
import PIL.Image as image #图像处理
import matplotlib.pyplot as plt #绘图
import stopwords
text=open(r"E:\soft\Programs\Python\Python310\评论.txt",encoding='utf-8') #打开文本,注意编码格式

mylist=list(text) #转成列表

word_list=[" ".join(jieba.cut(row)) for row in mylist] #对每一行进行分词,按空格存放

new_list=' '.join(word_list) #所有合并在一起,成一个整体列表

mask=np.array(image.open(r"E:\soft\Programs\Python\Python310\u=1046673898,4036200756&fm=26&gp=0.jpg")) #词云图的背景图片'''

stopwords = set()
content = [line.strip() for line in open(r'E:\soft\Programs\Python\Python310\hit_stopwords.txt', 'r', encoding='utf-8').readlines()]
stopwords.update(content)

wordcloud=WordCloud(font_path="simhei.ttf",#字体
                    background_color="black",#背景颜色
                    max_words=2000,#最大词频数
                    mask=mask,
                    stopwords=stopwords).generate(new_list)#统计
plt.subplots(dpi=300)
plt.imshow(wordcloud)#绘制词云图
plt.axis('off')#隐藏坐标轴
plt.show()#显示图片