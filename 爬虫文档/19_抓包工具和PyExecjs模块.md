# 抓包工具和PyExeJs模块



我们在处理一些网站的时候, 会遇到一些屏蔽F12, 以及只要按出浏览器的开发者工具就会关闭甚至死机的现象. 在遇到这类网站的时候. 我们可以使用抓包工具把页面上屏蔽开发者工具的代码给干掉. 



## 一. Fiddler和Charles

这两款工具是非常优秀的抓包工具. 他们可以监听到我们计算机上所有的http网络请求. 利用这种特性. 可以获取到页面加载过程中的所有内容. 

### 1.1  软件安装.

<img src="image-20210903141421792.png" alt="image-20210903141421792" style="zoom:50%;float:left;" />

<img src="image-20210903141456885.png" alt="image-20210903141456885" style="zoom:50%;float:left;" />

<img src="image-20210903141526744.png" alt="image-20210903141526744" style="zoom:50%;float:left;" />

Win7:

<img src="image-20210903141613648.png" alt="image-20210903141613648" style="zoom:50%;float:left;" />

<img src="image-20210903141737663.png" alt="image-20210903141737663" style="zoom:50%;float:left;" />

win10:

<img src="image-20210903143006098.png" alt="image-20210903143006098" style="zoom:50%;float:left;" />

<img src="image-20210903143037689.png" alt="image-20210903143037689" style="zoom:50%;float:left;" />



### 1.2 fiddler简单配置(HTTPS)

接下来.我们打开www.vmgirls.com. 尝试抓包看看. 发现https的请求默认是不可用的. 需要配置一下证书. 

<img src="image-20210903142125488.png" alt="image-20210903142125488" style="zoom:50%;float:left;" />

<img src="image-20210903142037667.png" alt="image-20210903142037667" style="zoom:50%;float:left;" />

<img src="image-20210903142145566.png" alt="image-20210903142145566" style="zoom:50%;float:left;" />

<img src="image-20210903142201960.png" alt="image-20210903142201960" style="zoom:50%;float:left;" />



### 1.3 fiddler简单使用

清理一下信息, 然后重新刷新浏览器. 就看到被响应的html内容了. 

![image-20210904140441055](image-20210904140441055.png)

vmgirl之所以不可以打开开发者工具. 是因为在其html中导入了一个disable-devtools.js. 我们需要想办法把这个东西给干掉.  只要干掉了它. 我们就又可以打开F12的开发者工具了. 那么如何干掉它呢?  这就需要我们了解一下fiddler和charles的工作原理了. 

fiddler和charles本质其实就是一个安装在这台计算机上的一个代理. 就像这样:

![image-20210904141049511](image-20210904141049511.png)

本质上和代理没啥区别. 但是, 由于fiddler是我们自己本地的软件. 那么我们可以在fiddler里对请求过来的内容进行截取和替换.

我们做这样一个事情. 把vmgirls的页面源代码捕获. 单独写入一个html文建. 然后把其中的disable-devtools.js部分注释掉. 

![image-20210904141351617](image-20210904141351617.png)

现在这个页面源代码在我本地了.  我就可以进行替换了....

![image-20210904162103506](image-20210904162103506.png)

![image-20210904162200650](image-20210904162200650.png)

接下来. 重新刷新页面(ctrl+shift+r) , 发现右键有效果了. 

<img src="image-20210904162323824.png" alt="image-20210904162323824" style="zoom:50%;float:left;" />

![image-20210904162417006](image-20210904162417006.png)



### 1.4 charles安装和使用.

charles官网: https://www.charlesproxy.com/download/

charles激活: https://www.zzzmode.com/mytools/charles/

<img src="image-20210904164126555.png" alt="image-20210904164126555" style="zoom:50%;float:left;" />

<img src="image-20210904164149177.png" alt="image-20210904164149177" style="zoom:50%;float:left;" />

<img src="image-20210904164325357.png" alt="image-20210904164325357" style="zoom:50%;float:left;" />



==注意, 在windows环境下如果出现证书不可用的情况.需要手工去windows的证书管理器中, 把Charles的证书拖拽到可信任证书那一栏. 然后重启浏览器和charles就可以用了==

==如果证书默认就可用. 就不要胡乱拖拽==

window证书管理器: win+r: 输入certlm.msc

![image-20211228153208798](image-20211228153208798.png)

![image-20211228153348986](image-20211228153348986.png)

回到Mac

<img src="image-20210904164432762.png" alt="image-20210904164432762" style="zoom:50%;float:left;" />

<img src="image-20210904164456620.png" alt="image-20210904164456620" style="zoom:50%;float:left;" />

<img src="image-20210904164533433.png" alt="image-20210904164533433" style="zoom:50%;float:left" />



搞定. 如果想要实现和fiddler一样的功能. 我也想要进行请求拦截.怎么办?  很简单

