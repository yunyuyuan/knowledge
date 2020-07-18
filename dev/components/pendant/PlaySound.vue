<template>
    <div :class="['-vue--play-sound', this.$props.src===''?'no':'']" @click="toggle_play" :style="{'width': this.$props.size*1.2+'rem','height': this.$props.size+'rem'}">
        <span v-show="!playing" :style="{'font-size': this.$props.size+'rem'}"></span>
        <div v-show="playing" :style="{width: this.$props.size+'rem',height: this.$props.size+'rem'}">
            <div class="short"></div>
            <div class="long"></div>
            <div class="short"></div>
            <div class="long"></div>
        </div>
        <audio></audio>
    </div>
</template>

<script>
    export default {
        name: "PlaySound",
        props: ['src', 'size'],
        data (){
            return {
                playing: false,
            }
        },
        methods: {
            toggle_play (){
                let vue_ = this,
                    audio = this.$el.querySelector('audio');
                if (this.$props.src==='') return;
                if (!audio.src) audio.src=vue_.$props.src;
                this.playing = !this.playing;
                if (this.playing){
                    audio.addEventListener('ended', ()=>{
                        vue_.playing = false;
                    });
                    audio.play();
                }else{
                    audio.pause();
                    vue_.playing = false;
                }
            }
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    .-vue--play-sound{
        cursor: pointer;
        position: relative;
        justify-content: center;
        border-radius: 0.2rem;
        background: white;
        padding: 0.2rem 0.6rem;
        &.no{
            background: #c8c8c8;
            cursor: not-allowed;
        }
        &:not(.no):hover{
            >span:before{
                color: #7d88f9;
            }
        }
        >span{
            &:before{
                font-family: $--iconfont;
                content: $--i-sound;
                color: #0f00ff;
            }
        }
        @mixin bounce($nm, $s, $e) {
            @keyframes bounce-#{$nm} {
                0% {
                    height: $s;
                } 50% {
                    height: $e;
                } 100% {
                    height: $s;
                }
            }
        }
        @include bounce('short', 50%, 100%);
        @include bounce('long', 100%, 50%);
        >div{
            justify-content: space-around;
            >div{
                background: #a012ff;
                border-radius: 0.3rem;
                width: 15%;
                animation: bounce-short .5s linear infinite;
                &.long{
                    animation: bounce-long .5s linear infinite;
                }
            }
        }
        >audio{
            /*display: none;*/
        }
    }
</style>