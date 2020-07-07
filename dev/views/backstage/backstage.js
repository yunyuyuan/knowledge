import './backstage.scss';
import $ from '@vendor/jquery_vendor';
import Vue from 'vue';
import VueRouter from 'vue-router';
import 'velocity-animate';
import Headroom from 'headroom.js'

Vue.use(VueRouter);

$(()=> {
    if (document.querySelector('#app > .login') !== null) {
        let vue_ = new Vue({
            el: '#app',
            data: {
                pwd: '',
                msg: 'haha',
            },
            methods: {
                login() {
                    axios_pre({
                        url: '/api/login',
                        method: 'post',
                        data: {
                            pwd: vue_.pwd
                        }
                    }, (data)=>{
                        head_pendant.pop_data({state: 'suc', msg: '登录成功，正在跳转'});
                        setTimeout(() => {
                            location.reload();
                        }, 500)
                    })
                }
            }
        });
    }else {
        const config_component = ()=> import('@components/backstage/Config.vue');
        const list_component = ()=> import('@components/backstage/List.vue');
        const wordsDetail_component = ()=> import('@components/backstage/WordsDetail.vue');
        const bookDetail_component = ()=> import('@components/backstage/BookDetail.vue');
        const filmDetail_component = ()=> import('@components/backstage/FilmDetail.vue');
        const examine_component = ()=> import('@components/backstage/Examine.vue');
        const routes = [
            {name: 'default', path: '/', redirect: {name: 'config'}},
            {name: 'config', path: '/config', component: config_component, meta: {index: 0}},
            {name: 'words', path: '/words', component: list_component, meta: {index: 1},
                children: [
                    {
                        name: 'words_detail',
                        path: ':theId',
                        component: wordsDetail_component
                    }
                ]
            },
            {name: 'book', path: '/book', component: list_component, meta: {index: 2},
                children: [
                    {
                        name: 'book_detail',
                        path: ':theId',
                        component: bookDetail_component
                    }
            ]},
            {name: 'film', path: '/film', component: list_component, meta: {index: 3},
                children: [
                    {
                        name: 'film_detail',
                        path: ':theId',
                        component: filmDetail_component
                    }
            ]},
            {name: 'examine', path: '/examine', component: examine_component, meta: {index: 4}},
        ];
        const router = new VueRouter({
            routes: routes
        });
        // 错误处理
        router.onError((e)=>{
            head_pendant.pop_data({state: 'err', msg: e.message})
        });
        const name_to_head = {
            config: '网站配置',
            words: '英语句子',
            words_detail: '句子详情',
            book: '书籍阅读',
            book_detail: '书籍详情',
            film: '影视杂谈',
            film_detail: '影视详情',
            examine: '审核列表',
        };
        let vue_ = new Vue({
            el: '#app',
            router: router,
            mounted (){
                let b = this.$el.querySelector('.fixed-head');
                let css = get_css(b);
                let headroom = new Headroom(b, {
                    offset: +css.height.replace('px', ''),
                });
                headroom.init();
                router.afterEach((to, from) => {
                    if (name_to_head.hasOwnProperty(to.name)){
                        vue_.at = {
                            name: to.name,
                            s: name_to_head[to.name]
                        }
                    }
                    let from_idx = 0,
                        to_idx = 0;
                    from.matched.filter((e)=>{
                        if (e.meta.index){
                            from_idx = e.meta.index
                        }
                    });
                    to.matched.filter((e)=>{
                        if (e.meta.index){
                            to_idx = e.meta.index
                        }
                    });
                    if ((from_idx === to_idx && from_idx === 0) || from_idx !== to_idx) {
                        $(vue_.$el).find('>.menu>a').eq(from_idx).removeAttr('data-active');
                        let a = $(vue_.$el).find('>.menu>a').eq(to_idx)[0];
                        let bg_div = $(vue_.$el).find('>.menu>.bg');
                        bg_div.css({height: a.offsetHeight + 'px'});
                        bg_div.velocity('stop');
                        bg_div.removeClass('end');
                        bg_div.velocity({top: a.offsetTop + 'px'}, 200, 'ease-out', () => {
                            a.setAttribute('data-active', '');
                            bg_div.addClass('end');
                        })
                    }
                });
            },
            data: {
                at: {
                    name: 'config',
                    s: '网站配置'
                }
            },
            computed: {
            },
            methods: {
                change_at (at){
                    this.at = at;
                }
            }
        })
    }
});