import requests
import binascii  # 16进制字符串变成字节 , 把字节变成16进制字符串
import json
from Crypto.Cipher import DES

def func(a,b,c):
    if b==0:
        return a[c:]
    r=a[:b]
    r+=a[b+c:]
    return r

def shell(data):
    yuan = data
    a = int(data[-1], 16) + 9  # 9
    b = int(data[a], 16)  # 0
    data = func(data, a, 1)
    a = data[b: b + 8]
    data = func(data, b, 8)

    # 16进制的字符串, 需要还原成字节
    try:
        # bs = binascii.a2b_hex(data)
        if data[-1] == '0':  # 前端和python的差异
            data = data[:-1]
        bs = bytes.fromhex(data)
    except Exception as e:
        print(yuan)
    # 2b  to bytes   a2b
    # b2  bytes to   b2a

    # DES解密
    key = a.encode('utf-8')
    bs = DES_DECRYPT(bs, key)
    s = bs.decode("utf-8")

    s = s[:s.rindex("}")+1]
    dic = json.loads(s)
    return dic


def DES_DECRYPT(data, key):
    des = DES.new(key=key, mode=DES.MODE_ECB)
    bs = des.decrypt(data)
    return bs


if __name__ == '__main__':
    for year in range(2008,2024):
        f = open(f"dianying{year}.txt", mode="w", encoding="utf-8")
        url="https://www.endata.com.cn/API/GetData.ashx"
        #请求方式,post
        data={
            "year": year,
            "MethodName":"BoxOffice_GetYearInfoData"
        }
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
        }
        resp=requests.post(url,headers=headers,data=data)
        result=shell(resp.text)
        datas=result['Data']['Table']
        for item in datas:
            moviename=item['MovieName']
            type=item['Genre_Main']
            totalprice=item['BoxOffice']
            averageprice=item['AvgPrice']
            avdpeople=item['AvgPeoPle']
            area=item['Area']
            date=item['ReleaseTime']
            f.write(moviename)
            f.write(",")
            if type:
                f.write(type)
            else:
                f.write(" ")
            f.write(",")
            if totalprice:
                f.write(str(totalprice))
            else:
                f.write(" ")
            f.write(",")
            f.write(str(averageprice))
            f.write(",")
            f.write(str(avdpeople))
            f.write(",")
            if area:
                f.write(area)
            else:
                f.write(" ")
            f.write(",")
            if date:
                f.write(date)
            else:
                f.write(" ")
            f.write("\n")