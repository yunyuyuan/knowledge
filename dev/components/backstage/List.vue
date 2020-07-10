<template>
    <div id="-vue-list" class="top">
        <div class="wrap">
            <transition name="bounce-fade">
            <div class="-vue-list-list" v-show="at!=='detail'">
                <div class="search">
                    <label>
                        <input placeholder="搜索" v-model="search_s" @keyup.enter="fetch_list"/>
                    </label>
                    <button @click="fetch_list" class="src">搜索</button>
                    <button class="add" @click="go_add">新增</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <td v-for="item in cal_head_td" :key="item[0]" :class="{'dis': item[0]==='cover'}">
                                <div onclick="if (this.children.length>1)this.children[1].click()">
                                    <span>{{item[1]}}</span>
                                    <order-orient v-if="item[0]!=='cover'" :ref="item[0]" @event="change_orient" :order="item[0]" :size="0.6"></order-orient>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <router-link
                                v-for="item in list_data.list" :key="item.id"
                                :to="{name: at+'_detail', params: {theId: item.id}}" tag="tr"
                        >
                            <td>{{item.id}}</td>
                            <td class="name">
                                <span>{{item.nm}}</span>
                            </td>
                            <td v-if="at!=='words'&&at!=='detail'" class="cover">
                                <img :src="`/static/img/${at}/${item.cover}`"/>
                            </td>
                            <td class="time">
                                <div>
                                    <b>{{item.c_tm.split(' ')[0]}}</b>
                                    <span>{{item.c_tm.split(' ')[1]}}</span>
                                </div>
                            </td>
                            <td class="time">
                                <div>
                                    <b>{{item.m_tm.split(' ')[0]}}</b>
                                    <span>{{item.m_tm.split(' ')[1]}}</span>
                                </div>
                            </td>
                        </router-link>
                    </tbody>
                </table>
                <turn-page @event="turn_page" :now="now" :count="list_data.count" :show_count="5" :onepage_showcount="onePage_showCount"></turn-page>
            </div>
            </transition>
            <transition name="bounce-fade">
            <router-view v-show="at==='detail'"></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
    import OrderOrient from "@components/pendant/OrderOrient.vue";
    import TurnPage from "@components/pendant/TurnPage.vue";

    export default {
        name: "List",
        components: {TurnPage, OrderOrient},
        data() {
            return {
                at: 'words',
                onePage_showCount: 10,
                now: 1,
                list_data: {
                    count: 0,
                    list: []
                },
                order: ['id', ''],
                search_s: ''
            }
        },
        watch: {
            '$route': 'change_route'
        },
        mounted (){
            this.change_route()
        },
        computed: {
            cal_head_td (){
                if (this.at === 'words'){
                    return [['id','ID'],['nm','名称'],['c_tm','创建时间'],['m_tm','修改时间']]
                }
                return [['id','ID'],['nm','名称'],['cover','封面'],['c_tm','创建时间'],['m_tm','修改时间']]
            }
        },
        methods: {
            change_route (){
                if (this.$route.name.search(/^(words|book|film)$/) !== -1){
                    this.now = 1;
                    this.list_data = {count: 0, list: []};
                    this.order = ['id', ''];
                    for (let i of ['id', 'nm', 'c_tm', 'm_tm']){
                        if (this.$refs[i]) this.$refs[i][0].reset();
                    }
                    this.search_s = '';
                    this.at = this.$route.name;
                    this.fetch_list()
                }else {
                    this.at = 'detail'
                }
            },
            fetch_list (){
                let vue_ = this;
                head_pendant.toggle_loading(true);
                axios_pre({
                    url: `/api/get_list`,
                    method: 'post',
                    data: {
                        what: vue_.at,
                        s: vue_.search_s,
                        page: vue_.now-1,
                        count: vue_.onePage_showCount,
                        order: vue_.order[0],
                        desc: vue_.order[1]
                    }
                }, (data)=>{
                    vue_.list_data = data;
                }, {
                    complete: ()=>{
                        head_pendant.toggle_loading(false);
                    },
                    cancel: true
                })
            },
            turn_page (p){
                this.now = p;
                this.fetch_list()
            },
            change_orient (payload){
                for (let i of ['id', 'nm', 'c_tm', 'm_tm']){
                    if (payload[0] !== i) this.$refs[i][0].reset();
                }
                this.order = payload;
                this.fetch_list();
            },
            go_add (){
                this.$router.push({name: this.at+'_detail', params: {theId: 'add'}})
            },
        }
    }
