from os import getcwd, sep

from pymysql import escape_string
from pymysql.cursors import DictCursor

static_path = getcwd() + sep + 'static' + sep

data_format = '%Y-%m-%d %H:%i:%s'

from functools import wraps

import pymysql
from DBUtils.PooledDB import PooledDB
from flask import request, jsonify, session

from web import config

POOL = PooledDB(
    creator=pymysql,  # 使用链接数据库的模块
    maxconnections=10,  # 连接池允许的最大连接数，0和None表示不限制连接数
    mincached=2,  # 初始化时，链接池中至少创建的空闲的链接，0表示不创建


    maxcached=5,  # 链接池中最多闲置的链接，0和None不限制
    maxshared=3,  # 链接池中最多共享的链接数量，0和None表示全部共享。PS: 无用，因为pymysql和MySQLdb等模块的 threadsafety都为1，所有值无论设置为多少，_maxcached永远为0，所以永远是所有链接都共享。
    blocking=True,  # 连接池中如果没有可用连接后，是否阻塞等待。True，等待；False，不等待然后报错
    maxusage=None,  # 一个链接最多被重复使用的次数，None表示无限制
    setsession=[],  # 开始会话前执行的命令列表。如：["set datestyle to ...", "set time zone ..."]
    ping=0,
    # ping MySQL服务端，检查是否服务可用。
    # 如：0 = None = never, 1 = default = whenever it is requested, 2 = when a cursor is created, 4 = when a query is executed, 7 = always
    host='127.0.0.1',
    port=3306,
    user=config['db']['user'],
    password=config['db']['pwd'],
    database=config['db']['db'],
    charset='utf8mb4'
)

# 解析POST参数
def dict_post_data():
    try:
        return eval(bytes.decode(request.data))
    except SyntaxError:
        return {}

# post返回json
def gen_response(state, data):
    return jsonify({'state': state, 'data': data})

# 检查是否管理员登录
def check_login(func):
    @wraps(func)
    def inner(*args, **kwargs):
        if 'login' in session:
            return func(*args, **kwargs)
        else:
            return gen_response('err', {'msg': '权限不足'})
    return inner


# 注入conn
def inject_conn(func):
    @wraps(func)
    def inner(*args, **kwargs):
        conn = POOL.connection()
        re = func(conn, *args, **kwargs)
        conn.commit()
        return re
    return inner