![image-20210904164718981](image-20210904164718981.png)

<img src="image-20210904164802159.png" alt="image-20210904164802159" style="zoom:50%;float:left;" />

搞定. 



## 二. PyExecJS模块

pyexecjs是一个可以帮助我们运行js代码的一个第三方模块.  其使用是非常容易上手的. 

但是它的运行是要依赖能运行js的第三方环境的. 这里我们选择用node作为我们运行js的位置. 

### 2.1 安装Nodejs

<img src="image-20210903140740785.png" alt="image-20210903140740785" style="zoom:50%;float:left;" />

<img src="image-20210903140758138.png" alt="image-20210903140758138" style="zoom:50%;float:left;" />

<img src="image-20210903140849791.png" alt="image-20210903140849791" style="zoom:50%;float:left;" />

<img src="image-20210903140907802.png" alt="image-20210903140907802" style="zoom:50%;float:left;" />

<img src="image-20210903140924424.png" alt="image-20210903140924424" style="zoom:50%;float:left;" />

<img src="image-20210903140940664.png" alt="image-20210903140940664" style="zoom:50%;float:left;" />

<img src="image-20210903141025414.png" alt="image-20210903141025414" style="zoom:50%;float:left;" />

<img src="image-20210903141119146.png" alt="image-20210903141119146" style="zoom:50%;float:left;" />

<img src="image-20210903141258032.png" alt="image-20210903141258032" style="zoom:50%;float:left;" />

### 2.2 安装pyexecjs

```
pip install pyexecjs
```

测试一下:

````python
import execjs

print(execjs.get().name)  # Node.js (V8)
````

### 2.3 简单使用

```python
import execjs

print(execjs.get().name)

# execjs.eval 可以直接运行js代码并得到结果
js = """
    "鲁班_王昭君_猴子_亚瑟_蔡文姬".split("_")
"""
res = execjs.eval(js)
print(res)

# execjs.compile(),  call()
# execjs.compile() 事先加载好一段js代码,
jj = execjs.compile("""
    function an(a, b){
        return a + b    
    }
""")
# call() 运行代码中的xxx函数. 后续的参数是xxx的参数
ret = jj.call("an", 10, 20)
print(ret)
```

windows中如果出现编码错误. 在引入execjs之前. 插入以下代码即可.

```
import subprocess
from functools import partial
subprocess.Popen = partial(subprocess.Popen, encoding='utf-8')

import execjs
```

完事儿.  你没有看错. execjs就这几个功能就够咱用的了. 



### 2.4 实战案例(调试工具)

接下来. 我们来破解真正的百度翻译

![image-20210904174857872](image-20210904174857872.png)

通过抓包可以发现. 我们之前抓取的百度翻译其实是个伪翻译. 

真正的一句话的翻译其实它的url应该是:https://fanyi.baidu.com/v2transapi?from=en&to=zh

![image-20210904180205436](image-20210904180205436.png)

![image-20210904180239275](image-20210904180239275.png)

![image-20210904180409259](image-20210904180409259.png)

接下来就是分析这一坨

```js
y = {
    from: d.fromLang,  // 从xxxx
    to: d.toLang,     // 翻译成xxxx
    query: e,     // 被翻译的内容
    transtype: r,   // 固定的翻译类型
    simple_means_flag: 3,  // 常量
    sign: L(e),   // ????
    token: window.common.token,  // token. 这个在页面源代码里能找到
    domain: R.getCurDomain()   // 固定值. 
};
```

现在有3个值, 无法直接确定. 一个是L(e), 一个是token. 另一个是R.getCurDomain()

先看token.

![image-20210904180802367](image-20210904180802367.png)

由于在我进行翻译的时候. 页面是没有刷新的. 所以, 这个token一般在进行翻译的时候是不会改变的. 

接下来是这个domain的鬼东西, 我们在页面中设置一个断点. 并重新发送请求.

![image-20210904180923805](image-20210904180923805.png)

![image-20210904181019128](image-20210904181019128.png)

![image-20210904181036626](image-20210904181036626.png)

点进去返回的是个M.  找M

![image-20210904181200477](image-20210904181200477.png)

OK. M是常量. "common"

齐活. 剩下的就是L(e)了. 首先e是被翻译的内容. 所以这里是把"要翻译的内容"传递给了L. 但是这个L在哪里. 不好找. 很简单. 设置一个断点. 就可以. 

![image-20210904181639780](image-20210904181639780.png)



![image-20210904181710595](image-20210904181710595.png)

程序停在这里了. 接下来就是这三个按钮.  从左到右. 

第一个:  释放掉当前debug. 程序继续向后运行. 直到结束或下一个断点

第二个: 运行下一步. 相当于一行代码.  但是像咱们这里. 是在一个{}中间进行的断点. 而整个{}; 被认为是一行代码. 所以下面的 token等会被过掉. 

