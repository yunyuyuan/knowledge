from time import sleep

from flask import Blueprint, session
from pymysql import escape_string
from pymysql.cursors import DictCursor

from views import config
from views.util import dict_post_data, gen_response, data_format, check_login, inject_conn

bp = Blueprint('api', __name__, url_prefix='/api')

# 登录
@bp.route('/login', methods=['post'])
def login():
    data = dict_post_data()
    is_equal = data['pwd'] == config['pwd']
    if is_equal:
        session['login'] = True
    return gen_response('suc' if is_equal else 'err', [])

# 获取列表(用户)
@bp.route('/get_list_simple', methods=['post'])
@inject_conn
def util_get_list(conn):
    cursor = conn.cursor(DictCursor)
    data = dict_post_data()
    what = data['what']
    if what == 'words':
        args = ''
    elif what == 'book':
        args = ',cover,weight'
    else:
        args = ',cover'
    page, count = int(data['page']), int(data['count'])
    re = {}
    cursor.execute('select count(*) as c from '+what)
    re['count'] = cursor.fetchone()['c']
    cursor.execute('select id,nm%s from %s order by id desc limit %d,%d' %
                   (args, what, page * count, count))
    re['list'] = cursor.fetchall()
    return gen_response('suc', re)

# 获取列表(管理员)
@bp.route('/get_list', methods=['post'])
@inject_conn
@check_login
def util_get_list_manager(conn):
    cursor = conn.cursor(DictCursor)
    data = dict_post_data()
    what = data['what']
    s, page, count, orient = escape_string(data['s']), int(data['page']), int(data['count']), ('' if data['desc'] == 'unset' else(' order by '+data['order']+(' desc ' if data['desc'] == 'desc' else ' ')))
    where = (' ' if s == '' else ' where nm like "%s" ' % ("%%"+s+"%%"))
    re = {}
    cursor.execute('select count(*) as c from '+what+where+orient)
    re['count'] = cursor.fetchone()['c']
    cursor.execute(('select id,nm%s,date_format(c_tm, "%s") as c_tm,date_format(m_tm, "%s") as m_tm from %s '+where+orient+' limit %d,%d') %
                   (('' if what == 'words' else ',cover'), data_format, data_format, what, page*count, count))
    re['list'] = cursor.fetchall()
    return gen_response('suc', re)

# 获取详情
@bp.route('/get_detail', methods=['post'])
@inject_conn
def util_get_detail(conn):
    cursor = conn.cursor(DictCursor)
    data = dict_post_data()
    what = data['what']
    if what == 'words':
        args = 'sound'
    elif what == 'book':
        args = 'cover,author,summary,info,weight'
    else:
        args = 'cover,summary,info,posters'
    if data['id'] != '':
        cursor.execute('select nm,date_format(c_tm, "%s") as c_tm,date_format(m_tm, "%s") as m_tm,expl,%s from %s where id=%d' % (data_format, data_format, args, what, int(data['id'])))
    else:
        cursor.execute('select nm,date_format(c_tm, "%s") as c_tm,date_format(m_tm, "%s") as m_tm,expl,%s from %s order by id desc limit 0,1' % (data_format, data_format, args, what))
    return gen_response('suc', cursor.fetchone())
