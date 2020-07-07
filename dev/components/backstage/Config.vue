<template>
    <div id="-vue-config" class="top">
        <div class="wrap">
            <div class="block pwd">
                <span>密码</span>
                <input v-model="new_config.pwd"/>
            </div>
            <div class="block home_btn">
                <span>主页按钮</span>
                <div class="menu-btn" v-for="item in new_config.home_btn" :key="item[0]">
                    <input class="name" :disabled="item[0]==='default'" v-model="item[0]"/>
                    <b>:</b>
                    <input class="txt" v-model="item[1]"/>
                </div>
            </div>
            <upload-button @event="submit" :disabled="has_change">修改</upload-button>
        </div>
    </div>
</template>

<script>
    import UploadButton from "@components/pendant/UploadButton.vue";
    export default {
        name: "config",
        components: {UploadButton},
        data() {
            return {
                old_config: {},
                new_config: {
                    pwd: '',
                    home_btn: []
                },
                cfg_keys: [],
                submitting: false
            }
        },
        created() {
            let vue_ = this;
            head_pendant.toggle_loading(true);
            axios_pre({
                url: '/b/get_config',
                method: 'post',
            }, (data)=>{
                vue_.cfg_keys = Object.keys(data);
                vue_.old_config = data;
                vue_.new_config = $.extend(true, {}, data);
            }, ()=>{
                head_pendant.toggle_loading(false);
            })
        },
        computed: {
            has_change (){
                for (let k of this.cfg_keys){
                    if (this.old_config[k].toString() !== this.new_config[k].toString()) return false;
                }
                return true;
            }
        },
        methods: {
            submit (btn){
                let vue_ = this;
                axios_pre({
                    url: '/b/submit_config',
                    method: 'post',
                    data: vue_.new_config
                }, (data)=>{
                    head_pendant.pop_data({state: 'suc', msg: data.msg});
                    // 刷新旧配置
                    vue_.old_config = $.extend(true, {}, vue_.new_config)
                }, ()=>{
                    btn.completed()
                })
            }
        }
    }
</script>

<style lang="scss">
    #-vue-config{
        >.wrap{
            max-width: 75rem;
           >.block{
                margin: 0.2rem 0;
                border-radius: 0.4rem;
                background: rgba(0, 0, 0, 0.6);
                color: white;
                padding: 1.5rem 3rem;
                input{
                    padding: 0.4rem 0.2rem;
                    border-radius: 0.2rem;
                }
                &.pwd{
                    >span{
                        margin-right: 1rem;
                    }
                    >input{
                        font-size: 1.05rem;
                        width: 15rem;
                        background: rgb(213, 255, 255);
                    }
                }
                &.home_btn{
                    flex-direction: column;
                    >span{
                        margin-bottom: 1rem;
                    }
                    >.menu-btn{
                        margin: 0.3rem 0;
                        >.name{
                            width: 4rem;
                            font-size: 1.05rem;
                            text-align: center;
                            background: rgb(255, 221, 182);
                            &:disabled{
                                background: #c3c3c3;
                                color: black;
                            }
                        }
                        >b{
                            margin: 0 0.5rem;
                        }
                        >.txt{
                            font-size: 0.9rem;
                            width: 20rem;
                        }
                    }
                }
            }
            >button{
                margin: 1rem 0;
            }
        }
    }
</style>