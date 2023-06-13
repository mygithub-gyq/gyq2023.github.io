import requests
import re
for page in range(1,1801):
    print(f'正在爬取第{page}页的数据内容')
    url=f'http://www.godoutu.com/face/hot/page/{page}.html'
    headers={
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
    }
    response=requests.get(url=url,headers=headers)
    img_urls=re.findall('<img class="ui image lazy" data-original="(.*?)" .*?>',response.text)
    titles=re.findall('<img class="ui image lazy" .*?title="(.*?)" .*?>',response.text)
    for url1,title in zip(img_urls,titles):
        img_url=url1
        img_title=title
        img_title=re.sub(r'[-/\*?:"<>|]','_',img_title)
        img_content=requests.get(url=img_url,headers=headers).content
        try:
            with open("img9\\"+img_title+'.jpg',mode='wb') as f:
                f.write(img_content)
        except:
            pass




