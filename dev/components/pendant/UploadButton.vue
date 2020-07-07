<template>
    <button
        @click="submit" :disabled="disabled || submitting"
        :class="{'processing': submitting, '-vue--upload-button': true}"
    >
        <loading-svg :running="submitting"></loading-svg>
        <span></span>
        <a><slot></slot></a>
    </button>
</template>

<script>
    import LoadingSvg from "./LoadingSvg.vue";
    export default {
        name: "UploadButton",
        props: ['disabled'],
        components: {LoadingSvg},
        data (){
            return {
                submitting: false
            }
        },
        methods: {
            submit (){
                this.submitting = true;
                this.$emit('event', this);
            },
            completed (){
                this.submitting = false
            }
        }
    }
</script>

<style lang="scss">
@import "views/public";
.-vue--upload-button{
    font-size: 1.05rem;
    background: #4789ff;
    color: white;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    >svg{
        display: none;
        margin: 0 0.4rem;
    }
    >span{
        display: inline-flex;
        color: #82ffc5;
        margin: 0 0.4rem;
        &:before{
            font-size: 1.2rem;
            font-family: $--iconfont;
            content: $--i-submit;
        }
    }
    &:not(.processing,:disabled):hover{
        background: #74a4ff;
    }
    &:disabled{
        background: #919191;
        >span{
            color: #d30007;
            &:before{
                content: $--i-not-allow;
            }
        }
    }
    &.processing{
        cursor: not-allowed;
        >span{
            display: none;
        }
        .-vue-loading-svg{
            display: unset;
            width: 1.2rem;
            height: 1.2rem;
            fill: #2700ff;;
        }
    }
}
</style>