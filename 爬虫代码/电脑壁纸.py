import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
for page in range(1,6):
    print(f"正在爬取第{page}页")
    url = f"https://desk.zol.com.cn/pc/fengjing/{page}.html"
    headers = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36"
    }
    resp = requests.get(url, headers=headers)
    resp.encoding = 'gbk'
    main_soup = BeautifulSoup(resp.text, "html.parser")
    a_list = main_soup.find("ul", attrs={"class": "pic-list2 clearfix"}).find_all("a")
    for a in a_list:
        href = a.get("href")
        if href.endswith(".exe"):
            continue
        href=urljoin(url,href)
        child_resp = requests.get(href, headers=headers)
        child_resp.encoding = 'gbk'
        child_soup = BeautifulSoup(child_resp.text, "html.parser")
        img_list=child_soup.find("ul",attrs={"id": "showImg"}).find_all("img")
        for Img in img_list:
            img_src = Img.get("src")
            if not img_src:
                img_src = Img.get("srcs")
            img_resp = requests.get(url=img_src, headers=headers)
            file_name = img_src.split("/")[-1]
            with open("img14\\"+file_name, mode="wb") as f:
                f.write(img_resp.content)
            time.sleep(1)