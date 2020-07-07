<template>
    <div class="-vue--turn-page">
        <div class="bg-box"></div>
        <a v-for="(item,idx) in page_list" :key="idx" :title="item===-1?false:`第${item}页`"
           :class="{'active': item===now, 'ellipsis': item===-1}"
           @click="function (e){go_page(e, item)}"
           @mouseenter="animate_hover"
           @mouseleave="animate_leave">
            {{item>0?item:''}}
        </a>
    </div>
</template>

<script>
    import 'velocity-animate';
    import $ from '@vendor/jquery_vendor'

    export default {
        name: "TurnPage",
        props: ['count', 'now', 'show_count', 'onepage_showcount'],
        data() {
            return {
                lock: null
            }
        },
        computed: {
            page_list (){
                let re = [],
                    show_count = this.$props.show_count,
                    now = this.$props.now,
                    count = Math.ceil(this.$props.count/this.$props.onepage_showcount);
                // 直接返回所有页码
                if (show_count > count){
                    for (let i=1;i<=count;i++){
                        re.push(i)
                    }
                    return re
                }
                re.push(now);
                let offset = 1;
                while (re.length < show_count) {
                    let p = now + offset;
                    if (p > 0 && p <= count) {
                        re.push(p);
                    }
                    offset = -offset + (offset < 0 ? 1 : 0);
                }
                re = re.sort((a, b)=>{return a-b});
                // 头部省略号
                if (re.indexOf(2) === -1){
                    re.splice(0, 0, -1);
                }
                if (re.indexOf(1) === -1){
                    re.splice(0, 0, 1);
                }
                // 尾部省略号
                if (re.indexOf(count-1) === -1){
                    re.push(-1);
                }
                if (re.indexOf(count) === -1){
                    re.push(count);
                }
                return re;
            }
        },
        methods: {
            go_page (e, p){
                if (e.currentTarget.classList.contains('ellipsis')) return;
                this.$emit('event', p);
            },
            animate_hover (e){
                let a = e.currentTarget;
                if (a.classList.contains('ellipsis')) return;
                let box = this.$el.querySelector('.bg-box');
                box.style.transform = `translateX(${a.offsetLeft}px)`;
                a.style.color = 'white';
            },
            animate_leave (e){
                let a = e.currentTarget;
                if (a.classList.contains('ellipsis')) return;
                let box = this.$el.querySelector('.bg-box');
                box.style.transform = `translateX(-100%)`;
                a.style.color = 'black';
            },
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    .-vue--turn-page{
        $btn-size: 2rem;
        position: relative;
        overflow: hidden;
        justify-content: center;
        >.bg-box{
            width: $btn-size;
            height: $btn-size;
            position: absolute;
            top: 0;
            left: 0;
            background: #0072ff;
            z-index: 2;
            border-radius: 0.2rem;
            transform: translateX(-100%);
            transition: transform .32s ease-out;
        }
        >a{
            width: $btn-size;
            height: $btn-size;
            cursor: pointer;
            border-radius: 0.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3;
        }
        >a{
            font-size: 0.85rem;
            color: #000;
            transition: color .32s ease-out;
            position: relative;
            &.active{
                background: #0f00ff;
                color: #fff !important;
            }
            &.ellipsis{
                cursor: not-allowed;
                margin: 0 0.2rem;
                &:before{
                    font-family: $--iconfont;
                    content: $--i-ellipsis;
                    color: #323232;
                    font-size: 2em;
                }
            }
            &:first-of-type, &:last-of-type{
                font-weight: bold;
                font-size: 0.9rem;
            }
        }
    }
</style>