<template>
    <textarea rows="1" v-model="text"></textarea>
</template>

<script>
    export default {
        name: "AutoTextarea",
        props: ['value'],
        data (){
            return {
                text: '',
            }
        },
        watch: {
            value: function () {
                this.text = this.$props.value;
                this.adjust()
            },
            text: 'adjust'
        },
        mounted() {
            this.text = this.$props.value?this.$props.value:'';
            this.adjust()
        },
        methods: {
            adjust (){
                let el = this.$el;
                el.style.height = 'auto';
                // 减去paddingTop*2和borderWidth*2
                let css = get_css(el);
                el.style.height = parseInt(el.scrollHeight
                    -parseFloat(css.paddingTop.replace('px', ''))*2
                    -parseFloat(css.borderBottomWidth.replace('px', ''))*2)+'px';
                this.$emit('event', this.text, this.$el);
            },
        }
    }
</script>

<style lang="scss" scoped>
    textarea{
        width: 100%;
        overflow: hidden;
    }
</style>