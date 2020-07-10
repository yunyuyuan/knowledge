from os import remove
from os.path import sep

from flask import Blueprint, render_template, request
from pymysql import escape_string

from web.util import gen_response, inject_conn, static_path

bp = Blueprint('words', __name__, url_prefix='/words')

@bp.route('/')
def index():
    return render_template('words.html')

# 新增/修改
@bp.route('/mdf_words', methods=['post'])
@inject_conn
def mdf_words(conn):
    cursor = conn.cursor()
    data = request.form
    nm, expl = escape_string(data['nm']), escape_string(data['expl'])
    if data['id'] == '新增':
        cursor.execute('insert into words(nm, c_tm, m_tm, expl, sound) VALUES("%s", current_time(), current_time(), "%s", "%s")'
                       % (nm, expl, ''))
        conn.commit()
        cursor.execute('select last_insert_id()')
        words_id = cursor.fetchone()[0]
        re = gen_response('suc', {'id': words_id})
    else:
        words_id = int(data['id'])
        cursor.execute('update words set nm="%s",m_tm=current_time(),expl="%s" where id=%d'
                       % (nm, expl, words_id))
        re = gen_response('suc', {})
    if 'sound' not in data:
        # 存储mp3
        file = request.files.get('sound')
        cursor.execute('select sound from words where id=%d' % words_id)
        # 删除旧的
        old_path = cursor.fetchone()[0]
        folder = static_path + 'mp3' + sep
        if old_path:
            remove(folder + old_path)
        sound_filename = str(words_id)+'.'+file.content_type.replace('audio/', '')
        sound_path = folder + sound_filename
        # 存储并更新表
        file.save(sound_path)
        cursor.execute('update words set sound="%s" where id=%d'
                       % (sound_filename, words_id))
    return re