第三个: 运行到当前行内部. 咱们这里就是运行到L(e)里面, 看看L(e)里面是干什么的. 



![image-20210904181953750](image-20210904181953750.png)

这里就是那个L(e)了. 但这东西属实看不明白. 也不容易看明白. 里面是一个签名算法. 十分难搞. 

仔细观察下. 发现该函数内部只调用了n()  a()函数. 其他函数都是js内置的东西.OK 向上简单寻找就发现了. 这里是一个大闭包. 

![image-20210904182123724](image-20210904182123724.png)

也就是说. 整个签名的计算. 就这些功能. 没有调用外界的其他功能. 那就好办了. 我们可以直接把这个闭包内的三个函数搞出来. 变成我们的js文件

![image-20210904182356923](image-20210904182356923.png)

尝试着签个名试试看:

```python
import requests
import execjs

f = open("bbd.js", mode="r", encoding='utf-8')
js = execjs.compile(f.read())

# execjs._exceptions.ProgramError: ReferenceError: window is not defined. 
ret = js.call('e', 'love')
print(ret)
```

报错了. 说这里面没有window

确实, 由于我们的js是在node里面运行的. node是没有window对象的. 怎么办? 

![image-20210904182701332](image-20210904182701332.png)

![image-20210904182730356](image-20210904182730356.png)

整合起来这里要用到window['gtk'], 这玩意哪里找?  老实说. 真不好找. 在前面我们找token的时候. 偶然间, 发现了这样一段代码:

![image-20210904182842705](image-20210904182842705.png)

OK了 . 搞定...我们只要把js里面的window['gtk']修改成这个就好了

![image-20210904183015206](image-20210904183015206.png)

至此, 所有参数到位. 写代码就好了. 

代码:

```python
import requests
import execjs

f = open("baidu加密.js", mode="r", encoding='utf-8')
js = execjs.compile(f.read())


url = "https://fanyi.baidu.com/v2transapi?from=en&to=zh"
content = input("请输入一段英文:")
data = {
    "from": "en",
    "to": "zh",
    "query": content,
    "transtype": "realtime",
    "simple_means_flag": "3",
    "sign": js.call("e", content),
    "token": "c63d27ea65fdf259bf4d56b792e47b17",
    "domain": "common",
}
headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Referer": "https://fanyi.baidu.com/",
    "Cookie": "REALTIME_TRANS_SWITCH=1; FANYI_WORD_SWITCH=1; HISTORY_SWITCH=1; SOUND_SPD_SWITCH=1; SOUND_PREFER_SWITCH=1; BIDUPSID=7214BF57BA799CC46A76979BF673523E; PSTM=1623064780; __yjs_duid=1_7946e25e70873bbe5515a663714cef991623067825398; BAIDUID=C434B9AC411BEFD0688E2DD206C8429A:FG=1; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; MCITY=-131%3A; BDUSS=kl4RWZySlNaNlRrdWNkSVRXYjYtNGkyUzFCZlhmeklhMDFtcjRLM01GdG4zMVZoRVFBQUFBJCQAAAAAAAAAAAEAAACh3e-019TDvczlwfnB-bjnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGdSLmFnUi5hM; BDUSS_BFESS=kl4RWZySlNaNlRrdWNkSVRXYjYtNGkyUzFCZlhmeklhMDFtcjRLM01GdG4zMVZoRVFBQUFBJCQAAAAAAAAAAAEAAACh3e-019TDvczlwfnB-bjnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGdSLmFnUi5hM; H_PS_PSSID=34438_34440_34380_34496_33848_34450_34092_34107_26350_34425_22160; delPer=0; PSINO=2; BA_HECTOR=a08k202181a52h208d1gj6e0m0q; BAIDUID_BFESS=DDAD1DC127ED72714BFB37825559ACDB:FG=1; Hm_lvt_64ecd82404c51e03dc91cb9e8c025574=1628330239,1628390196,1629451250,1630747372; Hm_lpvt_64ecd82404c51e03dc91cb9e8c025574=1630747372; ab_sr=1.0.1_ODBhYjIwYzRhMjk4NDNhZDYwYjRmZWZjM2QwY2E3MGNlMDRjYTI1ZjViODM2MDgxODk5NzJjNDFkZTAxYzc0OTVkYmNhYjZiMWMzZDFmNWFkN2QxMzAwMzZlZjhjYmE3ODkxZGRkNDJkNTY2N2M0NTQxODU5YmU4YTA1NGZjYTJkMDUzN2ZkMGVkMzlmOTU1M2ZlZTRhYWY4ZDQ5YTZmNTJjYmExYzk1ZTdiY2I5MTA4YjcyZDE3MWE1MTE5YjBj",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
}

resp = requests.post(url, data=data, headers=headers)
print(resp.json())

```

