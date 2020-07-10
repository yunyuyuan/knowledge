from os import remove
from os.path import sep
from time import time

from flask import Blueprint, render_template, request
from pymysql import escape_string

from web.util import inject_conn, gen_response, static_path

bp = Blueprint('book', __name__, url_prefix='/book')


@bp.route('/')
def index():
    return render_template('book.html')


# 新增/修改
@bp.route('/mdf_book', methods=['post'])
@inject_conn
def mdf_book(conn):
    cursor = conn.cursor()
    data = request.form
    nm, author, summary, expl, info = escape_string(data['nm']), escape_string(data['author']), escape_string(
        data['summary']), escape_string(data['expl']), escape_string(data['info'])
    weight = 0.3
    for i in eval(data['info']):
        if i['key'] == '字数':
            weight = int(i['val'].replace('千', ''))/800
            if weight < 0.25: weight = 0.25
            if weight > 1.25: weight = 1.25
            break
    if data['id'] == '新增':
        cursor.execute('insert into book(nm, author, summary, c_tm, m_tm, expl, cover, info, weight) VALUES("%s", "%s", "%s", current_time(), current_time(), "%s", "%s", "%s", %s)'
                       % (nm, author, summary, expl, '', info, str(weight)))
        conn.commit()
        cursor.execute('select last_insert_id()')
        book_id = cursor.fetchone()[0]
        re = gen_response('suc', {'id': book_id})
    else:
        book_id = int(data['id'])
        cursor.execute('update book set nm="%s",author="%s",summary="%s",m_tm=current_time(),expl="%s",info="%s",weight=%s where id=%d'
                       % (nm, author, summary, expl, info, str(weight), book_id))
        re = gen_response('suc', {})
    if 'cover' not in data:
        # 存储封面
        file = request.files.get('cover')
        cursor.execute('select cover from book where id=%d' % book_id)
        # 删除旧的
        old_path = cursor.fetchone()[0]
        folder = static_path + 'img' + sep + 'book' + sep
        if old_path:
            remove(folder + old_path)
        ''' 加上时间戳 '''
        cover_filename = str(book_id) + '_' + str(int(time())) + '.' + file.content_type.replace('image/', '')
        cover_path = folder + cover_filename
        # 存储并更新表
        file.save(cover_path)
        cursor.execute('update book set cover="%s" where id=%d'
                       % (cover_filename, book_id))
    return re
