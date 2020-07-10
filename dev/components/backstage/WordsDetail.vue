<template>
    <div id="-vue-words-detail">
        <del class="back" @click="go_back"></del>
        <button class="del_item" v-show="!is_add" @click="del_item">删除</button>
        <a class="the-id" :href="'/words'+(is_add?'':'?id='+cal_theId)" target="_blank">
            ID:<b>{{cal_theId}}</b>
        </a>
        <div class="words">
            <auto-textarea @event="get_words_text" :value="old_detail.nm" placeholder="句子"></auto-textarea>
        </div>
        <div class="sound">
            <span>音频文件</span>
            <button onclick="this.children[0].click()">{{sound_name===''?'未选择':sound_name}}<input @change="get_sound_file" type="file" accept="audio/*"/></button>
            <play-sound :src="sound_path" :size="1.2"></play-sound>
        </div>
        <div class="explain">
            <auto-textarea @event="get_expl_text" :value="old_detail.expl" placeholder="解析"></auto-textarea>
        </div>
        <upload-button @event="submit" :disabled="can_submit">{{is_add?'添加':'修改'}}</upload-button>
    </div>
</template>

<script>
    import $ from '@vendor/jquery_vendor';
    import AutoTextarea from "@components/pendant/AutoTextarea.vue";
    import PlaySound from "@components/pendant/PlaySound.vue";
    import UploadButton from "@components/pendant/UploadButton.vue";
    export default {
        name: "WordsDetail",
        components: {UploadButton, PlaySound, AutoTextarea},
        data (){
            return {
                is_add: false,
                sound_file: null,
                sound_name: '',
                sound_path: '',
                old_detail: {
                    nm: '',
                    expl: '',
                    c_tm: 0,
                    m_tm: 0
                },
                detail: {
                    nm: '',
                    expl: '',
                    c_tm: 0,
                    m_tm: 0
                }
            }
        },
        created() {
            this.fetch_data();
        },
        watch: {
            '$route': 'fetch_data',
        },
        computed: {
            cal_theId (){
                return this.is_add?'新增':this.$route.params.theId
            },
            can_submit (){
                // 未选择音频 or 句子/解释未改变
                if (this.is_add){
                    return this.sound_file == null || this.detail.nm === '' || this.detail.expl === '';
                }
                return this.sound_file == null
                    && this.detail.nm === this.old_detail.nm
                    && this.detail.expl === this.old_detail.expl;
            }
        },
        methods: {
            fetch_data (){
                let vue_ = this;
                let words_id = vue_.$route.params.theId;
                if (words_id === 'add') {
                    vue_.is_add = true;
                    vue_.detail = {
                        nm: '',
                        expl: '',
                        c_tm: 0,
                        m_tm: 0
                    };
                    vue_.old_detail = $.extend(true, {}, vue_.detail);
                    vue_.sound_file = null;
                    vue_.sound_name = '';
                    vue_.sound_path = ''
                }else {
                    vue_.is_add = false;
                    head_pendant.toggle_loading(true);
                    axios_pre({
                        url: '/api/get_detail',
                        method: 'post',
                        data: {
                            what: 'words',
                            id: words_id
                        }
                    }, (data) => {
                        if (data == null){
                            head_pendant.pop_data({state: 'warn', msg: '查无该词'});
                            return
                        }
                        vue_.detail = data;
                        vue_.old_detail = $.extend(true, {}, data);
                        vue_.sound_name = data.sound;
                        vue_.sound_path = '/static/mp3/'+data.sound;
                    }, {
                        complete: ()=>{
                            head_pendant.toggle_loading(false);
                        },
                        cancel: true
                    })
                }
            },
            go_back (){
                this.$router.push({name: 'words'})
            },
            get_words_text (txt){
                this.detail.nm = txt;
            },
            get_sound_file (e){
                let vue_ = this;
                let files = e.target.files;
                if (files.length){
                    let file = files[0];
                    if (file.size/1024**2 < 5){
                        vue_.sound_file = file;
                        vue_.sound_name = file.name;
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (e)=>{
                            vue_.sound_path = e.target.result;
                        }
                    }else{
                        head_pendant.pop_data({state: 'warn', msg: '音频需要小于5M'})
                    }
                }
            },
            get_expl_text (txt){
                this.detail.expl = txt;
            },
            submit (btn){
                let vue_ = this;
                let form = new FormData();
                form.append('id', this.cal_theId);
                form.append('nm', this.detail.nm);
                form.append('expl', this.detail.expl);
                form.append('sound', this.sound_file);
                axios_pre({
                    url: `/words/mdf_words`,
                    method: 'post',
                    data: form
                }, (data)=>{
                    head_pendant.pop_data({state: 'suc', msg: (vue_.is_add?'添加':'修改')+'成功'});
                    if (vue_.is_add){
                        vue_.$router.push({name: 'words_detail', params: {theId: data.id}});
                    }
                    vue_.fetch_data()
                }, {
                    complete: ()=>{
                        btn.completed();
                    },
                    cancel: true
                })
            },
            del_item (){
                if (!confirm('确定删除?')) return;
                let vue_ = this;
                let id = this.$route.params.theId;
                axios_pre({
                    url: '/b/del_item',
                    method: 'post',
                    data: {
                        what: 'words',
                        id: id
                    }
                }, (data)=>{
                    head_pendant.pop_data({state: 'suc', msg: '删除成功'});
                    vue_.go_back()
                })
            },
        }
    }
</script>

<style lang="scss">
    #-vue-words-detail{
        flex-direction: column;
        min-width: 50rem;
        >.words{
            width: 75%;
            textarea{
                background: rgb(64, 64, 64);
                color: white;
                padding: 0.6rem 0.3rem;
                font-size: 1.1rem;
                height: 1.1rem;
            }
        }
        >.sound{
            width: 75%;
            justify-content: flex-end;
            margin: 0.5rem 0 2rem 0;
            >span{
                font-size: 0.8rem;
            }
            >button{
                font-size: 0.9rem;
                line-height: 1rem;
                background: #63f1f1;
                margin: 0 1rem 0 0.4rem;
                &:hover{
                    background: #95ecf1;
                }
                >input{
                    display: none;
                }
            }
        }
        >.explain{
            width: 85%;
            textarea{
                min-height: 8rem;
                border: 1px solid #636363;
                font-size: 0.9rem;
                padding: 0.4rem 0.2rem;
                border-radius: 0.3rem;
                background: white;
            }
        }
        >button{
            margin: 1.5rem 0 1rem 0;
        }
    }
</style>