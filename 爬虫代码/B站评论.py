# coding=utf-8
import requests
import re
import os
import time
import json

"""
获取评论：
1.bv号在视频url中复制
"""
cookie = "buvid3=9F603FB0-26C6-E825-7DC3-3823AC572B5874239infoc; b_nut=1683879474; i-wanna-go-back=-1; _uuid=81EA39A4-EEDF-1082B-476E-A910985224BB180395infoc; FEED_LIVE_VERSION=V8; home_feed_column=4; browser_resolution=1239-597; buvid4=C73C9F6E-313B-1F70-4404-6764D497221075760-023051216-xxaMMcKA84S04jPdABdHCA%3D%3D; buvid_fp=ea010551d548f1abb74666df09cfce18; header_theme_version=CLOSE; SESSDATA=6f49adf0%2C1699760670%2Cbcc6e%2A51; bili_jct=d1e39a570539a86702b5218e695fe193; DedeUserID=266937203; DedeUserID__ckMd5=e3c17ddef304bf86; sid=5mninxdf; bp_video_offset_266937203=796156799403163600; CURRENT_FNVAL=4048; rpdid=|(YuJ)|ku)m0JuY)Rk|)Ymk; b_ut=5; b_lsid=2DE10466C_18822B938C3; bsource=search_baidu; innersign=1; PVID=3"
user_agent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
file_dir = "./"
file_name = 'greatest_works_comments'  # 评论保存的文件名，爬取其他视频时修改文件名
comment_mode = 3
bv = 'BV1iT411p7mK'  # 视频BV号，爬取其他视频时更换BV号即可
url = 'https://www.bilibili.com/video/' + bv
headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-cache',
    'cookie': cookie,
    'pragma': 'no-cache',
    'referer': 'https://www.bilibili.com/',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-dest': 'script',
    'sec-fetch-mode': 'no-cors',
    'sec-fetch-site': 'same-site',
    'user-agent': user_agent,
}


def check_video():
    """访问av/BV对应的视频,查看是否存在"""
    response = requests.get(url, headers=headers)
    if response.status_code == 404 or """<div class="error-text">啊叻？视频不见了？</div>""" in response.text:
        print('视频不存在!')
        return 0
    else:
        return 1


def bv_to_av(bv):
    """将BV号转化为av号,如果已经是av号,直接返回数字部分"""
    if bv[:2] == 'av':
        return bv[2:]
    bv = list(bv[2:])
    keys = {'1': 13, '2': 12, '3': 46, '4': 31, '5': 43, '6': 18, '7': 40, '8': 28, '9': 5,
            'A': 54, 'B': 20, 'C': 15, 'D': 8, 'E': 39, 'F': 57, 'G': 45, 'H': 36, 'J': 38, 'K': 51, 'L': 42, 'M': 49,
            'N': 52, 'P': 53, 'Q': 7, 'R': 4, 'S': 9, 'T': 50, 'U': 10, 'V': 44, 'W': 34, 'X': 6, 'Y': 25, 'Z': 1,
            'a': 26, 'b': 29, 'c': 56, 'd': 3, 'e': 24, 'f': 0, 'g': 47, 'h': 27, 'i': 22, 'j': 41, 'k': 16, 'm': 11,
            'n': 37, 'o': 2, 'p': 35, 'q': 21, 'r': 17, 's': 33, 't': 30, 'u': 48, 'v': 23, 'w': 55, 'x': 32, 'y': 14,
            'z': 19}
    for i in range(len(bv)):
        bv[i] = keys[bv[i]]
    bv[0] *= (58 ** 6)
    bv[1] *= (58 ** 2)
    bv[2] *= (58 ** 4)
    bv[3] *= (58 ** 8)
    bv[4] *= (58 ** 5)
    bv[5] *= (58 ** 9)
    bv[6] *= (58 ** 3)
    bv[7] *= (58 ** 7)
    bv[8] *= 58
    return str((sum(bv) - 100618342136696320) ^ 177451812)


def get_comment_level_father(bv, nexts=0, mode=3):
    """获取父评论"""
    headers['referer'] = url
    r_url = 'https://api.bilibili.com/x/v2/reply/main'
    av = bv_to_av(bv)
    data = {
        'jsonp': 'jsonp',
        'next': nexts,
        'type': '1',
        'oid': av,
        'mode': mode,
        'plat': '1',
        '_': str(time.time() * 1000)[:13],
    }
    response = requests.get(r_url, headers=headers, params=data)
    response.encoding = 'utf-8'
    if 'code' in response.text:
        c_json = json.loads(response.text)
    else:
        c_json = {'code': -1}
    if c_json['code'] != 0:
        print('json error!')
        print(response.status_code)
        print(response.text)
        return 0
    return c_json


def get_comment_level_son(bv, fpid, pn=1):
    """获取子评论 bv: 全bv号  fpid: 父评论的id  pn: 子评论的页码"""
    headers['referer'] = url
    r_url = 'https://api.bilibili.com/x/v2/reply/reply'
    av = bv_to_av(bv)
    data = {
        'jsonp': 'jsonp',
        'pn': pn,
        'type': '1',
        'oid': av,
        'ps': '10',
        'root': fpid,
        '_': str(time.time()*1000)[:13],
    }
    response = requests.get(r_url, headers=headers, params=data)
    response.encoding = 'utf-8'
    if 'code' in response.text:
        cr_json = json.loads(response.text)
    else:
        cr_json = {'code': -1}
    if cr_json['code'] != 0:
        print('error!')
        print(response.status_code)
        print(response.text)
        return 0
    return cr_json


