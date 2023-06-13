# selenium入门

selenium本身是一个自动化测试工具。它可以让python代码调用浏览器。并获取到浏览器中加载的各种资源。 我们可以利用selenium提供的各项功能。 帮助我们完成数据的抓取。



## 1. selenium概述

我们在抓取一些普通网页的时候requests基本上是可以满足的. 但是, 如果遇到一些特殊的网站. 它的数据是经过加密的. 但是呢, 浏览器却能够正常显示出来. 那我们通过requests抓取到的内容可能就不是我们想要的结果了. 例如, 

![image-20210125173604985](image-20210125173604985.png)

电影票房数据.  在浏览器上看的时候是正常的. 那么按照之前的逻辑. 我们只需要看看数据是通过哪个请求拿到的就可以进行模拟请求了. 但是!

![image-20210125173719899](image-20210125173719899.png)

数据找到了. 接着看"预览"吧

![image-20210125173744598](image-20210125173744598.png)

我们发现这个数据是经过加密算法的. 这就头疼了. 直接通过requests拿到这些内容必须要解密才能看到真实数据. 但是该网站采用的加密方式又不是那么容易破解. 此时, 各位想想如果我能通过我的程序直接调用浏览器. 让浏览器去解密这些内容. 我们直接拿结果岂不妙哉. 哎~这就引出了我们本章要讲解的selenium了. 它可以完美解决上述问题

简单介绍一下selenium, 它本身是一个自动化测试的工具. 可以启动一个全新的浏览器.并从浏览器中提取到你想要的内容. 随着各种网站的反爬机制的出现. selenium越来越受到各位爬sir的喜爱. selenium最大的缺点其实就一个, 慢! 你想啊. 他要启动一个第三方的软件(浏览器), 并且还要等待浏览器把数据渲染完毕. 这个过程必然是很耗时的. 所以它慢. 

接下来, 我们来聊聊selenium如何安装和使用. 

就像其他第三方库一样, selenium直接用pip就可以安装了

```python
pip install selenium
```

但是呢, 它与其他库不同的地方是他要启动你电脑上的浏览器, 这就需要一个驱动程序来辅助. 

chrome驱动地址:http://chromedriver.storage.googleapis.com/index.html

这里推荐用chrome浏览器. 其他浏览器的驱动请自行百度. 

![image-20210125174618013](image-20210125174618013.png)

![image-20210125174658971](image-20210125174658971.png)

根据你电脑的不同自行选择吧.  win64选win32即可. 

然后关键的来了. 把你下载的浏览器驱动放在python解释器所在的文件夹

![image-20210125175328245](image-20210125175328245.png)

OK~  前期准备工作完毕.  上代码看看, selenium是个什么鬼

```python
from selenium.webdriver import Chrome  # 导入谷歌浏览器的类


# 创建浏览器对象
web = Chrome()  # 如果你的浏览器驱动放在了解释器文件夹

web.get("http://www.baidu.com")  # 输入网址
print(web.title)  # 打印title
```

运行一下你会发现神奇的事情发生了. 浏览器自动打开了. 并且输入了网址. 也能拿到网页上的title标题. 

![image-20210125175906255](image-20210125175906255.png)

cool~

## 2. selenium各种神奇操作

selenium不但可以打开浏览器. 还可以对浏览器各种操作. 比如, 点击, 查找. 都可以. 

我们直接上案例. 抓取boss直聘python工程师的招聘信息

### 2.1 准备工作

```python
from selenium.webdriver import Chrome
import time

web = Chrome()

web.get("https://www.zhipin.com/beijing/")
time.sleep(999)  # 放置Chrome闪退。 
```

![image-20220414171509445](image-20220414171509445.png)



### 2.2 搜索python

人的过程: 找到文本框输入"python", 点击"搜索"按钮.  

机器的过程: 找到文本框输入"python", 点击"搜索"按钮. 

发现没, 用selenium最爽的地方就是这里. 人是怎么操作的. 机器就怎么操作. 爽到极点

![image-20220414172045446](image-20220414172045446.png)

此时由于selenium是利用浏览器来进行操作。 所以它的环境和requests完全不同。在selenium中可以放心的使用这个copy xpath功能。

