import requests
import json
f=open('douban.txt',mode='w',encoding='utf-8')
for i in range(20):
    url=f'https://movie.douban.com/j/chart/top_list?type=13&interval_id=100%3A90&action=&start={i*20}&limit=20'
    headers={
        'Referer': 'https://movie.douban.com/typerank?type_name=%E7%88%B1%E6%83%85&type=13&interval_id=100:90&action=',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
    }
    response=requests.get(url=url,headers=headers)
    lst=response.text
    lst=json.loads(lst)
    for item in lst:
        img_url=item["cover_url"]
        score=item["rating"][0]
        title=item["title"]
        f.write(title+'|'+score+'|'+img_url+'\n')

