import requests
from lxml import etree
import os
import aiohttp
import aiofiles
import asyncio
headers={
'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
}
#存储卷名，章节名，相应的href,结果存储到result中
def get_chapt_info(url):
    resp = requests.get(url, headers=headers)
    resp.encoding = 'utf-8'
    page_source=resp.text
    tree = etree.HTML(page_source)
    result=[]
    divs=tree.xpath("//div[@class='mulu']")
    for div in divs:
        trs=div.xpath(".//table/tr")
        juan_name=trs[0].xpath(".//a/text()")
        juan_name="".join(juan_name).strip().replace("：","_")
        for tr in trs[1:]:
            tds=tr.xpath("./td")
            for td in tds:
                txt=td.xpath(".//text()")
                href=td.xpath(".//@href")
                txt="".join(txt).replace(" ","").strip()
                href="".join(href)
                dic={
                    "chapter_name":txt,
                    "chapter_url":href,
                    "juan_name":juan_name
                }
                result.append(dic)
    return result
#下载每一个链接的详细内容，类似于requests，然后数据集，得到源码，解析：类下面的p标签里的文本，然后存储
async def download_one(url,file_path):
    print("我要下载文章了",file_path)
    async with aiohttp.ClientSession() as session:
        async with session.get(url,headers=headers) as resp:
            page_source= await resp.text(encoding='utf-8')
            tree=etree.HTML(page_source)
            content=tree.xpath("//div[@class='content']/p//text()")
            content="".join(content).replace("\n","").replace("\r","").replace(" ","").strip()
            async with aiofiles.open(file_path,mode='w',encoding='utf-8') as f:
                await f.write(content)
    print("恭喜你下载了一篇文章")
#得到循环事件集，放在tasks里，挂起
async def download_chapter(chapter_list):
    tasks=[]
    i=1
    for chapter in chapter_list:
        juan=chapter['juan_name']
        name=chapter['chapter_name']
        url=chapter['chapter_url']
        if not os.path.exists(juan):
            os.makedirs(juan)
        file_path=f"{juan}/{str(i)+'_'+name}.txt"
        t=asyncio.create_task(download_one(url,file_path))
        tasks.append(t)
        i+=1
    await asyncio.wait(tasks)
#run一下，跑起来
def main():
    url="https://www.mingchaonaxieshier.com/"
    chapter_list=get_chapt_info(url)
    event_loop=asyncio.get_event_loop()
    event_loop.run_until_complete(download_chapter(chapter_list))
if __name__ == '__main__':
    main()