```python
# 找到文本框输入python, 点击搜索按钮
input_element = web.find_element(By.XPATH, '//*[@id="wrap"]/div[3]/div/div[1]/div[1]/form/div[2]/p/input')
input_element.send_keys("python", Keys.ENTER)  # 输入内容，回车
# 此处也可以选择到搜索按钮。 然后点击它
btn = web.find_element(By.XPATH, '//*[@id="wrap"]/div[3]/div/div[1]/div[1]/form/button')
btn.click()

```

send_keys() 这里要说一下. 如果我们给出的是一个字符串. 就是输入文本. 但是, 如果给出的是一个键盘指令, 那就按下键盘. 比如, 我想要按回车按钮. 就是这样的

```python
from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time


# 1.创建浏览器
web = Chrome()

# 2.输入网址
web.get("https://www.zhipin.com/beijing/")
# 爬取python相关的招聘信息

time.sleep(3)

# 建议再这里先等待一下下
time.sleep(1)

# 找到那个文本框, 输入python. 然后输入回车.
input_element = web.find_element(By.XPATH, '//*[@id="wrap"]/div[3]/div/div[1]/div[1]/form/div[2]/p/input')
input_element.send_keys("python", Keys.ENTER)  # 输入内容

time.sleep(3)
```

![image-20220414161252937](image-20220414161252937.png)

keys里几乎包含了我们需要的所有特殊按键



### 2.3 提取招聘信息

```python
from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time


# 1.创建浏览器
web = Chrome()

# 2.输入网址
web.get("https://www.zhipin.com/beijing/")
# 爬取python相关的招聘信息

time.sleep(3)

# 建议再这里先等待一下下
time.sleep(1)

# 找到那个文本框, 输入python. 然后输入回车.
input_element = web.find_element(By.XPATH, '//*[@id="wrap"]/div[3]/div/div[1]/div[1]/form/div[2]/p/input')
input_element.send_keys("python", Keys.ENTER)  # 输入内容

time.sleep(3)
# 获取岗位名称和公司名称
# bs4 find   findall
# find_element    find_elements
li_list = web.find_elements(By.XPATH, '//*[@class="job-list"]/ul/li')
print(len(li_list))
for li in li_list:
    job_name_span = li.find_element(By.XPATH, './/span[@class="job-name"]')

    name = job_name_span.text  # 拿到里面的文本 -> 和原来的xpath不一样
    price_span = li.find_element(By.XPATH, ".//div[@class='job-limit clearfix']/span")
    price = price_span.text

    a = li.find_element(By.XPATH, './/span[@class="job-name"]/a')
    href = a.get_property("href")  # 获取属性
    print(name, price, href)  # 后面的东西。 你们自己品品
```

发现没有, selenium几乎是傻瓜式的存在. 



## 3. 处理iframe, 多窗口调度

### 3.1 窗口切换

我们书接上回. 上回说到我们已经可以通过selenium拿到zhpin网的招聘信息了. 但是, 信息不够全面. 我们希望得到的不仅仅是一个岗位名称和公司名称, 我更想知道更加详细的职位描述以及岗位要求. 

![image-20220414172630869](image-20220414172630869.png)

此时问题就来了. 我们可以在搜索页面点击进入到这个详情页. 然后就可以看到想要的职位描述了. 但是, 这时就涉及到如何从一个窗口转向另一个窗口了(切换选项卡).

![image-20220414172812917](I:\BaiduNetdiskDownload\二期\2021_11_02_初识selenium\课件\image-20220414172812917.png)

<span style='color:red;background:yellow;'>注意!  我们看到的是新窗口的内容, 但是在selenium的视角里, 窗口依然停留在刚才那个窗口. 此时, 必须要将窗口调整到最新的窗口上才可以. </span>

```python
# 窗口切换
# web.window_handles表示当前被打开的各个窗口
web.switch_to.window(web.window_handles[-1])  # 跳转到最后一个窗口
print(job_detail)
# 干一些事情
web.close()  # 关闭窗口 
web.switch_to.window(web.window_handles[0]) # 切换回来
```

完整代码

