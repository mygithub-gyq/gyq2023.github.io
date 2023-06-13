import requests
from lxml import etree
import time
from multiprocessing import Queue
from multiprocessing import Process
from concurrent.futures import ThreadPoolExecutor

def get_img_url(q):
    for page in range(1, 5):
        url = f"https://www.pkdoutu.com/photo/list/?page={page}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
        }
        resp = requests.get(url, headers=headers)
        tree = etree.HTML(resp.text)
        img_urls = tree.xpath("//li[@class='list-group-item']//img/@data-original")
        for img_url in img_urls:
            q.put(img_url)
    q.put("滚蛋吧.没了")

def img_process(q):
    with ThreadPoolExecutor(10) as t:
        while 1:
            img_url = q.get()
            if img_url == '滚蛋吧.没了':
                break
            t.submit(download_img, img_url)
            print("已下完一张了")

def download_img(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
    }
    resp = requests.get(url, headers=headers)
    # 文件名称
    file_name = url.split("/")[-1]
    with open("img15\\" + file_name, mode="wb") as f:
        f.write(resp.content)


if __name__ == '__main__':
    s1 = time.time()
    q = Queue()
    p1 = Process(target=get_img_url, args=(q,))
    p2 = Process(target=img_process, args=(q,))
    p1.start()
    p2.start()
    p1.join()
    p2.join()
    s2 = time.time()
    print(s2 - s1)