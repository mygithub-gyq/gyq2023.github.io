import requests
import parsel
import csv
headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
}
for page in range(1,171):
    print(f"正在爬取第{page}页")
    url=f'https://place.qyer.com/china/citylist-0-0-{page}/'
    resp=requests.get(url=url,headers=headers)
    html_data=resp.text
    selector=parsel.Selector(html_data)
    lis=selector.xpath('.//ul[@class="plcCitylist"]/li')
    for li in lis:
        travel_city=li.xpath('.//h3/a/text()').get()
        travel_city=travel_city.strip()
        travel_people=li.xpath('.//p[@class="beento"]/text()').get()
        travel_hot=li.xpath('.//p[@class="pois"]/a/text()').getall()
        travel_hot=[hot.strip() for hot in travel_hot]
        travel_hot='|'.join(travel_hot)
        travel_url=li.xpath('.//h3/a/@href').get()
        travel_img=li.xpath('.//p[@class="pics"]/a/img/@src').get()
        with open("穷游.csv",mode="a",encoding="utf-8",newline="") as f:
            csv_write=csv.writer(f)
            csv_write.writerow([travel_city,travel_people,travel_hot,travel_url,travel_img])