```python
from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time


# 1.创建浏览器
web = Chrome()

# 2.输入网址
web.get("https://www.zhipin.com/beijing/")
# 爬取python相关的招聘信息

time.sleep(3)

# 建议再这里先等待一下下
time.sleep(1)

# 找到那个文本框, 输入python. 然后输入回车.
input_element = web.find_element(By.XPATH, '//*[@id="wrap"]/div[3]/div/div[1]/div[1]/form/div[2]/p/input')
input_element.send_keys("python", Keys.ENTER)  # 输入内容

time.sleep(3)
# 获取岗位名称和公司名称
# bs4 find   findall
# find_element    find_elements
li_list = web.find_elements(By.XPATH, '//*[@class="job-list"]/ul/li')
print(len(li_list))
for li in li_list:
    job_name_span = li.find_element(By.XPATH, './/span[@class="job-name"]')

    name = job_name_span.text  # 拿到里面的文本 -> 和原来的xpath不一样
    price_span = li.find_element(By.XPATH, ".//div[@class='job-limit clearfix']/span")
    price = price_span.text

    a = li.find_element(By.XPATH, './/span[@class="job-name"]/a')
    href = a.get_property("href")  # 获取属性
    print(name, price, href)
    a.click()
    time.sleep(3)
    web.switch_to.window(web.window_handles[-1])
    content = web.find_element(By.XPATH, "//div[@class='detail-content']")
    print(content.text)
    web.close()
    web.switch_to.window(web.window_handles[0])

time.sleep(999)
web.close()

```



### 3.2 iframe切换

接下来我们来看另一种操作. 

之前我们抓取过一个网站. 里面把视频内容嵌套在一个iframe中. 那如果换成了selenium应该如何应对呢?

![image-20210709175412897](image-20210709175412897.png)

```python
from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By

web = Chrome()
web.get("http://www.wbdy.tv/play/42491_1_1.html")

# 找到那个iframe
iframe = web.find_element(By.XPATH, '//iframe[@id="mplay"]')

web.switch_to.frame(iframe)
val = web.find_element(By.XPATH, '//input[@class="dplayer-comment-input"]').get_attribute("placeholder")
print(val)

# 调整回上层结构
web.switch_to.parent_frame()
xxx = web.find_element(By.XPATH, '/html/body/div[2]/div[3]/div[2]/div/div[2]/h2').text
print(xxx)

```



## 4. 无头浏览器

我们已经基本了解了selenium的基本使用了. 但是呢, 不知各位有没有发现, 每次打开浏览器的时间都比较长. 这就比较耗时了. 我们写的是爬虫程序. 目的是数据. 并不是想看网页. 那能不能让浏览器在后台跑呢? 答案是可以的. 

咱直接上案例吧. 拿出最开始我们看到的那个网页. 抓取电影票房. 并且用正常的有浏览器窗口的方式来抓取. 然后再改成后台运行不就好了么

```python
from selenium.webdriver import Chrome
from selenium.webdriver.support.select import Select
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


import time


opt = Options()
opt.add_argument("--headless")
opt.add_argument('--disable-gpu')
opt.add_argument("--window-size=4000,1600")  # 设置窗口大小

web = Chrome(options=opt)
web.get('https://www.endata.com.cn/BoxOffice/BO/Year/index.html')


# 切换select
sel = Select(web.find_element(By.XPATH,'//*[@id="OptionDate"]'))
for i in range(len(sel.options)):
    sel.select_by_index(i)  # 按照索引位置切换
    time.sleep(1)
    table = web.find_element(By.XPATH,'//*[@id="TableList"]/table')
    print("===========================================")
    print(table.text)
```





## 5. 超级鹰搞定验证码

在进行爬虫抓取的时候遇到验证码怎么办?  这个问题其实一直都很蛋疼. 怎么解决呢? 

1. 自己想办法写一套深度学习算法. 有针对的去学习各种验证码的识别方案
2. 使用互联网上已经相对成熟的产品进行验证码识别. 

理性告诉我, 方案二更适合我.

这里推荐各位可以用超级鹰来做测试. 不同的平台使用的算法可能是不一样的. 但是调用方案几乎都差不太多. 

