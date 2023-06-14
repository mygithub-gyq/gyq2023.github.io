import requests
from lxml import etree
import pymongo

headers={
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
}
def page_source(url):
    resp=requests.get(url,headers=headers)
    return resp.text

def jx_data(pgsource):
    tree=etree.HTML(pgsource)
    result=[]
    li_list=tree.xpath("//*[@class='sellListContent']/li")
    for li in li_list:
        title=li.xpath(".//*[@class='title']/a/text()")
        if not title:
            continue
        title=title[0]
        poistion=li.xpath(".//*[@class='positionInfo']//text()")
        poistion="".join(poistion).strip().replace(" ","")
        hourseinfo=li.xpath(".//*[@class='houseInfo']//text()")[0].split("|")
        hourseinfo="".join(hourseinfo)
        totolprice=li.xpath(".//*[@class='priceInfo']/div[1]//text()")
        totolprice="".join(totolprice)
        price=li.xpath(".//*[@class='priceInfo']/div[2]//text()")[0]
        dic={
            "title":title,
            "totolprice":totolprice,
            "price":price,
            "poistion":poistion,
            "hourseinfo":hourseinfo
        }
        result.append(dic)
    return result

def save_data(data):
    conn=pymongo.MongoClient(host="localhost",port=27017)
    db=conn['cool']
    db.yunsir.insert_many(data)
    conn.close()


def main():
    for i in range(1,101):
        print(f"正在爬取第{i}页")
        url=f"https://bj.lianjia.com/ershoufang/pg{i}/"
        pgsource=page_source(url)
        data=jx_data(pgsource)
        save_data(data)

if __name__ == '__main__':
    main()