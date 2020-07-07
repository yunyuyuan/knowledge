<template>
    <div class="-vue--order-orient" @click="toggle" :style="{fontSize: $props.size*1.6+'rem',width: $props.size*1.5+'rem'}">
        <div v-show="state==='unset'" class="unset" :style="{fontSize: $props.size*0.6+'rem',lineHeight: $props.size*0.85+'rem'}">
            <span></span>
            <span></span>
        </div>
        <span v-show="state==='desc'" class="desc"></span>
        <span v-show="state==='normal'" class="normal"></span>
    </div>
</template>

<script>
    export default {
        name: "OrderOrient",
        props: ['order', 'size'],
        data (){
            return {
                state: 'unset'
            }
        },
        methods: {
            reset (){
                this.state = 'unset'
            },
            toggle (){
                if (this.state === 'unset'){
                    this.state = 'normal'
                }else if (this.state === 'normal'){
                    this.state = 'desc'
                }else{
                    this.state = 'unset'
                }
                this.$emit('event', [this.$props.order,this.state])
            }
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    .-vue--order-orient{
        justify-content: center;
        span{
            &:before {
                font-family: $--iconfont;
                content: $--i-tri;
            }
        }
        >div{
            flex-direction: column;
            >span:nth-child(2){
                transform: rotate(180deg);
            }
        }
        >.desc{
            transform: rotate(180deg);
        }
        >.normal{

        }
    }
</style>