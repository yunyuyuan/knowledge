__all__ = ['create_app', 'config', 'save_config']

from datetime import timedelta
from json import load, dump

with open('config.json', encoding='utf-8') as fp:
    config = load(fp)

saving = False

def save_config():
    global saving
    if saving:
        return False
    saving = True
    with open('config.json', 'w', encoding='utf-8') as fp:
        dump(config, fp, indent=4)
    saving = False
    return True

from flask import Flask

from views.top import bp as bp1
from views.words import bp as bp2
from views.book import bp as bp3
from views.film import bp as bp4
from views.api import bp as bp5
from views.backstage import bp as bp6

def create_app(app: Flask):
    # session过期时间
    app.permanent_session_lifetime = timedelta(hours=12)
    # 修改模板语法，避免和vue冲突
    app.jinja_env.variable_start_string = '#{'
    app.jinja_env.variable_end_string = '#}'
    app.secret_key = 'Abuy_+YHyubgvu&^ha&……&FVTV&FY*-'
    for bp in [bp1, bp2, bp3, bp4, bp5, bp6]:
        app.register_blueprint(bp)
