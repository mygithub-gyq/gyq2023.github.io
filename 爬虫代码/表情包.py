import requests
import re
for page in range(101,121):
    print(f'正在爬取第{page}页')
    url=f'https://www.pkdoutu.com/photo/list/?page={page}'

    headers={
                'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
    }
    response=requests.get(url=url,headers=headers)
    response.encoding=response.apparent_encoding
    imgs=re.findall(' data-original="(.*?)"',response.text)

    for index in (imgs):
        img_url=index
        img_name=index[-25:]
        img_content=requests.get(url=img_url,headers=headers).content
        with open('img4\\'+img_name,mode='wb') as f:
            f.write(img_content)

