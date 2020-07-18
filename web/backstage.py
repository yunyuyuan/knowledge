from os.path import sep
from time import sleep
from os import remove
from pymysql.cursors import DictCursor
from flask import Blueprint, render_template, session

from web import config, save_config
from web.util import dict_post_data, check_login, gen_response, inject_conn, static_path, check_agent

bp = Blueprint('backstage', __name__, url_prefix='/b')

@bp.route('/')
@check_agent
def index():
    return render_template('backstage.html', login='login' in session)


# 获取后台配置
@bp.route('/get_config', methods=['post'])
@check_login
def get_config():
    return gen_response('suc', {'pwd': config['pwd'], 'home_btn': config['home_btn'], 'about': config['about']})

# 修改后台配置
@bp.route('/submit_config', methods=['post'])
@check_login
def submit_config():
    data = dict_post_data()
    config.update(data)
    while not save_config():
        sleep(1)
    return gen_response('suc', {})

# 删除
@bp.route('/del_item', methods=['post'])
@check_login
@inject_conn
def del_item(conn):
    data = dict_post_data()
    cursor = conn.cursor(DictCursor)
    what, id_ = data['what'], int(data['id'])
    if what == 'words':
        # 删除MP3
        cursor.execute('select sound from words where id=%d' % id_)
        remove(static_path+'mp3'+sep+cursor.fetchone()['sound'])
    else:
        # 删除封面
        cursor.execute('select cover from %s where id=%d' % (what, id_))
        remove(static_path + 'img' + sep + what + sep + cursor.fetchone()['cover'])
        if what == 'film':
            # 删除海报
            cursor.execute('select posters from film where id=%d' % id_)
            for i in eval(cursor.fetchone()['posters']):
                remove(static_path + 'img' + sep + 'film' + sep + i)
    cursor.execute('delete from %s where id=%d' % (what, id_))
    return gen_response('suc', {})