def parse_comment_son(bv, fpid):
    """解析子评论"""
    cr_json = get_comment_level_son(bv, fpid)['data']
    count = cr_json['page']['count']
    csv_temp = ''
    for pn in range(1, count//10+2):
        print('p%d %d  ' % (pn, count), end='\r')
        cr_json = get_comment_level_son(bv, fpid, pn=pn)['data']
        cr_list = cr_json['replies']
        if cr_list:
            for i in range(len(cr_list)):
                comment_temp = {
                    'floor': '',
                    'time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(cr_list[i]['ctime'])),  # 时间
                    'like': cr_list[i]['like'],  # 赞数
                    'uid': cr_list[i]['member']['mid'],  # uid
                    'name': cr_list[i]['member']['uname'],  # 用户名
                    'sex': cr_list[i]['member']['sex'],  # 性别
                    'content': '"' + cr_list[i]['content']['message'] + '"',  # 子评论
                }
                for i in comment_temp:
                    csv_temp += str(comment_temp[i]) + ','
                csv_temp += '\n'
        time.sleep(0.5)
    return csv_temp


def parse_comment_father(bv):
    """解析父评论"""
    c_json = get_comment_level_father(bv, mode=comment_mode)
    # 解析评论总数
    if c_json:
        try:
            count_all = c_json['data']['cursor']['all_count']
            print('comments:%d' % count_all)
        except KeyError:
            print('KeyError, 该视频可能没有评论!')
            return '0', '2'
    else:
        print('json错误')
        return '1', '0'
    # 获取置顶评论
    if c_json['data']['top']['upper']:
        comment_top = c_json['data']['top']['upper']
        csv = '%s,%s,%s,%s,%s,%s,%s\n' % ('0', 	# 楼层
        time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(comment_top['ctime'])),  # 时间
        comment_top['like'],  # 赞数
        comment_top['member']['mid'],  # uid
        comment_top['member']['uname'],  # 用户名
        comment_top['member']['sex'],  # 性别
        '"' + comment_top['content']['message'] + '"')  # 评论内容
        if comment_top['rcount'] or ('replies' in comment_top and comment_top['replies']):
            fpid = comment_top['rpid']  # 父评论的fpid
            csv += parse_comment_son(bv, fpid)
    else:
        csv = ''
    print('获取置顶评论成功')
    # 开始序号
    count_next = 0
    all_json = ''
    for page in range(count_all//20 + 1):
        print('page:%d' % (page+1))
        c_json = get_comment_level_father(bv, count_next, mode=comment_mode)
        all_json += str(c_json) + '\n'
        if not c_json:
            return 1
        count_next = c_json['data']['cursor']['next']  # 下一个的序号
        c_list = c_json['data']['replies']
        # 有评论,就进入下面的循环保存
        if c_list:
            for i in range(len(c_list)):
                comment_temp = {
                    'floor': '0',  # 楼层
                    'time':  time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(c_list[i]['ctime'])),  # 时间
                    'like': c_list[i]['like'],  # 赞数
                    'uid': c_list[i]['member']['mid'],  # uid
                    'name': c_list[i]['member']['uname'],  # 用户名
                    'sex': c_list[i]['member']['sex'],  # 性别
                    'content': '"' + c_list[i]['content']['message'] + '"',	 # 评论内容
                }
                # 若有子评论,记录fpid,爬取子评论
                replies = False
                if c_list[i]['rcount'] or ('replies' in c_list[i] and c_list[i]['replies']):
                    replies = True
                    fpid = c_list[i]['rpid']
                for i in comment_temp:
                    csv += str(comment_temp[i]) + ','
                csv += '\n'
                # 如果有回复评论,爬取子评论
                if replies:
                    csv += parse_comment_son(bv, fpid)
            if c_json['data']['cursor']['is_end']:
                print('读取完毕,结束')
                break
            print('获取地{}页评论成功'.format(page+1))
        else:
            print('评论为空,结束!')
            break
        time.sleep(0.5)
    return csv, all_json


def main():
    if not check_video():
        return
    dir_csv = file_name + '.csv'
    if not os.path.exists(dir_csv):
        with open(dir_csv, 'w', encoding='utf-8-sig') as fp:
            fp.write('楼层,时间,点赞数,uid,用户名,性别,评论内容\n')
    csv, all_json = parse_comment_father(bv)
    # 保存评论csv
    while True:
        try:
            with open(dir_csv, 'a', encoding='utf-8') as fp:
                fp.write(csv)
            break
        except PermissionError:
            input('文件被占用!!! (关闭占用的程序后,回车重试)')


if __name__ == "__main__":
    main()
    # print(get_comment_level_father(bv, 0, mode=comment_mode))
    # parse_comment_father(bv)
    # print(bv_to_av(bv))
    # print(check_video())
    print('=== over! ===')
