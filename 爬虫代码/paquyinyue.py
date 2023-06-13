import requests
import re
for page in range(5,7):
    print(f'正在爬取第{page}页')
    url=f'https://www.kugou.com/yy/rank/home/{page}-8888.html?from=rank'
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
    }
    response=requests.get(url=url,headers=headers)
    music_id_list=re.findall('data-eid="(.*?)">',response.text)
    for music_id in music_id_list:
        link='https://wwwapi.kugou.com/yy/index.php'
        data={
            'r':'play/getdata',
            'dfid':'34d4bI0aGkjq2HaZa32OW1sU',
            'appid':'1014',
            'mid':'9b0daa2185de38eab82b102796878d75',
            'platid':'4',
            'encode_album_audio_id':music_id,
            '_':'1682307966257',
        }
        json_data=requests.get(url=link,params=data,headers=headers).json()
        audio_name=json_data['data']['audio_name']
        play_url=json_data['data']['play_url']
        audio_content=requests.get(url=play_url,headers=headers).content
        with open('music4\\'+ audio_name +'.mp3',mode='wb') as f:
            f.write(audio_content)