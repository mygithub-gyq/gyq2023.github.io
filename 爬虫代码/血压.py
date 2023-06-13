import requests
import parsel
import re
import os
file_name='wenzhang\\'
if not os.path.exists(file_name):
    os.mkdir('wenzhang\\')
url = 'https://vivo.cn/2M4Pl7'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
}
response = requests.get(url=url, headers=headers)
imgs=re.findall('<img data-src="(.*?)"',response.text)
selector=parsel.Selector(response.text)
lis=selector.css('.vivo-paragraph::text').getall()
title = selector.xpath('//h1[@class="vivo-news-title title-for-vivo"]/text()').get()
'''
num=1
for img in imgs:
    img_url=img
    img_content=requests.get(url=img_url,headers=headers).content
    with open('img7\\{}.jpg'.format(num),mode='wb') as f:
        f.write(img_content)
        num=num+1
'''
with open('wenzhang\\'+title,mode='a',encoding='utf-8',newline='') as f:
    for li in lis:
        f.write(li)
