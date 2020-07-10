import './home.scss'
import $ from '@vendor/jquery_vendor';
import Vue from 'vue'
import TheHead from '@components/pendant/Head.vue'

$(()=> {
    let vue_ = new Vue({
        el: '#app',
        components: {TheHead},
        data: {
            old_tip: '',
            tip: '',
            tout: null,
            btns: [],
        },
        created (){
            let vue_ = this;
            axios_pre({
                url: '/get_info',
                method: 'post'
            }, (data)=>{
                vue_.old_tip = data[0][1];
                vue_.btns = data.slice(1);
            })
        },
        methods: {
            enter (s) {
                this.tip = s;
                clearTimeout(this.tout);
                this.tout = null;
            },
            leave (){
                if (!this.tout) {
                    this.tout = setTimeout(()=>{
                        vue_.tip = '';
                        vue_.tout = null;
                    }, 1000);
                }
            }
        }
    })
});