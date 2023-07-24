import requests
import json
from Crypto.Cipher import AES
from base64 import b64encode

url = "https://music.163.com/weapi/comment/resource/comments/get?csrf_token="

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
}

e = "010001"
f = "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7"
g = "0CoJUm6Qyw8W8jud"
i = "34M1tvb0SyjjEZ6m"


def to_16(data):
    pad = 16 - len(data) % 16
    data += chr(pad) * pad
    return data


def get_encSecKey():
    return "27fb8cfd7426c100f94e8325f91ec2b2c2df037b7472ff76ac02f8f70055179662b2d3b565189ed9f5f04aabe71f3bd37f8f2262b70650c65002a1bb0ed32ff8b8a9406bf5116cb2c2c3bb754e2f3610cf9f36d234fa78104a63e5f7a4184dfb409308754c1cf12740b584a142e02b46dba875232e864125392d5101ed967f28"


def get_params(data):
    first = enc_params(data, g)
    second = enc_params(first, i)
    return second


def enc_params(data, key):
    iv = "0102030405060708"
    data = to_16(data)
    aes = AES.new(key=key.encode("utf-8"), IV=iv.encode("utf-8"), mode=AES.MODE_CBC)
    bs = aes.encrypt(data.encode("utf-8"))
    return str(b64encode(bs), "utf-8")


f = open("评论1.txt", mode="w", encoding="utf-8")

for page in range(1, 2):
    print(f"正在抓取第{page}页")
    data = {
        "csrf_token": "",
        "cursor": "-1",
        "offset": "200",
        "orderType": "1",
        "pageNo": str(page),
        "pageSize": "20",
        "rid": "R_SO_4_29814898",
        "threadId": "R_SO_4_29814898"
    }

    resp = requests.post(url=url, data={
        "params": get_params(json.dumps(data)),
        "encSecKey": get_encSecKey()
    })
    dic = resp.json()
    datas=dic['data']['comments']
    for item in datas:
        nickname = item['user']['nickname']
        userId = str(item['user']['userId'])
        ip = item['ipLocation']['location']
        content = item['content']
        f.write(nickname)
        f.write(",")
        f.write(userId)
        f.write(",")
        f.write(content)
        f.write(",")
        f.write(ip)
        f.write("\n")
