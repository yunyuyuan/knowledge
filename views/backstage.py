from time import sleep

from flask import Blueprint, render_template, request, session

from views import config, save_config
from views.util import dict_post_data, check_login, gen_response

bp = Blueprint('backstage', __name__, url_prefix='/b')

@bp.route('/')
def index():
    return render_template('backstage.html', login='login' in session)


# 获取后台配置
@bp.route('/get_config', methods=['post'])
@check_login
def get_config():
    return gen_response('suc', {'pwd': config['pwd'], 'home_btn': config['home_btn']})

# 修改后台配置
@bp.route('/submit_config', methods=['post'])
@check_login
def submit_config():
    data = dict_post_data()
    config.update(data)
    while not save_config():
        sleep(1)
    return gen_response('suc', {'msg': '修改成功'})
