<template>
    <div class="-vue-loading">
        <div>
            <loading-svg :running="show"></loading-svg>
            <span>加载中</span>
        </div>
    </div>
</template>

<script>
    import LoadingSvg from "./LoadingSvg.vue";
    import 'velocity-animate';
    export default {
        name: "Loading",
        data (){
            return {
                show: false,
            }
        },
        components: {LoadingSvg},
        methods: {
            toggle (b){
                let div = $(this.$el).find('>div');
                div.velocity('stop', true);
                if (b){
                    this.show = true;
                    div.velocity({
                        translateY: '1rem'
                    }, 200, 'ease-out')
                }else{
                    div.velocity({
                        translateY: '-2.3rem'
                    }, 200, 'ease-out', ()=>{
                        this.show = false;
                    })
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import "views/public";
    .-vue-loading{
        position: fixed;
        width: 100%;
        height: 0;
        top: 0;
        left: 0;
        overflow: visible;
        justify-content: center;
        align-items: flex-start;
        z-index: $loading-index;
        >div{
            padding: 0.3rem 0.8rem;
            background: white;
            border-radius: 0.15rem;
            box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.3);
            transform: translateY(calc(-100% - 0.5rem));
            >.-vue-loading-svg{
                margin-right: 0.5rem;
                width: 1.2rem;
                height: 1.2rem;
                fill: #372bff;
            }
            >span{
                font-size: 0.8rem;
            }
        }
    }
</style>