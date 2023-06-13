# RSA加密解密以及案例



非对称加密:  加密和解密的时候用的是不同的秘钥.

一组秘钥:

 	1. 公钥, 公开的秘钥,  对数据进行加密
 	2. 私钥, 私密的秘钥, 对数据进行解密



非对称加密的逻辑:

 1. 先在服务器端. 生成一组秘钥,  公钥, 私钥

 2. 把公钥放出去. 

 3. 客户端在拿到公钥之后. 可以使用公钥对数据进行加密.

 4. 把数据传输给服务器

 5. 服务器需要对数据进行解密. 私钥能解密

    

## 一.非对称加密

非对称加密. 加密和解密的秘钥不是同一个秘钥. 这里需要两把钥匙. 一个公钥, 一个私钥.  公钥发送给客户端. 发送端用公钥对数据进行加密. 再发送给接收端, 接收端使用私钥来对数据解密. 由于私钥只存放在接受端这边. 所以即使数据被截获了. 也是无法进行解密的. 

常见的非对称加密算法: RSA, DSA等等, 我们就介绍一个. RSA加密, 也是最常见的一种加密方案

###  1.1 RSA加密解密

#### 1.1.1 创建公钥和私钥

```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from Crypto import Random
import base64

# 随机
gen_random = Random.new


# 生成秘钥
rsakey = RSA.generate(1024)
with open("rsa.public.pem", mode="wb") as f:
    f.write(rsakey.publickey().exportKey())

with open("rsa.private.pem", mode="wb") as f:
    f.write(rsakey.exportKey())
```



#### 1.1.2 加密

```python
# 加密
data = "我要吃饭了"
with open("rsa.public.pem", mode="r") as f:
    pk = f.read()
    rsa_pk = RSA.importKey(pk)
    rsa = PKCS1_v1_5.new(rsa_pk)

    result = rsa.encrypt(data.encode("utf-8"))
    # 处理成b64方便传输
    b64_result = base64.b64encode(result).decode("utf-8")
    print(b64_result)
```



#### 1.1.3 解密

```python
data = "e/spTGg3roda+iqLK4e2bckNMSgXSNosOVLtWN+ArgaIDgYONPIU9i0rIeTj0ywwXnTIPU734EIoKRFQsLmPpJK4Htte+QlcgRFbuj/hCW1uWiB3mCbyU3ZHKo/Y9UjYMuMfk+H6m8OWHtr+tWjiinMNURQpxbsTiT/1cfifWo4="
# 解密
with open("rsa.private.pem", mode="r") as f:
    prikey = f.read()
    rsa_pk = RSA.importKey(prikey)
    rsa = PKCS1_v1_5.new(rsa_pk)
    result = rsa.decrypt(base64.b64decode(data), None)
    print(result.decode("utf-8"))
```



## 二. 中大网校登录案例

![image-20210909152131858](image-20210909152131858.png)

<img src="image-20210909152228948.png" alt="image-20210909152228948" style="zoom:50%;" />



<img src="image-20210909152623553.png" alt="image-20210909152623553" style="zoom:50%;" />

接下来开始逆向试试吧.  我们从登录位置开始. 第一个事儿要搞定的. 是那个烦人的验证码....

![image-20210909170718567](image-20210909170718567.png)

但是这个请求是需要cookie的, 想想也应该如此. 因为服务器要知道这张图片给哪个客户端使用了. 就必须借助cookie来判别不同的客户端. 

![image-20210909170816652](image-20210909170816652.png)

所以. 整个流程应该是: 

1. 进入登录页, 加载到cookie
2. 访问验证码url, 获取到验证码. 并完成破解
3. 访问getTime api. 虽然不知道它用来做什么. 但是在后续的密码加密时是需要这个api返回的data的
4. 准备好用户名和密码. 对密码进行加密
5. 发送登录请求. 
6. 得到的结果处理(加入到cookie中. )



代码:

```python
import requests
import json
import time
from Crypto.Cipher import PKCS1_v1_5
from Crypto.PublicKey import RSA
import base64

def base64_api(img, uname='q6035945', pwd='q6035945', typeid=3):
    data = {"username": uname, "password": pwd, "typeid": typeid, "image": img}
    result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
    if result['success']:
        return result["data"]["result"]
    else:
        return result["message"]


def enc(s):
    key = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA5Zq6ZdH/RMSvC8WKhp5gj6Ue4Lqjo0Q2PnyGbSkTlYku0HtVzbh3S9F9oHbxeO55E8tEEQ5wj/+52VMLavcuwkDypG66N6c1z0Fo2HgxV3e0tqt1wyNtmbwg7ruIYmFM+dErIpTiLRDvOy+0vgPcBVDfSUHwUSgUtIkyC47UNQIDAQAB"
    rsa_key = RSA.importKey(base64.b64decode(key))
    rsa_new = PKCS1_v1_5.new(rsa_key)
    mi = rsa_new.encrypt(s.encode("utf-8"))
    return base64.b64encode(mi).decode("utf-8")



session = requests.session()
session.headers = {
    'Referer' : "https://user.wangxiao.cn/login?url=http%3A%2F%2Fks.wangxiao.cn%2F",
    "Content-Type": "application/json;charset=UTF-8",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
}

login_url = "https://user.wangxiao.cn/login?url=http%3A%2F%2Fks.wangxiao.cn%2F"

# 进入登录页面(目的: 加载到第一波cookie)
session.get(login_url)
time.sleep(1)

resp = session.post("https://user.wangxiao.cn/apis//common/getImageCaptcha")

dic = resp.json()
operation_date = dic['operation_date']
img_data = dic['data'].split(",")[1]
verify_code = base64_api(img_data)

# 走登录流程
# 1.getTime

get_time_resp = session.post("https://user.wangxiao.cn/apis/common/getTime")
get_time_dic = get_time_resp.json()
get_time = get_time_dic['data']

# 2. 登录
login_verify_url = "https://user.wangxiao.cn/apis/login/passwordLogin"

username = "你的账号"
password = "你的密码"

data = {
    "imageCaptchaCode": verify_code,
    "password": enc(password+get_time),
    "userName": username,
}


resp = session.post(login_verify_url, data=json.dumps(data))

dic = resp.json()['data']
"""
		window.syncLogin = function(e, o) {
			// util.js
            var n = {
                path: "/",
                domain: "wangxiao.cn"
            };
            o && (n.expires = o),
            $.cookie("UserCookieName", e.userName, n),
            $.cookie("OldUsername2", e.userNameCookies, n),
            $.cookie("OldUsername", e.userNameCookies, n),
            $.cookie("OldPassword", e.passwordCookies, n),
            $.cookie("UserCookieName_", e.userName, n),
            $.cookie("OldUsername2_", e.userNameCookies, n),
            $.cookie("OldUsername_", e.userNameCookies, n),
            $.cookie("OldPassword_", e.passwordCookies, n),
            e.sign && (n.expires = 365,
            $.cookie(e.userName + "_exam", e.sign, n))
            //index.js
            keepOurCookie12("autoLogin",null) ;
            keepOurCookie12("userInfo",JSON.stringify(res.data)) ;
            keepOurCookie12("token",res.data.token) ;
        }
"""

session.cookies['UserCookieName'] = dic['userName']
session.cookies['OldUsername2'] = dic['userNameCookies']
session.cookies['OldUsername'] = dic['userNameCookies']
session.cookies['OldPassword'] = dic['passwordCookies']
session.cookies['UserCookieName_'] = dic['userName']
session.cookies['OldUsername2_'] = dic['userNameCookies']
session.cookies['OldUsername_'] = dic['userNameCookies']
session.cookies['OldPassword_'] = dic['passwordCookies']
session.cookies['autoLogin'] = "null"
session.cookies['userInfo'] = json.dumps(dic)
session.cookies['token'] = dic['token']


data = {
    "examPointType": "",
    "practiceType": "2",
    "questionType": "7",
    "sign": "jz1",
    "subsign": "8cc80ffb9a4a5c114953",
    "top": "30"
}
resp = session.post('http://ks.wangxiao.cn/practice/listQuestions', data=json.dumps(data))
print(resp.text)



```