我们来看看超级鹰怎么用. 首先, 登录超级鹰的官网. 然后需要注册. 注册后, 需要我们进入用户中心. 生成一个新的软件ID就可以用了

![image-20210202175436553](image-20210202175436553.png)

![image-20210202175456323](image-20210202175456323.png)

![image-20210202175513804](image-20210202175513804.png)

注意这个号, 后面会用到. 

然后我们回到超级鹰的官网. 找到测试代码. 找到python的测试代码, 下载. 丢到pycharm里

![image-20210202175619221](image-20210202175619221.png)

![image-20210202175637499](image-20210202175637499.png)

下载好的内容解压. 丢到pycharm中. 

![image-20210202175728621](image-20210202175728621.png)

![image-20220414233659680](image-20220414233659680.png)

最后, 测试一下

![image-20210202175947934](image-20210202175947934.png)

识别效果还是不错的. 

```python
#!/usr/bin/env python
# coding:utf-8

import requests
from hashlib import md5

class Chaojiying_Client(object):

    def __init__(self, username, password, soft_id):
        self.username = username
        password =  password.encode('utf8')
        self.password = md5(password).hexdigest()
        self.soft_id = soft_id
        self.base_params = {
            'user': self.username,
            'pass2': self.password,
            'softid': self.soft_id,
        }
        self.headers = {
            'Connection': 'Keep-Alive',
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)',
        }

    def PostPic(self, im, codetype):
        """
        im: 图片字节
        codetype: 题目类型 参考 http://www.chaojiying.com/price.html
        """
        params = {
            'codetype': codetype,
        }
        params.update(self.base_params)
        files = {'userfile': ('ccc.jpg', im)}
        r = requests.post('http://upload.chaojiying.net/Upload/Processing.php', data=params, files=files, headers=self.headers)
        return r.json()

    def ReportError(self, im_id):
        """
        im_id:报错题目的图片ID
        """
        params = {
            'id': im_id,
        }
        params.update(self.base_params)
        r = requests.post('http://upload.chaojiying.net/Upload/ReportError.php', data=params, headers=self.headers)
        return r.json()


if __name__ == '__main__':
    chaojiying = Chaojiying_Client('18614075987', 'q6035945', '912488')	
    im = open('a.jpg', 'rb').read()							
    print(chaojiying.PostPic(im, 1902))								


```



如果遇到的验证码比较特殊. 可以更换代码中的1902位置的参数值. 具体情况可以参考官网上给出的参数列表

![image-20210202180109096](image-20210202180109096.png)

需要哪个填哪个就行. 

各位可以自行做个测试. 用超级鹰来破解超级鹰的登录验证码~~ 相信会很有意思.



## 6. 超级鹰干超级鹰

本小节, 我们用超级鹰来破解超级鹰的验证码. 看看效果如何~

```python
from selenium.webdriver import Chrome
from chaojiying import Chaojiying_Client
from selenium.webdriver.common.by import By
import time


web = Chrome()
web.get("http://www.chaojiying.com/user/login/")


code_img = web.find_element(By.XPATH,'/html/body/div[3]/div/div[3]/div[1]/form/div/img')
png_code_img = code_img.screenshot_as_png  # 拿到img的截图

chaojiying = Chaojiying_Client('18614075987', 'q6035945', '912488')
result = chaojiying.PostPic(png_code_img, 1902)

web.find_elementh(By.XPATH,'/html/body/div[3]/div/div[3]/div[1]/form/p[1]/input').send_keys('18614075987')
web.find_element(By.XPATH,'/html/body/div[3]/div/div[3]/div[1]/form/p[2]/input').send_keys('q6035945')
web.find_element(By.XPATH,'/html/body/div[3]/div/div[3]/div[1]/form/p[3]/input').send_keys(result['pic_str'])
time.sleep(10)
web.find_element(By.XPATH,'/html/body/div[3]/div/div[3]/div[1]/form/p[4]/input').click()
```

<span style='color:red;background:yellow;'>注意! selenium不是无敌的， 不要认为selenium学会了。 所有的爬取工作都用它。 这东西偶尔拿来干一些小活。 数据量不大，不急，客户只要数据，不要源码的情况下可以考虑使用selenium. </span>
