from flask import Blueprint, render_template

from web import config
from web.util import gen_response, check_agent

bp = Blueprint('top', __name__, url_prefix='')

@bp.route('/')
@check_agent
def index():
    return render_template('home.html')

# 获取首页信息
@bp.route('/get_info', methods=['post'])
def get_info():
    return gen_response('suc', config['home_btn'])

# 关于
@bp.route('/about')
@check_agent
def about():
    return render_template('about.html')

# 我说
@bp.route('/i-say')
@check_agent
def i_say():
    return render_template('iSay.html')
