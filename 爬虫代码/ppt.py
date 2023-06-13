import requests
import re
import os
file_name='ppt5\\'
if not os.path.exists(file_name):
    os.mkdir('ppt5\\')
for page in range(1,13):
    print(f"正在爬取第{page}页")
    url = f'https://www.ypppt.com/ziti/list-{page}.html'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
    }
    response = requests.get(url=url, headers=headers)
    response.encoding='utf-8'
    ppt_info=re.findall('<a href="(.*?)" class="p-title" target="_blank">(.*?)</a>',response.text)
    for index,title in ppt_info:
        try:
            ppt_id=index.split('/')[-1][:-5]
            index_url=f'https://www.ypppt.com/p/d.php?aid={ppt_id}'
            response1=requests.get(url=index_url,headers=headers)
            response1.encoding='utf-8'
            download_url=re.findall('<li><a href="(.*?)">下载地址1</a></li>',response1.text)[0]
            ppt_content=requests.get(url=download_url,headers=headers).content
            with open('ppt5\\'+title+'.zip',mode='wb') as f:
                f.write(ppt_content)
        except Exception as e:
            print(e)
