import './about.scss';
import $ from '@vendor/jquery_vendor';
import Vue from 'vue';
import TheHead from '@components/pendant/Head.vue'

$(()=> {
    let vue_ = new Vue(({
        el: '#app',
        components: {TheHead},
        data: {
            total_say: '',
            say_offset: 0,
            thanks: []
        },
        mounted (){
            axios_pre({
                url: '/api/get_about',
                method: 'post'
            }, (data)=>{
                vue_.total_say = data.say;
                vue_.thanks = data.thanks;
            }
            );
            let handle = setInterval(()=>{
                vue_.say_offset ++;
                if (vue_.say_offset === this.total_say.length){
                    clearInterval(handle)
                }
            }, 80)
        },
        computed: {
            say (){
                return this.total_say.substr(0, this.say_offset)
            }
        },
        methods: {

        }
    }))
});