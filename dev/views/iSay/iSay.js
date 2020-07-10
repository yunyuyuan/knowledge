import './iSay.scss'
import $ from '@vendor/jquery_vendor';
import Vue from 'vue'
import TheHead from '@components/pendant/Head.vue'

$(()=> {
    let vue_ = new Vue({
        el: '#app',
        components: {TheHead},
        data: {
        },
        created (){
        },
        methods: {
        }
    })
});