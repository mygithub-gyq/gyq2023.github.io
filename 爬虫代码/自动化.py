from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By

from selenium.webdriver.common.action_chains import ActionChains

import time
import base64
import requests
import json

def base64_api(uname, pwd, img, typeid):
    with open(img, 'rb') as f:
        base64_data = base64.b64encode(f.read())
        b64 = base64_data.decode()
    data = {"username": uname, "password": pwd, "typeid": typeid, "image": b64}
    result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
    if result['success']:
        return result["data"]["result"]
    else:
        return result["message"]


web = Chrome()
web.get("https://www.bilibili.com/")

web.maximize_window()
web.implicitly_wait(10)
web.find_element(By.XPATH, "//*[@class='header-login-entry']").click()
web.find_element(By.XPATH, "//*[@class='form__item']/input").send_keys("18309333971")
web.find_element(By.XPATH, "//*[@class='form__item'][2]/input").send_keys("a201314gyq")

web.find_element(By.XPATH, "/html/body/div[3]/div/div[4]/div[2]/div[2]/div[2]").click()
time.sleep(2)
tu = web.find_element(By.XPATH, "//*[@class='geetest_holder geetest_silver']")
tu.screenshot("tu.png")
result = base64_api("q6035945", "q6035945", "tu.png", 27)
print(result)
rs = result.split("|")
for r in rs:
    x, y = r.split(",")
    x = int(x)
    y = int(y)

    ac = ActionChains(web)
    ac.move_to_element_with_offset(tu, xoffset=x, yoffset=y)
    ac.click()
    ac.perform()
    time.sleep(1)

time.sleep(3)
web.find_element(By.XPATH, "//*[@class='geetest_commit_tip']").click()
