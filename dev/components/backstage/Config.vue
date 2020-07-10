<template>
    <div id="-vue-config" class="top">
        <div class="wrap">
            <div class="block pwd">
                <span>密码</span>
                <input v-model="new_config.pwd"/>
            </div>
            <div class="block home_btn">
                <span>主页按钮</span>
                <div class="menu-btn" v-for="(item,idx) in new_config.home_btn" :key="idx">
                    <input class="name" :disabled="item[0]==='default'" v-model="item[0]"/>
                    <b>:</b>
                    <input class="txt" v-model="item[1]"/>
                </div>
            </div>
            <div class="block about">
                <span>关于</span>
                <auto-textarea @event="get_say" :value="new_config.about.say"></auto-textarea>
                <span>致意</span>
                <div v-for="(item,idx) in new_config.about.thanks" :key="idx">
                    <div onclick="this.querySelector('input').click()">
                        <img :src="item.img"/>
                        <input :data-idx="idx" @change="chose_img" type="file" accept="image/*"/>
                    </div>
                    <input class="href" placeholder="http://" v-model="item.href"/>
                    <input class="expl" placeholder="图片来源" v-model="item.expl"/>
                    <input class="name" placeholder="名字" v-model="item.name"/>
                    <span @click="del_thanks(idx)"></span>
                </div>
                <button @click="add_thanks">添加</button>
            </div>
            <upload-button @event="submit" :disabled="has_change">修改</upload-button>
        </div>
    </div>
</template>

<script>
    import UploadButton from "@components/pendant/UploadButton.vue";
    import AutoTextarea from "../pendant/AutoTextarea.vue";

    export default {
        name: "config",
        components: {AutoTextarea, UploadButton},
        data() {
            return {
                old_config: {},
                new_config: {
                    pwd: '',
                    home_btn: [],
                    about: {
                        say: '',
                        thanks: []
                    }
                },
                submitting: false
            }
        },
        created() {
            let vue_ = this;
            head_pendant.toggle_loading(true);
            axios_pre({
                url: '/b/get_config',
                method: 'post',
            }, (data) => {
                vue_.old_config = data;
                vue_.new_config = $.extend(true, {}, data);
            }, {
                complete: () => {
                    head_pendant.toggle_loading(false);
                },
                cancel: true
            })
        },
        computed: {
            has_change() {
                if (this.new_config.pwd !== this.old_config.pwd) return false;
                if (JSON.stringify(this.new_config.about) !== JSON.stringify(this.old_config.about)) return false;
                if (JSON.stringify(this.new_config.home_btn) !== JSON.stringify(this.old_config.home_btn)) return false;
                return true;
            }
        },
        methods: {
            get_say(s) {
                this.new_config.about.say = s
            },
            chose_img(e) {
                let idx = +e.target.getAttribute('data-idx'),
                    files = e.target.files,
                    vue_ = this;
                if (files.length) {
                    let file = files[0];
                    if (file.size / 1024 ** 2 < 5) {
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (e) => {
                            vue_.new_config.about.thanks[idx].img = e.target.result;
                        }
                    } else {
                        head_pendant.pop_data({state: 'warn', msg: '图片需小于5M'})
                    }
                }
            },
            add_thanks() {
                this.new_config.about.thanks.push({
                    img: '/static/img/favicon.png',
                    name: '',
                    expl: '',
                    href: '',
                })
            },
            del_thanks(idx) {
                this.new_config.about.thanks.splice(idx, 1)
            },
            submit(btn) {
                let vue_ = this;
                axios_pre({
                    url: '/b/submit_config',
                    method: 'post',
                    data: vue_.new_config
                }, (data) => {
                    head_pendant.pop_data({state: 'suc', msg: '修改成功'});
                    // 刷新旧配置
                    vue_.old_config = $.extend(true, {}, vue_.new_config)
                }, {
                    complete: () => {
                        btn.completed();
                    },
                    cancel: true
                })
            }
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    #-vue-config{
        > .wrap{
            > .block{
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
                    > span{
                        margin-right: 1rem;
                        font-size: 1.05rem;
                    }
                    > input{
                        font-size: 1.05rem;
                        width: 15rem;
                        background: rgb(213, 255, 255);
                    }
                }
                &.home_btn{
                    flex-direction: column;
                    > span{
                        margin-bottom: 1rem;
                        font-size: 1.05rem;
                    }
                    > .menu-btn{
                        margin: 0.3rem 0;
                        > .name{
                            width: 4rem;
                            font-size: 1.05rem;
                            text-align: center;
                            background: rgb(255, 221, 182);
                            &:disabled{
                                background: #c3c3c3;
                                color: black;
                            }
                        }
                        > b{
                            margin: 0 0.5rem;
                        }
                        > .txt{
                            font-size: 0.9rem;
                            width: 20rem;
                        }
                    }
                }
                &.about{
                    flex-direction: column;
                    > span{
                        margin: 0.5rem 0;
                        font-size: 1.05rem;
                    }
                    >textarea{
                        font-size: 0.88rem;
                        padding: 0.5rem;
                    }
                    > div{
                        cursor: pointer;
                        margin-bottom: 0.8rem;
                        > div{
                            > img{
                                width: 2.5rem;
                                height: 2.5rem;
                            }
                            > input{
                                display: none;
                            }
                        }
                        > input{
                            font-size: 0.85rem;
                            margin-left: 0.3rem;
                        }
                        > .href{
                            width: 5rem;
                        }
                        > .expl{
                            width: 8rem;
                        }
                        > .name{
                            width: 4rem;
                        }
                        > span{
                            margin-left: 0.5rem;
                            cursor: pointer;
                            &:before{
                                font-family: $--iconfont;
                                content: $--i-del;
                                font-size: 1.3rem;
                                color: #ff6879;
                            }
                        }
                    }
                    > button{
                        background: #716aff;
                        color: white;
                    }
                }
            }
            > button{
                margin: 1rem 0;
            }
        }
    }
</style>