<template>
    <div id="-vue-film-detail">
        <del class="back" @click="go_back"></del>
        <a class="the-id" :href="'/film'+(is_add?'':'?id='+cal_theId)" target="_blank">
            ID:<b>{{cal_theId}}</b>
        </a>
        <div class="body">
            <auto-textarea class="name" placeholder="影名" @event="get_name" :value="detail.nm"></auto-textarea>
            <div class="cover" onclick="this.querySelector('input').click()">
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
            <div class="poster">
                <div v-for="(poster,idx) in posters" :key="poster.id" :data-id="poster.id">
                    <div>
                        <span class="left" @click="move_poster(idx, 'l')"></span>
                        <span class="del" @click="del_poster(idx)"></span>
                        <span class="right" @click="move_poster(idx, 'r')"></span>
                    </div>
                    <img :src="poster.url"/>
                </div>
                <input type="file" accept="image/*" @input="get_poster"/>
                <button onclick="this.previousElementSibling.click()">剧照</button>
                <b v-show="posters.length<3">(最少3张剧照)</b>
            </div>
            <div class="summary">
                <auto-textarea placeholder="简介" @event="get_summary" :value="detail.summary"></auto-textarea>
            </div>
            <div class="think">
                <auto-textarea placeholder="观后感" @event="get_expl" :value="detail.expl"></auto-textarea>
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
        summary: '',
        expl: '',
        c_tm: 0,
        m_tm: 0
    };
    let default_info = [
        {id: 0, key: '原片名', val: ''},
        {id: 1, key: '导演', val: ''},
        {id: 2, key: '编剧', val: ''},
        {id: 3, key: '演员', val: ''},
        {id: 4, key: '年份', val: ''},
        {id: 5, key: '片长', val: ''},
        {id: 6, key: '国家', val: ''},
    ];
    export default {
        name: "FilmDetail",
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
                posters: [],
                old_posters: []
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
                        && this.check_valid('expl')
                        && this.posters.length>2)
                }
                // info有改变
                if (this.info.length !== this.old_info.length) return false;
                for (let i=0;i<this.info.length;i++){
                    if (this.info[i].key !== this.old_info[i].key || this.info[i].val !== this.old_info[i].val){
                        return false
                    }
                }
                // posters有改变
                if (this.posters.length !== this.old_posters.length) return false;
                for (let i=0;i<this.posters.length;i++){
                    if (this.posters[i].url !== this.old_posters[i].url){
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
                let film_id = vue_.$route.params.theId;
                if (film_id === 'add') {
                    vue_.is_add = true;
                    vue_.detail = $.extend(true, {}, default_detail);
                    vue_.old_detail = $.extend(true, {}, default_detail);
                    vue_.cover_file = null;
                    vue_.cover_path = '';
                    vue_.cover_url = '';
                    vue_.posters = []
                }else {
                    vue_.is_add = false;
                    head_pendant.toggle_loading(true);
                    axios_pre({
                        url: '/api/get_detail',
                        method: 'post',
                        data: {
                            what: 'film',
                            id: film_id
                        }
                    }, (data) => {
                        if (data == null) {
                            head_pendant.pop_data({state: 'warn', msg: '查无该影视'});
                            return
                        }
                        data.info = JSON.parse(data.info);
                        data.info.forEach((e, idx) => {
                            e.id = idx;
                        });
                        vue_.info = data.info;
                        vue_.old_info = $.extend(true, [], data.info);
                        delete data.info;
                        // poster
                        data.posters = JSON.parse(data.posters);
                        vue_.posters = [];
                        data.posters.forEach((e, idx) => {
                            vue_.posters.push({
                                id: idx,
                                file: null,
                                url: '/static/img/film/'+e
                            })
                        });
                        vue_.old_posters = $.extend(true, [], vue_.posters);
                        delete data.posters;
                        vue_.detail = data;
                        vue_.old_detail = $.extend(true, {}, data);
                        vue_.cover_path = '/static/img/film/'+data.cover;
                    }, ()=>{
                        head_pendant.toggle_loading(false);
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
            get_poster (e){
                let list = this.posters;
                let ipt = e.target;
                let files = ipt.files;
                if (files.length){
                    let file = files[0];
                    if (file.size/1024**2 < 5){
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = (e)=>{
                            let max = 0;
                            for (let i of list){
                                if (i.id > max){
                                    max = i.id
                                }
                            }
                            // 计算比例
                            let img = new Image(),
                                url = e.target.result;
                            img.src = url;
                            img.onload = ()=>{
                               list.push({
                                    id: max+1,
                                    file: file,
                                    url: url,
                                    scale: img.width/img.height
                                })
                            }
                        }
                    }else{
                        head_pendant.pop_data({state: 'warn', mag: '图片需小于5M'})
                    }
                }
            },
            del_poster (e){
                this.posters.splice(e, 1)
            },
            move_poster (idx, to){
                let posters = this.posters;
                if (to === 'l'){
                    if (idx > 0){
                        let temp = posters[idx];
                        posters.splice(idx, 1);
                        posters.splice(idx-1, 0, temp)
                    }
                }else{
                    if (idx < posters.length-1){
                        let temp = posters[idx];
                        posters.splice(idx, 1);
                        posters.splice(idx+1, 0, temp)
                    }
                }
            },
            get_expl (s){
                this.detail.expl = s;
            },
            submit (btn){
                let vue_ = this;
                let form = new FormData();
                for (let s of ['nm', 'summary', 'expl']){
                    form.append(s, this.detail[s]);
                }
                form.append('id', this.cal_theId);
                let new_info = [];
                this.info.filter((e)=>{
                    new_info.push({key: e.key, val: e.val})
                });
                form.append('info', JSON.stringify(new_info));
                form.append('cover', this.cover_file);
                let poster_list = [];
                this.posters.forEach((e, i)=>{
                    if (e.file != null) {
                        poster_list.push('poster_' + i +'_' + e.scale);
                        form.append('poster_' + i + '_' + e.scale, e.file)
                    }else{
                        poster_list.push(e.url.replace('/static/img/film/', ''))
                    }
                });
                form.append('poster_list', JSON.stringify(poster_list));
                axios_pre({
                    url: `/film/mdf_film`,
                    method: 'post',
                    data: form
                }, (data)=>{
                    head_pendant.pop_data({state: 'suc', msg: (vue_.is_add?'添加':'修改')+'成功'});
                    if (vue_.is_add){
                        vue_.$router.push({name: 'film_detail', params: {theId: data.id}});
                    }
                    vue_.fetch_data()
                }, ()=>{
                    btn.completed();
                })
            },
            go_back (){
                this.$router.push({name: 'film'})
            }
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    #-vue-film-detail{
        width: 55rem;
        flex-direction: column;
        >.body{
            width: 100%;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start;
            >textarea.name{
                width: 75%;
                margin-bottom: 2rem;
                background: rgb(64, 64, 64);
                color: white;
                padding: 0.8rem 0.5rem;
                font-size: 1.1rem;
                height: 1.1rem;
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
            >.poster{
                flex-wrap: wrap;
                width: 100%;
                margin: 2rem 0 1rem 0;
                >div{
                    margin: 0.6rem 1rem;
                    position: relative;
                    flex-direction: column;
                    >div{
                        width: 100%;
                        justify-content: space-around;
                        margin-bottom: 0.2rem;
                        >span{
                            cursor: pointer;
                            &:before{
                                font-family: $--iconfont;
                                font-size: 1.2rem;
                                display: block;
                            }
                            &.left, &.right{
                                &:hover:before{
                                    color: #2d49ff;
                                }
                                &:before{
                                    content: $--i-tri;
                                    color: #6587ff;
                                    transform: rotate(-90deg);
                                }
                            }

                            &.del:before{
                                content: $--i-del;
                                color: #ff3c3a;
                            }
                            &.right:before{
                                transform: rotate(90deg);
                            }
                        }
                    }
                    >img{
                        background: white;
                        border: 1px solid #b5b5b5;
                        width: 7rem;
                        height: 5rem;
                        object-fit: contain;
                    }
                }
                >input{
                    display: none;
                }
                >button{
                    background: #0072ff;
                    box-shadow: 0 0 0.6rem #00adffa1;
                    color: white;
                    padding: 0.4rem 0.9rem;
                    font-size: 0.98rem;
                    display: flex;
                    align-items: center;
                    &:hover{
                        background: #4594ff;
                    }
                    &:before{
                        font-family: $--iconfont;
                        content: $--i-add;
                        font-size: 1.4rem;
                        margin-right: 0.4rem;
                    }
                }
                >b{
                    color: #ff3f43;
                    font-size: 0.75rem;
                    margin-left: 0.5rem;
                ;
                }
            }
            >.think{
                width: 95%;
                margin: 1rem 0;
                position: relative;
                &:before{
                    content: '观后感';
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