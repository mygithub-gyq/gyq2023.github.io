import requests
import re
for page in range(11,17):
        url=f'https://api.bilibili.com/x/v2/dm/web/history/seg.so?type=1&oid=1100428395&date=2023-05-{page}'
        headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
                'cookie': 'buvid3=9F603FB0-26C6-E825-7DC3-3823AC572B5874239infoc; b_nut=1683879474; i-wanna-go-back=-1; _uuid=81EA39A4-EEDF-1082B-476E-A910985224BB180395infoc; FEED_LIVE_VERSION=V8; home_feed_column=4; browser_resolution=1239-597; buvid4=C73C9F6E-313B-1F70-4404-6764D497221075760-023051216-xxaMMcKA84S04jPdABdHCA%3D%3D; buvid_fp=ea010551d548f1abb74666df09cfce18; header_theme_version=CLOSE; SESSDATA=6f49adf0%2C1699760670%2Cbcc6e%2A51; bili_jct=d1e39a570539a86702b5218e695fe193; DedeUserID=266937203; DedeUserID__ckMd5=e3c17ddef304bf86; sid=5mninxdf; bp_video_offset_266937203=796156799403163600; CURRENT_FNVAL=4048; rpdid=|(YuJ)|ku)m0JuY)Rk|)Ymk; b_ut=5; b_lsid=2DE10466C_18822B938C3; bsource=search_baidu; innersign=1; PVID=3'
        }
        response=requests.get(url=url,headers=headers)
        response.encoding='utf-8'
        content_list=re.findall(':(.*?)@',response.text)
        for index in content_list:
                content=index[1:]
                with open('弹幕.txt',mode='a',encoding='utf-8') as f:
                        f.write(content)
                        f.write('\n')




