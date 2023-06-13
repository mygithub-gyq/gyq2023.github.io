import requests
import parsel
import csv
with open('douban_top250.csv', 'w', encoding='utf-8-sig', newline='') as f:
    csv_writer = csv.writer(f)
    csv_writer.writerow(['电影名称', '导演', '演员', '上映日期', '国家', '电影类型', '评分', '评价人数', '简介'])
    for page in range(0,250,25):
        url=f'https://movie.douban.com/top250?start={page}&filter='
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
        }
        response=requests.get(url=url,headers=headers)
        selector=parsel.Selector(response.text)
        lis=selector.css('.grid_view li')
        for li in lis:
            try:
                title=li.css('.hd a span::text').get()
                info_list=li.css('.bd p:nth-child(1)::text').getall()
                actor_list=info_list[0].strip().split('   ')
                info=info_list[1].strip().split(' / ')
                director = actor_list[0].replace('导演: ', '')
                actor=actor_list[1].replace('主演:','').replace('/...','')
                date=info[0]
                country=info[1]
                movie_types=info[2]
                score=li.css('.rating_num::text').get()
                comment=li.css('.star span:nth-child(4)::text').get().replace('人评价','')
                summary=li.css('.inq::text').get()
                csv_writer.writerow([title, director, actor, date, country, movie_types, score, comment, summary])
            except Exception as e:
                print(e)

