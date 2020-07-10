from os import remove
from os.path import sep
from re import sub
from time import time

from flask import Blueprint, render_template, request
from pymysql import escape_string

from web.util import inject_conn, gen_response, static_path

bp = Blueprint('film', __name__, url_prefix='/film')

@bp.route('/')
def index():
    return render_template('film.html')

# 新增/修改
@bp.route('/mdf_film', methods=['post'])
@inject_conn
def mdf_film(conn):
    cursor = conn.cursor()
    data = request.form
    nm, summary, expl, info, poster_list = escape_string(data['nm']), escape_string(data['summary']), escape_string(data['expl']), escape_string(data['info']), eval(data['poster_list'])
    if data['id'] == '新增':
        cursor.execute('insert into film(nm, summary, c_tm, m_tm, expl, cover, info, posters) VALUES("%s", "%s", current_time(), current_time(), "%s", "%s", "%s", "[]")'
                       % (nm, summary, expl, '', info))
        conn.commit()
        cursor.execute('select last_insert_id()')
        film_id = cursor.fetchone()[0]
        re = gen_response('suc', {'id': film_id})
    else:
        film_id = int(data['id'])
        cursor.execute('update film set nm="%s",summary="%s",m_tm=current_time(),expl="%s",info="%s" where id=%d'
                       % (nm, summary, expl, info, film_id))
        re = gen_response('suc', {})
    folder = static_path + 'img' + sep + 'film' + sep
    if 'cover' not in data:
        # 存储封面
        file = request.files.get('cover')
        cursor.execute('select cover from film where id=%d' % film_id)
        # 删除旧的
        old_path = cursor.fetchone()[0]
        if old_path:
            remove(folder + old_path)
        ''' 加上时间戳 '''
        cover_filename = str(film_id) + '_' + str(int(time())) + '.' + file.content_type.replace('image/', '')
        # 存储并更新表
        file.save(folder + cover_filename)
        cursor.execute('update film set cover="%s" where id=%d'
                       % (cover_filename, film_id))
        conn.commit()
    # 海报
    cursor.execute('select posters from film where id=%d' % film_id)
    poster_old = eval(cursor.fetchone()[0])
    poster_new = []
    idx = 0
    for i in poster_list:
        if i[0:7] == 'poster_':
            file = request.files.get(i)
            poster_name = str(film_id) + '_poster' + str(idx) + '_' + str(int(time())) + sub(r'^.*_', '_', i) + '.' + file.content_type.replace('image/', '')
            file.save(folder + poster_name)
            poster_new.append(poster_name)
        else:
            poster_new.append(i)
        idx += 1
    # 删除
    for i in poster_old:
        if i not in poster_new:
            remove(folder + i)
    cursor.execute('update film set posters="%s" where id=%d' % (escape_string(str(poster_new).replace("'", '"')), film_id))
    return re
