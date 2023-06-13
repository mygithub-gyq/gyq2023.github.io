import requests
import parsel
import re
import time
for page in range(1,11):
    print(f'正在爬取第{page}页的数据内容')
    url=f'http://www.netbian.com/weimei/index_{page}.htm'
    headers={
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
    }
    respnse=requests.get(url=url,headers=headers)
    respnse.encoding=respnse.apparent_encoding
    img_ids=re.findall('<li><a href="/desk/(\d+).htm" title=',respnse.text)
    for img_id in img_ids:
        time.sleep(1)
        link_url=f'http://www.netbian.com/desk/{img_id}-1920x1080.htm'
        respnse1=requests.get(url=link_url,headers=headers)
        respnse1.encoding = respnse1.apparent_encoding
        selector=parsel.Selector(respnse1.text)
        img_url=selector.css('#endimg img::attr(src)').get()
        title=selector.css('#endimg img::attr(title)').get()
        img_content=requests.get(url=img_url,headers=headers).content
        with open('img8\\'+title+'.jpg',mode='wb') as f:
            f.write(img_content)
