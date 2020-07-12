<template>
    <header class="head" :class="{'only': $props.only_util===1}">
        <button class="menu -vue-head-menu" :class="{'opened': menu_open}" @click="toggle_menu">
          <svg viewBox="0 0 100 100">
            <path class="line line1" d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058" />
            <path class="line line2" d="M 20,50 H 80" />
            <path class="line line3" d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942" />
          </svg>
        </button>
        <div class="menu-btn">
            <a v-for="item in btns" :class="item.href||'home'" :href="'/'+item.href">
                <img v-if="!item.href" src="/static/img/favicon.png"/>
                {{item.name}}</a>
        </div>
        <div class="util -vue-head-util" :class="{'opened': util_open}" @click="toggle_util">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <div class="util-btn">
            <a href="/i-say" class="hand">我说</a>
            <a href="/about" class="about">关于</a>
            <a href="/b" class="pc">后台</a>
        </div>
    </header>
</template>

<script>
    import 'velocity-animate'
    import Headroom from 'headroom.js'
    export default {
        name: "Head",
        props: ['only_util'],
        data (){
            return {
                menu_open: false,
                util_open: false,
                btns: [
                    {name: '首页', href: ''},
                    {name: '句子', href: 'words'},
                    {name: '书籍', href: 'book'},
                    {name: '影视', href: 'film'}
                ]
            }
        },
        mounted() {
            new Headroom(this.$el, {
                offset: +get_css(this.$el).height.replace('px', '')
            }).init()
        },
        methods: {
            toggle_menu (){
                this.menu_open = !this.menu_open;
                this.toggle_div($(this.$el).find('.menu-btn'))
            },
            toggle_util (){
                this.util_open = !this.util_open;
                this.toggle_div($(this.$el).find('.util-btn'))
            },
            toggle_div(div) {
                let vue_ = this,
                    is_menu = div.hasClass('menu-btn');
                if (is_menu?this.menu_open:this.util_open) {
                    div.css({display: 'flex'});
                    div.velocity({opacity: 1,top: '110%'}, 200, 'linear', ()=>{
                        // 监听blur
                        function blur(e) {
                            // 点击其他地方
                            let el = e.target;
                            if (el !== div[0]){
                                document.removeEventListener('click', blur);
                                // 点击的是按钮
                                while (true){
                                    if (el.classList && el.classList.contains('-vue-head-'+(is_menu?'menu':'util'))){
                                        return
                                    }
                                    el = el.parentElement;
                                    if (!el) break;
                                }
                                if (is_menu) vue_.toggle_menu();
                                else vue_.toggle_util()
                            }
                        }
                        document.addEventListener('click', blur)
                    })
                }else{
                    div.velocity({opacity: 0,top: '50%'}, 200, 'linear', ()=>{
                        div.css({display: 'none'});
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "views/public";
    header.head{
        width: 100%;
        height: $head-height;
        background: rgba(255, 255, 255, 0.65);
        border-bottom: 1px solid #b0b0b0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: fixed;
        left: 0;
        top: 0;
        transition: all .3s ease-out;
        transform: translateY(0);
        z-index: $head-index;
        &.headroom--unpinned{
            transform: translateY(-100%);
        }
        &:hover{
            background: rgba(255, 255, 255, 0.85);
        }
        &.only{
            background: none;
            border: none;
            justify-content: flex-end;
            &:hover{
                background: none;
            }
            >.menu,>.menu-btn{
                display: none;
            }
        }
        >.menu{
            margin: 0.4rem 0 0.4rem 0.4rem;
            background-color: transparent;
            border: none;
            display: flex;
            padding: 0;
            z-index: 2;
            >svg{
                width: 2.4rem;
                height: 2.4rem;
                box-shadow: 0 0 0.4rem #00000063;
                background: rgba(51, 51, 51, 0.84);
               >.line{
                    fill: none;
                    stroke: #00ffff;
                    stroke-width: 6;
                    transition: stroke-dasharray .4s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset .4s cubic-bezier(0.4, 0, 0.2, 1);
                    @each $i,$n in (1,207),(2,60),(3,207){
                        &.line#{$i} {
                            stroke-dasharray: 60 $n;
                        }
                    }
                }
            }
            @each $i,$n,$s in (1,-134,90 207),(2,-30,1 60), (3,-134,90 207){
                &.opened >svg >.line#{$i}{
                    stroke-dasharray: $s;
                    stroke-dashoffset: $n;
                }
            }
        }
        >.menu-btn{
            flex-direction: column;
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: white;
            box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.3);
            display: none;
            opacity: 0;
            padding: 0.2rem 0.3rem;
            border-radius: 0.2rem;
            z-index: 1;
            >a{
                width: calc(100% - 1.2rem);
                padding: 0.3rem 0.6rem;
                text-decoration: none;
                color: black;
                display: flex;
                align-items: center;
                justify-content: center;
                word-break: keep-all;
                &:not(:last-of-type){
                    margin-bottom: 0.6rem;
                }
                &:hover{
                    background: #91ccff;
                }
                &:before{
                    font-family: $--iconfont;
                    font-size: 1.4em;
                    color: #001fff;
                    margin-right: 0.8rem;
                }
                //@each $s in 'about','hand','pc'{
                //    &.#{$s}:before{
                //        content: #{'$--i-'$s};
                //    }
                //}
                &.home >img {
                    width: 1.6rem;
                    height: 1.6rem;
                    border-radius: 0.2rem;
                    margin-right: 0.8rem;
                }
                &.words:before {
                    content: $--i-words;
                }
                &.book:before {
                    content: $--i-book;
                }
                &.film:before{
                    content: $--i-film;
                }
            }
        }
        >.util{
            margin-right: 0.4rem;
            width: 2rem;
            height: 2rem;
            cursor: pointer;
            background: #1e1e1e;
            padding: 0.25rem;
            flex-wrap: wrap;
            justify-content: space-between;
            align-content: space-between;
            box-shadow: 0 0 0.8rem rgba(0, 0, 0, 0.5);
            z-index: 2;
            >div{
                width: 45%;
                height: 45%;
                transform: skew(0, 0);
                transition: transform .2s ease-out;
                &:nth-child(1){
                    background: #ff9d37;
                }
                &:nth-child(2){
                    background: #17d200;
                }
                &:nth-child(3){
                    background: #74a8ff;
                }
                &:nth-child(4){
                    background: #ff4fe9;
                }
            }
            &.opened{
                >div:nth-child(2),>div:nth-child(3){
                    transform: skew(-30deg, -30deg) scale(0.75);
                }
                >div:nth-child(1),>div:nth-child(4){
                    transform: skew(30deg, 30deg) scale(0.75);
                }
            }
        }
        >.util-btn{
            background: white;
            opacity: 0;
            position: absolute;
            right: 1rem;
            top: 1rem;
            display: none;
            border-radius: 0.2rem;
            z-index: 1;
            flex-direction: column;
            box-shadow: 0 0 0.8rem rgba(0, 0, 0, 0.3);
            padding: 0.5rem 0;
            >a{
                padding: 0.4rem 1rem;
                text-decoration: none;
                color: black;
                font-size: 1rem;
                display: flex;
                align-items: center;
                word-break: keep-all;
                &:hover{
                    background: #a2ffba;
                }
                &:before{
                    font-family: $--iconfont;
                    font-size: 1.4em;
                    color: #3300ff;
                    margin-right: 0.6rem;
                }
                //@each $s in 'about','hand','pc'{
                //    &.#{$s}:before{
                //        content: #{'$--i-'$s};
                //    }
                //}
                &.about:before {
                    content: $--i-about;
                }
                &.hand:before {
                    content: $--i-hand;
                }
                &.pc:before{
                    content: $--i-pc;
                }
            }
        }
    }
</style>