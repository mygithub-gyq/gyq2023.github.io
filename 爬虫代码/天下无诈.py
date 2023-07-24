#导包
import requests
from lxml import etree
from concurrent.futures import ThreadPoolExecutor
#UA伪装
headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
}
#拿到页面源代码
def get_page_source(url):
    resp=requests.get(url=url,headers=headers)
    return resp.text
#解析数据,提取标题和段落文字,将结果放在列表中
def jiexi(page):
    result=[]
    tree=etree.HTML(page)
    title=tree.xpath("//*[@class='epi_t']//text()")
    title=title[0].strip()
    ps=tree.xpath("//*[@class='clear epi_c']/p")
    result.append(title)
    for p in ps:
        content=p.xpath(".//text()")
        content=content[0]
        content=content.strip().replace("', '","")
        result.append(content)
    return result
#拿到url,url变化比较特殊,0-1,0-2,0-3,1-4,1-5,1-6,2-7,...
def get_url():
    urls=[]
    for count in range(14):
        for page in range(count * 3 + 1, count * 3 + 4):
            if page <= 40:
                url=f"https://www.tvmao.com/drama/XmJtJmBi/episode/{count}-{page}"
                urls.append(url)
    return urls
#将结果写入txt文档
def download_one(url,f):
    pgsource=get_page_source(url)
    data=jiexi(pgsource)
    for item in data:
        f.write(item)
        f.write("\n")
#主函数,开启了多线程
def main():
    f = open("天下无诈.txt", mode="w", encoding="utf-8")
    urls=get_url()
    with ThreadPoolExecutor(10) as t:
        for url in urls:
            t.submit(download_one, url, f)
#跑一下主函数
if __name__ == '__main__':
    main()