</script>

<style lang="scss">
    @import "views/public";
    #-vue-list{
        >.wrap{
            position: relative;
            background: rgb(245, 245, 245);
            box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.65);
            border-radius: 0.2rem;
            padding: 2rem 4rem;
            flex-direction: column;
            >.-vue-list-list{
                flex-direction: column;
                $table-width: 50rem;
                >.search{
                    width: $table-width;
                    >label{
                        border: 1px solid #b8b8b8;
                        background: #e8e8e8;
                        border-radius: 0.3rem;
                        display: flex;
                        align-items: center;
                        &:before{
                            font-family: $--iconfont;
                            content: $--i-search;
                            font-size: 1.1rem;
                            color: #464646;
                            padding: 0 0.45rem;
                            border-right: 1px solid #8c8c8c;
                        }
                        >input {
                            width: 15rem;
                            border: none;
                            border-radius: inherit;
                            background: transparent;
                            padding: 0.35rem 0.2rem;
                            font-size: 0.9rem;
                        }
                    }
                    >.src{
                        margin-left: 0.5rem;
                        background: #ffd89a;
                        border: 1px solid #ff995f;
                        &:hover{
                            background: #ffdeb5;
                        }
                    }
                    >.add{
                        margin: 0 1rem 0 auto;
                        background: #6c04ff;
                        border: 1px solid #1303ff;
                        color: white;
                        display: flex;
                        align-items: center;
                        font-size: 1rem;
                        &:before{
                            color: #9cff90;
                            font-family: $--iconfont;
                            content: $--i-add;
                            font-size: 1.2rem;
                            margin-right: 0.4rem;
                            font-weight: bold;
                        }
                        &:hover{
                            background: #7c36ff;
                        }
                    }
                }
                >table{
                    width: $table-width;
                    margin-top: 1rem;
                    border: 1px solid gray;
                    border-collapse: collapse;
                    tr{
                    }
                    td{
                        text-align: center;
                    }
                    >thead{
                        background: rgb(48, 48, 48);
                        tr{
                            color: white;
                            font-size: 1.05rem;
                        }
                        td{
                            &:not(.dis){
                                cursor: pointer;
                            }
                            padding: 0.65rem 0.5rem;
                            border-right: 1px solid #a5a5a5;
                            >div{
                                justify-content: center;
                                word-break: keep-all;
                                >span{
                                    margin: 0 auto;
                                }
                                >.-vue--order-orient{
                                    margin: 0 0.3rem;
                                }
                            }
                        }
                    }
                    >tbody{
                        background: aliceblue;
                        tr{
                            border-bottom: 1px solid #b3b3b3;
                            cursor: pointer;
                            font-size: 0.9rem;
                            &:hover{
                                background: #cbe7ff;
                            }
                        }
                        td{
                            padding: 0.5rem 0;
                            border-right: 1px solid gray;
                            font-size: 0.95rem;
                            &.name >span{
                                font-weight: bold;
                                word-break: break-all;
                                @include text-overflow(4);
                            }
                            &.cover{
                                >img{
                                    width: 7rem;
                                    height: 7rem;
                                    object-fit: contain;
                                    background: white;
                                    border: 1px solid #acacac;
                                }
                            }
                            &.time{
                                font-size: 0.75rem;
                                >div{
                                    margin: 0 0.4rem;
                                    flex-direction: column;
                                    justify-content: center;
                                    >b,>span{
                                        white-space: nowrap;
                                    }
                                    >b{
                                        margin-bottom: 0.5rem;
                                        font-size: 1.05em;
                                    }
                                }
                            }
                        }
                    }
                }
                >.-vue--turn-page{
                    margin-top: 1.5rem;
                }
            }
        }
    }
</style>