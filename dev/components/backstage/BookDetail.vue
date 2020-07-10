<template>
    <div id="-vue-book-detail">
        <del class="back" @click="go_back"></del>
        <button class="del_item" v-show="!is_add" @click="del_item">删除</button>
        <a class="the-id" :href="'/book'+(is_add?'':'?id='+cal_theId)" target="_blank">
            ID:<b>{{cal_theId}}</b>
        </a>
        <div class="body">
            <div class="name">
                <auto-textarea placeholder="书名" @event="get_name" :value="detail.nm"></auto-textarea>
                <input placeholder="作者" v-model="detail.author"/>
            </div>
            <div class="cover" onclick="this.querySelector('input').click()" title="选择封面">
                <img v-show="cover_url || cover_path" :src="cover_url || cover_path"/>
                <div v-show="!cover_file && !cover_path">
                    <span>上传封面</span>
                </div>
                <input type="file" accept="image/*" @change="choose_cover"/>
            </div>
            <div class="info">
                <div v-for="(item,idx) in info" :key="item.id">
                    <auto-textarea class="key" placeholder="属性名" :value="item.key" :data-idx="idx"
                                   @event="get_info_key"></auto-textarea>
                    <auto-textarea class="val" placeholder="属性值" :value="item.val" :data-idx="idx"
                                   @event="get_info_val"></auto-textarea>
                    <span @click="del_info(idx)"></span>
                </div>
                <button @click="add_info">添加</button>
            </div>
            <div class="summary">
                <auto-textarea placeholder="简介" @event="get_summary" :value="detail.summary"></auto-textarea>
            </div>
            <div class="think">
                <auto-textarea placeholder="读后感" @event="get_expl" :value="detail.expl"></auto-textarea>
            </div>
            <upload-button @event="submit" :disabled="can_submit">{{is_add?'添加':'修改'}}</upload-button>
        </div>
    </div>
</template>

