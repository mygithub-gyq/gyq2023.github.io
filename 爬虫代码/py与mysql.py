import pymysql
from pymysql.cursors import DictCursor

conn=pymysql.connect(
    host="localhost",
    port=3306,
    user="root",
    password="123456",
    database="gyqcity"
)

cur=conn.cursor(DictCursor)

#sql="insert into student(sno, sname, sbirthday, saddress, sphone, class_name) values ('2','燕','2020-03-25','八宝山1','1237456','韩服2班')"
sql="select * from student"
cur.execute(sql)
all=cur.fetchall()
#conn.commit()
for item in all:
    print(item)
cur.close()
conn.close()
