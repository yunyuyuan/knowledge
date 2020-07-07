import Popup from '@components/pendant/Popup.vue'
import Loading from '@components/pendant/Loading.vue'
import './header.scss'
import $ from '@vendor/jquery_vendor';
import axios from 'axios'
import Vue from 'vue'
import 'babel-polyfill'

$(()=> {
    window.head_pendant = new Vue({
        el: '#head-pendant',
        data: {
        },
        components: {Popup,Loading},
        methods: {
            pop_data (data) {
                this.$refs.popup.show(data)
            },
            close (){
                this.$refs.popup.close()
            },
            toggle_loading (b){
                this.$refs.loading.toggle(b)
            }
        }
    });
    // 封装axios,处理err和请求错误
    // (options, config:{}, callback, complete:()=>{}, show_catch:true)
    let source = axios.CancelToken.source();
    window.axios_pre = (options, config, callback, complete, show_catch)=>{
        // 取消之前的请求
       source.cancel();
       source = axios.CancelToken.source();
       if (typeof config == 'function') {
            show_catch = complete;
            complete = callback;
            callback = config;
            config = {};
        }
        if (typeof complete == 'function') {
            show_catch = (typeof show_catch == 'undefined') ? true : show_catch
        } else {
            show_catch = complete !== undefined? complete:true;
            complete = () => {};
        }
        options.cancelToken = source.token;
        axios(options, config).then((res)=>{
            let data = res.data.data;
            if (res.data.state === 'suc'){
                callback(data)
            }else{
                window.head_pendant.pop_data({state: 'err', msg: data.msg})
            }
        }).catch((e)=>{
            if (show_catch && !axios.isCancel(e)) window.head_pendant.pop_data({state: 'err', msg: (typeof e.toJSON == 'function')?e.toJSON().message:e})
        }).then((res)=>{
            complete(res)
        });
    };
    // 获取css计算属性
    window.get_css = (el)=>{
        return (el.currentStyle)? el.currentStyle:getComputedStyle(el)
    };
    // search to map
    window.query_to_map = ()=>{
        let search = location.search;
        let matcher = search.match(/([^?&=]+)=([^&]*)/g);
        let re = {};
        if (!matcher) return re;
        for (let s of matcher){
            re[s.replace(/=.*/, '')] = s.replace(/.*=/, '')
        }
        return re;
    }
});