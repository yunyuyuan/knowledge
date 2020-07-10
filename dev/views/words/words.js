import './words.scss';
import '@views/main-page.scss'
import $ from '@vendor/jquery_vendor';
import Vue from 'vue'
import PlaySound from "@components/pendant/PlaySound.vue";
import LoadingSvg from "@components/pendant/LoadingSvg.vue";
import TheHead from "@components/pendant/Head.vue";
import TurnPage from "@components/pendant/TurnPage.vue";

$(()=> {
    let vue_ = new Vue(({
        el: '#app',
        components: {PlaySound, LoadingSvg, TheHead, TurnPage},
        data: {
            onePage_showCount: 10,
            page: 1,
            info: {},
            history: {
                count: 0,
                list: []
            },
            fetched_info: false,
            fetched_list: false,
        },
        created (){
            let query = query_to_map();
            head_pendant.toggle_loading(true);
            axios_pre({
                url: '/api/get_detail',
                method: 'post',
                data: {
                    what: 'words',
                    id: query.id || ''
                }
            }, (data)=>{
                if (data != null) {
                    vue_.info = data;
                    vue_.fetched_info = true;
                    document.title = '句子-' + data.nm
                } else {
                    location.href = '/words'
                }
            }, {
                complete: ()=>{
                    vue_.fetch_history()
                }
            });
        },
        methods: {
            fetch_history (){
                head_pendant.toggle_loading(true);
                axios_pre({
                    url: '/api/get_list_simple',
                    method: 'post',
                    data: {
                        what: 'words',
                        page: vue_.page-1,
                        count: vue_.onePage_showCount
                    }
                }, (data)=>{
                    vue_.history = data;
                    vue_.fetched_list = true;
                }, {
                    complete: ()=> {
                        head_pendant.toggle_loading(false)
                    }
                })
            },
            turn_page (p){
                this.page = p;
                this.fetch_history();
            }
        }
    }));
});