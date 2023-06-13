import requests
for page in range(9,20):
        url=f'https://m.ku6.com/video/feed?pageNo={page}&pageSize=8&subjectId=87'
        headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
        }
        response=requests.get(url=url,headers=headers)
        json_data=response.json()
        for item in json_data['data']:
                try:
                        play_url=item['playUrl']
                        title=item['title']
                        content=requests.get(url=play_url,headers=headers).content
                        with open('shipin1\\'+title+'.mp4',mode='wb') as f:
                                f.write(content)
                except Exception as e:
                        print(e)
