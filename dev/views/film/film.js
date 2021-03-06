import './film.scss'
import '@views/main-page.scss'
import $ from '@vendor/jquery_vendor'
import Vue from 'vue'
import TheHead from '@components/pendant/Head.vue'
import TurnPage from "@components/pendant/TurnPage.vue"
import 'velocity-animate'

$(()=> {
    let vue_ = new Vue({
        el: '#app',
        components: {TheHead, TurnPage},
        data: {
            onePage_showCount: 10,
            now: 1,
            info: {},
            now_img: null,
            has_more: false,
            show_more: false,
            show_big_img: false,
            history: {
                count: 0,
                list: []
            },
            fetched_info: false,
            fetched_list: false,
            // 轮播信息
            multi_contain: 1,
            gradient_left: 0,
            inner_left: 0,
        },
        mounted (){
            let vue_ = this;
            let map = query_to_map();
            head_pendant.toggle_loading(true);
            axios_pre({
                url: '/api/get_detail',
                method: 'post',
                data: {
                    what: 'film',
                    id: map.id || ''
                }
            }, (data)=>{
                if (data != null) {
                    vue_.info = data;
                    vue_.fetched_info = true;
                    document.title = '影视-' + data.nm;
                    let span = vue_.$el.querySelector('.base-info>.cover>.summary>span');
                    let interval = setInterval(()=>{
                        if (span.clientHeight>0) {
                            vue_.has_more = span.scrollHeight > span.clientHeight;
                            clearInterval(interval)
                        }
                    }, 100);
                    // 轮播
                    let posters = $(this.$el).find('.posters');
                    let contain = posters.find('.contain');
                    let wrap_width = posters.width();
                    // 一个contain的width
                    let contain_width = 0;
                    for (let url of JSON.parse(vue_.info.posters)){
                        contain_width += parseFloat(url.replace(/.*_([\d.]+)\..*?$/, '$1'))*contain.height()+16
                    }
                    // 复制元素
                    vue_.multi_contain = Math.ceil(wrap_width/contain_width)+1;
                    // 开始
                    setInterval(()=>{
                        vue_.gradient_left -= 1;
                        if (vue_.gradient_left === -32){
                            vue_.gradient_left = 0
                        }
                        vue_.inner_left -= 1;
                        if (vue_.inner_left === -Math.floor(contain_width)){
                            vue_.inner_left = 0
                        }
                    }, 50)
                } else {
                    location.href = '/film'
                }
            }, {
                complete: ()=>{
                    vue_.fetch_list()
                }
            })
        },
        methods: {
            fetch_list (){
                head_pendant.toggle_loading(true);
                axios_pre({
                    url: '/api/get_list_simple',
                    method: 'post',
                    data: {
                        what: 'film',
                        page: vue_.now-1,
                        count: vue_.onePage_showCount
                    }
                }, (data)=>{
                    vue_.history = data;
                    vue_.fetched_list = true;
                }, {
                    complete: ()=>{
                        head_pendant.toggle_loading(false)
                    }
                })
            },
            showMore (){
                this.show_more = true;
                this.add_handel('show_more')
            },
            showBigImg (e){
                this.show_big_img = e.target.src;
                this.add_handel('show_big_img')
            },
            add_handel (what){
                function handel(e){
                    if (e.target === document.getElementById('show-more')){
                        vue_[what] = false;
                        document.removeEventListener('click', handel)
                    }
                }
                document.addEventListener('click', handel)
            },
            turn_page (p){
                this.now = p;
                this.fetch_list()
            }
        }
    })
});