import Vue from 'vue'
import App from './App.vue'
import router from './router'

import axios from 'axios';
import moment from 'moment'
import element from 'element-ui';
import VueCookies from 'vue-cookies'

import util from "./js/util";

Vue.use(VueCookies);
Vue.prototype.$axios = axios;
Vue.prototype.$moment = moment;
Vue.prototype.$util = util;

Vue.config.productionTip = false

/** axios全局配置 */
// axios.defaults.baseURL = 'http://management.2cci.cn/api';
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

/**
 * axios全局拦截，如果返回结果为30001未登录则跳转到/login
 * 如果服务器返回异常则使用elementui的message提示系统异常
 */
axios.interceptors.response.use(
    res => {
        if (res.data.code === 30001) {
            if (router.currentRoute.fullPath !== "/login") {
                router.push("/login");
            }
        } else if (!res.data.status) {
            element.Message.error(res.data.msg);
        }
        return res;
    },
    err => {
        element.Message.error("系统异常")
        return Promise.reject(err);
    });

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
