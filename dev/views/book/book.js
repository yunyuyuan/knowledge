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
            tan_110: Math.abs(Math.tan(110*Math.PI/180)),
            history: {
                count: 0,
                list: []
            },
            fetched_info: false,
            fetched_list: false,
        },
        created (){
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
                    document.title = '书籍-' + data.nm
                } else {
                    location.href = '/book'
                }
            }, ()=>{
                this.fetch_list()
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
                }, ()=>{
                    head_pendant.toggle_loading(false)
                })
            },
            turn_page (p){
                this.now = p;
                this.fetch_list()
            }
        }
    })
});