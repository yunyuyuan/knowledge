import Vuex from 'vuex'
import Vue from 'vue';

Vue.use(Vuex);

let store = new Vuex.Store({
    modules: {
        backstage: {
            namespaced: true,
            state: ()=>{
                return {
                }
            },
            getters: {
            },
            mutations: {
            }
        }
    }
});
export default store