import requests
from lxml import etree
import time
for num in range(2001,2010):
    print(f"正在爬取{num}年的电影票房")
    url = f"http://www.boxofficecn.com/boxoffice{num}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36"
    }
    resp = requests.get(url, headers=headers)
    tree=etree.HTML(resp.text)
    trs=tree.xpath("//table/tbody/tr")[1:-1]
    f=open(f"dy{num}.txt",mode="w",encoding="utf-8")
    f.write("编号 年份 电影名称 票房金额\n")  # 写入标题
    for tr in trs:
        num = tr.xpath("./td[1]/text()")[0].strip("[]")
        year = tr.xpath("./td[2]//text()")[0].strip("[]")
        name = tr.xpath("./td[3]//text()")
        name = "".join(name).strip("[]' ")
        money = tr.xpath("./td[4]/text()")[0].strip("[]")
        f.write(num + ' ')
        f.write(year + ' ')
        f.write(name + ' ')
        f.write(money + '\n')
    time.sleep(1)