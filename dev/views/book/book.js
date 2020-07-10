import './book.scss'
import '@views/main-page.scss'
import $ from '@vendor/jquery_vendor'
import Vue from 'vue'
import TheHead from '@components/pendant/Head.vue'
import TurnPage from '@components/pendant/TurnPage.vue'

$(()=> {
    let vue_ = new Vue({
        el: '#app',
        components: {TheHead, TurnPage},
        data: {
            onePage_showCount: 10,
            now: 1,
            info: {},
            has_more: false,
            show_more: false,
            tan_110: Math.abs(Math.tan(110*Math.PI/180)),
            history: {
                count: 0,
                list: []
            },
            fetched_info: false,
            fetched_list: false,
        },
        mounted (){
            let vue_ = this;
            let map = query_to_map();
            head_pendant.toggle_loading(true);
            axios_pre({
                url: '/api/get_detail',
                method: 'post',
                data: {
                    what: 'book',
                    id: map.id || ''
                }
            }, (data)=>{
                if (data != null) {
                    vue_.info = data;
                    vue_.fetched_info = true;
                    document.title = '书籍-' + data.nm;
                    let p = vue_.$el.querySelector('.latest>.cover>.info>p');
                    let interval = setInterval(()=>{
                        if (p.clientHeight>0) {
                            vue_.has_more = p.scrollHeight > p.clientHeight;
                            clearInterval(interval)
                        }
                    }, 100)
                } else {
                    location.href = '/book'
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
                        what: 'book',
                        page: vue_.now-1,
                        count: vue_.onePage_showCount
                    }
                }, (data)=>{
                    vue_.history = data;
                    vue_.fetched_list = true;
                }, {
                    complete: () =>{
                        head_pendant.toggle_loading(false)
                    }
                })
            },
            showMore (){
                let vue_ = this;
                vue_.show_more = true;
                function handel(e){
                    if (e.target.id === 'show-more'){
                        vue_.show_more = false;
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