<script>
    import AutoTextarea from "@components/pendant/AutoTextarea.vue";
    import PlaySound from "@components/pendant/PlaySound.vue";
    import UploadButton from "@components/pendant/UploadButton.vue";
    import $ from '@vendor/jquery_vendor'
    let default_detail = {
        nm: '',
        author: '',
        summary: '',
        expl: '',
        c_tm: 0,
        m_tm: 0
    };
    let default_info = [
        {id: 0, key: '出版社', val: ''},
        {id: 1, key: '原作名', val: ''},
        {id: 2, key: '译者', val: ''},
        {id: 3, key: '年份', val: ''},
        {id: 4, key: '字数', val: ''},
        {id: 5, key: 'ISBN', val: ''},
    ];
    export default {
        name: "BookDetail",
        components: {UploadButton, PlaySound, AutoTextarea},
        data (){
            return {
                is_add: false,
                cover_file: null,
                cover_path: '',
                cover_url: '',
                old_detail: $.extend(true, {}, default_detail),
                detail: $.extend(true, {}, default_detail),
                info: $.extend(true, [], default_info),
                old_info: $.extend(true, [], default_info),
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
                if (this.is_add){
                    return !(this.cover_file != null
                        && this.check_valid('nm')
                        && this.check_valid('author')
                        && this.check_valid('summary')
                        && this.check_valid('expl'))
                }
                // info有改变
                if (this.info.length !== this.old_info.length) return false;
                for (let i=0;i<this.info.length;i++){
                    if (this.info[i].key !== this.old_info[i].key || this.info[i].val !== this.old_info[i].val){
                        return false
                    }
                }
                // 空值
                if (!this.check_valid('nm') || !this.check_valid('author') || !this.check_valid('summary') || !this.check_valid('expl')) return true;
                // 有改变
                return !(this.cover_file != null
                    || !this.check_dup('nm')
                    || !this.check_dup('author')
                    || !this.check_dup('summary')
                    || !this.check_dup('expl'))
            }
        },
        methods: {
            check_valid (s){
                return this.detail[s] !== ''
            },
            check_dup (s){
                return this.detail[s] === this.old_detail[s]
            },
            fetch_data (){
                let vue_ = this;
                let book_id = vue_.$route.params.theId;
                if (book_id === 'add') {
                    vue_.is_add = true;
                    vue_.detail = $.extend(true, {}, default_detail);
                    vue_.old_detail = $.extend(true, {}, default_detail);
                    vue_.info = $.extend(true, [], default_info);
                    vue_.old_info = $.extend(true, [], default_info);
                    vue_.cover_file = null;
                    vue_.cover_path = '';
                    vue_.cover_url = ''
                }else {
                    vue_.is_add = false;
                    head_pendant.toggle_loading(true);
                    axios_pre({
                        url: '/api/get_detail',
                        method: 'post',
                        data: {
                            what: 'book',
                            id: book_id
                        }
                    }, (data) => {
                        if (data == null){
                            head_pendant.pop_data({state: 'warn', msg: '查无该书籍'});
                            return
                        }
                        data.info = JSON.parse(data.info);
                        data.info.filter((e, i)=>{
                            e.id = i;
                        });
                        vue_.info = data.info;
                        vue_.old_info = $.extend(true, [], data.info);
                        delete data.info;
                        vue_.detail = data;
                        vue_.old_detail = $.extend(true, {}, data);
                        vue_.cover_path = '/static/img/book/'+data.cover;
                    }, {
                        complete: ()=>{
                            head_pendant.toggle_loading(false);
                        },
                        cancel: true
                    })
                }
            },
            get_name (s){
                this.detail.nm = s;
            },
            choose_cover (e){
                let vue_ = this;
                let files = e.target.files;
                if (files.length>0){
                    let file = files[0];
                    if (file.size/1024**2 < 5){
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (e)=>{
                            vue_.cover_file = file;
                            vue_.cover_url = e.target.result;
                        }
                    }else{
                        head_pendant.pop_data({state: 'warn', msg: '图片需小于5M'})
                    }
                }
            },
            get_info_key (s, e){
                this.info[+e.getAttribute('data-idx')].key = s;
            },
            get_info_val (s, e){
                this.info[+e.getAttribute('data-idx')].val = s;
            },
            add_info (){
                let max = 0;
                this.info.filter((e)=>{
                    if (e.id > max){
                        max = e.id;
                    }
                });
                this.info.push({id: max+1,key: '', val: ''})
            },
            del_info (idx){
                this.info.splice(idx, 1);
            },
            get_summary (s){
                this.detail.summary = s;
            },
            get_expl (s){
                this.detail.expl = s;
            },
            submit (btn){
                let vue_ = this;
                let form = new FormData();
                for (let s of ['nm', 'author', 'summary', 'expl']){
                    form.append(s, this.detail[s]);
                }
                form.append('id', this.cal_theId);
                let new_info = [];
                this.info.filter((e)=>{
                    new_info.push({key: e.key, val: e.val})
                });
                form.append('info', JSON.stringify(new_info));
                form.append('cover', this.cover_file);
                axios_pre({
                    url: `/book/mdf_book`,
                    method: 'post',
                    data: form
                }, (data)=>{
                    head_pendant.pop_data({state: 'suc', msg: (vue_.is_add?'添加':'修改')+'成功'});
                    if (vue_.is_add){
                        vue_.$router.push({name: 'book_detail', params: {theId: data.id}});
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
                        what: 'book',
                        id: id
                    }
                }, (data)=>{
                    head_pendant.pop_data({state: 'suc', msg: '删除成功'});
                    vue_.go_back()
                })
            },
            go_back (){
                this.$router.push({name: 'book'})
            }
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    #-vue-book-detail{
        width: 55rem;
        flex-direction: column;
        >.body{
            width: 100%;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start;
            >.name{
                width: 75%;
                align-items: center;
                margin-bottom: 2rem;
                justify-content: space-between;
                >textarea{
                    width: calc(90% - 5rem);
                    background: rgb(64, 64, 64);
                    color: white;
                    padding: 0.8rem 0.5rem;
                    font-size: 1.1rem;
                    height: 1.1rem;
                }
                >input{
                    width: 5rem;
                    font-size: 0.9rem;
                    padding: 0.4rem;
                    border-radius: 0;
                    &:focus{
                        border-color: #ff9f41;
                    }
                }
            }
            >.cover,>.info{
                margin: 0 2.5%;
            }
            >.cover{
                width: 30%;
                height: 20rem;
                position: relative;
                cursor: pointer;
                border-radius: 0.4rem;
                >img{
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    background: white;
                    border: 1px solid gray;
                    border-radius: inherit;
                }
                >div{
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    border-radius: inherit;
                    top: 0;
                    left: 0;
                    justify-content: center;
                    border: 1px solid gray;
                    >span{

                    }
                }
                >input{
                    display: none;
                }
            }
            >.info{
                width: 60%;
                flex-direction: column;
                >div{
                    width: 100%;
                    margin-bottom: 1rem;
                    justify-content: space-between;
                    >textarea{
                        padding: 0.6rem;
                        margin: 0 auto;
                        &.key{
                            width: 20%;
                            font-size: 0.9rem;
                            text-align: center;
                            height: 1rem;
                            background: #c0f9ff;
                        }
                        &.val{
                            font-size: 0.8rem;
                            width: 60%;
                            height: 0.88rem;
                        }
                    }
                    >span{
                        margin-right: auto;
                        cursor: pointer;
                        &:before{
                            font-family: $--iconfont;
                            content: $--i-del;
                            font-size: 1.2rem;
                            color: red;
                        }
                    }
                }
                >button{
                    font-size: 0.96rem;
                    background: #6cf99f;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.35), 0 0 0.8rem rgba(255, 255, 255, 0.7) inset;
                    border: 1px solid #87bdff;
                    &:before{
                        margin-right: 0.6rem;
                        font-family: $--iconfont;
                        content: $--i-add;
                        font-size: 1.3rem;
                        color: #0008ff;
                    }
                    &:hover{
                        background: #99f9b9;
                    }
                }
            }
            >.summary{
                width: 95%;
                margin: 1rem 0;
                >textarea{
                    width: 100%;
                    padding: 0.6rem 0.3rem;
                    font-size: 0.9rem;
                    min-height: 6rem;
                }
            }
            >.think{
                width: 95%;
                margin: 1rem 0;
                position: relative;
                &:before{
                    content: '读后感';
                    position: absolute;
                    top: 0;
                    left: 1rem;
                    transform: translateY(-75%);
                    padding: 0.15rem 0.6rem;
                    font-size: 0.65rem;
                    background: #ffe3d1;
                    border: 1px solid #ff9b54;
                }
                >textarea{
                    width: 100%;
                    padding: 1rem 0.3rem 0.6rem 0.3rem;
                    font-size: 0.88rem;
                    min-height: 5rem;
                }
            }
            >button{
                margin-top: 1rem;
            }
        }
    }
</style>