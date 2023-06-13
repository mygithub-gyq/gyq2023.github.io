import requests
import re
import time

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36"
}

resp = requests.get("http://www.animationcritics.com/chinese_aniamtion.html", headers=headers)

obj = re.compile(r'''<li style="margin-bottom:10px;">.*?articleid="\d+"'''+
'.*?href="(?P<href>.*?)" title="(?P<title>.*?)">.*?</a>', re.S)

org_obj = re.compile(r'<span class="org_txt">来源:</span>(?P<org>.*?)</span>', re.S)
aut_obj = re.compile(r'<span class="aut_txt">作者:</span>(?P<aut>.*?)</span>', re.S)
pub_obj = re.compile(r'<span class="pub_txt">发布时间: </span>(?P<pub>.*?)</span>', re.S)

section_obj = re.compile(r"<section.*?>(?P<content>.*?)</section>")
section1_obj=re.compile(r'<p data-track.*?>(?P<content1>.*?)</p>',re.S)

page_source = resp.text
results = obj.finditer(page_source)
for item in results:
    href = item.group("href")
    title = item.group("title")

    child_resp = requests.get(href, headers=headers)
    child_page_source = child_resp.text

    org_result = org_obj.search(child_page_source)
    if not org_result:
        org = ""
    else:
        org = org_result.group("org")

    aut_result = aut_obj.search(child_page_source)
    if not aut_result:
        aut = ""
    else:
        aut = aut_result.group("aut")

    pub_result = pub_obj.search(child_page_source)
    if not pub_result:
        pub = ""
    else:
        pub = pub_result.group("pub")

    sections = []
    section_result = section_obj.finditer(child_page_source, re.S)
    section1_result= section1_obj.finditer(child_page_source, re.S)
    section_result=section_result+section1_result
    for item in section_result:
        if item:
           content = item.group('content')
           sections.append(content.strip())
        else:
           content1=item.group('content1')
           sections.append(content1.strip())

    print(title, org, aut, pub)
    print("===========================================================================")
    section = re.sub(r"<.*?>", "", "".join(sections))  # 正则替换.参数1:正则, 参数2:替换后内容, 参数3:源字符串
    print(section)
    time.sleep(2)