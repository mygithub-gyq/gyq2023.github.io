import requests
import parsel
import csv
with open('天气数据.csv', encoding='utf-8', mode='a', newline='') as f:
    csv_writer = csv.writer(f)
    csv_writer.writerow(['日期','最高温度','最低温度','天气','风向','空气指数','城市'])
city_list=[53915]
for city in city_list:
    for year in range(2012,2023):
        for month in range(1,13):
            url=f'https://tianqi.2345.com/Pc/GetHistory?areaInfo%5BareaId%5D={city}&areaInfo%5BareaType%5D=2&date%5Byear%5D={year}&date%5Bmonth%5D={month}'
            response=requests.get(url)
            json_data=response.json()
            html_data=json_data['data']
            select=parsel.Selector(html_data)
            trs=select.css('table tr')
            for tr in trs[1:]:
                tds1=tr.css('td::text').getall()
                tds2=tr.css('span::text').getall()
                tds=tds1+tds2
                if city==53915:
                    tds.append('平凉')
                with open('天气数据.csv',encoding='utf-8',mode='a',newline='') as f:
                    csv_writer=csv.writer(f)
                    csv_writer.writerow(tds)


