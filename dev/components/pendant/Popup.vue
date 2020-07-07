<template>
    <div class="popup">
        <div :class="['ani', state]"
            @mouseenter="toggle_pause(true)"
            @mouseleave="toggle_pause(false)"
        >
            <div class="bg"></div>
            <div class="show">
                <span></span>
                <a :class="{'hovered': hovered}">{{msg}}</a>
            </div>
            <span @click="close"></span>
            <div class="process"></div>
        </div>
    </div>
</template>

<script>
import $ from '@vendor/jquery_vendor';
import 'velocity-animate';
export default {
    data (){
        return {
            state: 'suc',
            msg: '无消息',
            // 弹出/隐藏 延迟和动画
            pop_delay: 300,
            pop_easing: 'ease-out',
            // 展示时间
            duration: 3000,
            hovered: false
        }
    },
    methods: {
        show (data){
            let vue_ = this;
            // 更改信息
            this.msg = data.msg;
            this.state = data.state;
            let poper = this.$el.querySelector('.ani'),
                timer = this.$el.querySelector('.process');
            // 重置popup和timing状态
            $(poper).velocity('stop', true);
            $(timer).velocity('stop', true);
            $(poper).velocity({left: '0%'}, 0, ()=>{
                $(timer).velocity({left: '0%'}, 0, ()=>{
                   // 开始弹出动画
                    $(poper).velocity({left: '-100%'}, vue_.pop_delay, vue_.pop_easing,
                        ()=>{
                            // 开始计时动画
                            $(timer).velocity({left: '-100%'}, vue_.duration, 'linear',
                                ()=>{
                                    // 开始收回动画
                                    $(poper).velocity({left: '0%'}, vue_.pop_delay, vue_.pop_easing,
                                        ()=>{
                                            // 计时器归零
                                            timer.style.left = '0%';
                                        }
                                    )
                                }
                            )
                        }
                    )
                });
            });
        },
        close (){
            let vue_ = this,
                poper = this.$el.querySelector('.ani'),
                timer = this.$el.querySelector('.process');
            // 停止动画
            $(poper).velocity('stop', true);
            $(timer).velocity('stop', true);
            // 开始隐藏动画
            timer.style.left = '0%';
            $(poper).velocity({left: '0%'}, vue_.pop_delay, vue_.pop_easing)
        },
        toggle_pause (b){
            let timer = this.$el.querySelector('.process');
            this.hovered = b;
            if (b){
                $(timer).velocity('pause');
            }else{
                $(timer).velocity('resume');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    @import "views/public";
    .popup{
        max-width: 50%;
        position: fixed;
        right: 0;
        top: 0;
        z-index: $popup-index;
        transform: translateX(100%);
        >.ani{
            border-radius: 0.4rem 0.4rem 0 0;
            box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.4);
            padding: 1rem 2rem;
            margin: 1rem;
            overflow: hidden;
            position: relative;
            left: 0;
            >.bg{
                width: 100%;
                height: 100%;
                border-radius: inherit;
                z-index: 1;
                position: absolute;
                left: 0;
                top: 0;
            }
            >.show{
                z-index: 2;
                border-radius: inherit;
                >span{
                    &:before{
                        font-family: $--iconfont;
                        font-size: 1.4rem;
                        margin-right: 1rem;
                    }
                }
                >a{
                    font-size: 0.8rem;
                    line-height: 1.2rem;
                    &:not(.hovered){
                        @include text-overflow(1);
                    }
                }
            }
            @each $cls,$col,$f in (warn, #ffe99a, #ff9900), (suc, #b5ffca, #5478ff), (err, #ffc4ba, #ff0012){
                &.#{$cls}{
                    >.bg{
                        background: $col;
                    }
                    >.show >span:before{
                        color: $f;
                        content: #{'$--i-'$cls};
                    }
                }
            }
            >span{
                position: absolute;
                top: 0.3rem;
                right: 0.3rem;
                line-height: 0.7rem;
                cursor: pointer;
                color: #666;
                z-index: 2;
                &:before{
                    font-family: $--iconfont;
                    content: $--i-close;
                    font-size: 0.6rem;
                }
                &:hover{
                    color: red;
                    font-weight: bold;
                }
            }
            >.process{
                width: 100%;
                height: 0.2rem;
                background: #c300ff;
                position: absolute;
                bottom: 0;
                left: 0;
                z-index: 2;
            }
        }
    }
</style>