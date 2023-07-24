import requests
import re
from urllib.parse import urljoin
import os  # 执行cmd/控制台上的命令
from Crypto.Cipher import AES
import asyncio
import aiohttp
import aiofiles

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36"
}

def download_m3u8(url):
    resp = requests.get(url, headers=headers)
    with open("first.m3u8", mode="w", encoding="utf-8") as f:
        f.write(resp.text)

async def download_one(url, sem):
    async with sem:  # 使用信号量控制访问频率
        file_name = url.split("/")[-1]
        file_path = "./解密前/"+file_name
        print(file_name, "开始工作了!")
        for i in range(10):  # 重试10次
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers) as resp:
                        content = await resp.content.read()
                        # 写入文件
                        async with aiofiles.open(file_path, mode="wb") as f:
                            await f.write(content)
                print(file_name, "下载完成!")
                break
            except Exception as e:
                print(file_name, "出错了, 马上重试", e)   # 给个提示. 看到错误信息


async def download_all_videos():
    # 信号量, 用来控制协程的并发量
    sem = asyncio.Semaphore(40)
    # 1. 读取文件
    tasks = []
    with open("first.m3u8", mode="r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                continue
            line = line.strip()  # 不写. 你会得到意想不到的收获
            # 此时line就是下载地址
            # 2. 创建任务
            t = asyncio.create_task(download_one(line, sem))
            tasks.append(t)
    # 3. 统一等待
    await asyncio.wait(tasks)


def get_key():
    url="https://hnzy.bfvvs.com/play/penr3r7e/"
    with open("first.m3u8", mode="r", encoding="utf-8") as f:
        file_content = f.read()  # 读取到所有内容
        obj = re.compile(r'URI="(?P<key_url>.*?)"')
        key_url = obj.search(file_content).group("key_url")
        key_url=urljoin(url,key_url)
        resp = requests.get(key_url, headers=headers)  # 发请求, 拿秘钥
        return resp.content  # 直接拿字节. 为了解密的时候. 直接丢进去就可以了.


async def desc_one(file_path, key):
    file_name = file_path.split("/")[-1]
    new_file_path = "./解密后/" + file_name
    # 解密
    async with aiofiles.open(file_path, mode="rb") as f1,\
            aiofiles.open(new_file_path, mode="wb") as f2:
        content = await f1.read()
        # 解密
        # 固定逻辑, 创建一个加密器
        aes = AES.new(key=key, mode=AES.MODE_CBC, IV=b"0000000000000000")
        new_content = aes.decrypt(content)
        await f2.write(new_content)  # 写入新文件
    print(new_file_path, "解密成功")


# 解密的协程逻辑
# 读M3U8文件. 拿到文件名称和路径
# 每个ts文件一个任务
# 在每个任务中. 解密即可
async def desc_all(key):
    tasks = []
    with open("first.m3u8", mode="r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                continue
            line = line.strip()
            file_name = line.split("/")[-1]
            file_path = "./解密前/"+file_name
            # 创建任务. 去解密
            t = asyncio.create_task(desc_one(file_path, key))
            tasks.append(t)
    await asyncio.wait(tasks)


def merge():
    file_list = []
    with open("first.m3u8", mode="r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                continue
            line = line.strip()
            file_name = line.split("/")[-1]
            file_list.append(file_name)

    # 进入到文件夹内
    os.chdir("./解密后")  # 更换工作目录
    # file_list  所有文件名称

    # 分段合并
    n = 1
    temp = []  # [a.ts, b.ts, c.ts]  =?=>  a.ts+b.ts+c.ts
    for i in range(len(file_list)):
        # 每 20 个合并一次
        file_name = file_list[i]
        temp.append(file_name)
        if i != 0 and i % 20 == 0:  # 20和一次(第一次合并有21个)
            # 可以合并一次了
            cmd = f"copy /b {'+'.join(temp)} {n}.ts"
            r = os.popen(cmd)
            print(r.read())
            temp = []  # 新列表
            n = n + 1
    # 需要把剩余的ts进行合并
    cmd = f"copy /b {'+'.join(temp)} {n}.ts"
    r = os.popen(cmd)
    print(r.read())
    n = n + 1

    # 第二次大合并  1.ts + 2.ts + 3.ts xxx.mp4
    last_temp = []
    for i in range(1, n):
        last_temp.append(f"{i}.ts")
    # 最后一次合并
    cmd = f"copy /b {'+'.join(last_temp)} 蜘蛛侠英雄归来.mp4"
    r = os.popen(cmd)
    print(r.read())
    # 回来
    os.chdir("../")  # ../ 上层文件夹

def main():

    #m3u8_url="https://hnzy.bfvvs.com/play/penr3r7e/index.m3u8"
    #download_m3u8(m3u8_url)
    #print(m3u8_url)
    #event_loop = asyncio.get_event_loop()
    #event_loop.run_until_complete(download_all_videos())
    #key = get_key()
    #print(key)
    #event_loop = asyncio.get_event_loop()
    #event_loop.run_until_complete(desc_all(key))
    #print("全部完成")
    merge()

if __name__ == '__main__':
    main()