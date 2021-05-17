import Vue from 'vue'
import axios from "axios";
import cookie from 'vue-cookies';
import VueRouter from 'vue-router'

import Login from "../views/Login";
import Home from "../views/Home";
import WelCome from "../views/WelCome";
import Res from "../views/sys/Res";
import Role from "../views/sys/Role";
import Dept from "../views/sys/Dept";
import User from "../views/sys/User";
import LoginLog from "../views/log/LoginLog";
import OperationLog from "../views/log/OperationLog";
import Druid from "../views/monitor/Druid";
import NotFound from "../views/error/NotFound";
import SessionMonitor from "../views/monitor/SessionMonitor";
import TaskSchedule from "../views/monitor/TaskSchedule";

Vue.use(VueRouter);

const routes = [
    {
        path: '/login',
        name: '登陆',
        component: Login,
    },
    {
        path: '/',
        name: '首页',
        redirect: '/index',
        component: Home,
        meta: {requiresAuth: true}, // 都需要用户登陆，在前置守卫中判断
        children: [
            {
                path: '/index',
                name: '首页',
                component: WelCome
            },
            {
                path: '/sys/res',
                name: '资源管理',
                component: Res
            },
            {
                path: '/sys/role',
                name: '角色管理',
                component: Role
            },
            {
                path: '/sys/dept',
                name: '部门管理',
                component: Dept
            },
            {
                path: '/sys/user',
                name: '用户管理',
                component: User
            },
            {
                path: '/log/login',
                name: '登录日志',
                component: LoginLog
            },
            {
                path: '/log/operation',
                name: '操作日志',
                component: OperationLog
            },

            {
                path: '/monitor/druid',
                name: 'Druid监控',
                component: Druid
            },
            {
                path: '/monitor/session',
                name: 'Session监控',
                component: SessionMonitor
            },
            {
                path: '/monitor/task',
                name: '定时任务',
                component: TaskSchedule
            },
        ],
    },
    {
        path: '*',
        name: '404',
        component: NotFound
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

/**
 * 前置守卫，页面跳转前判断是否需要登陆。
 *
 * 不使用守卫也可以自动跳转login页面（axios全局配置跳转）
 * 如果要进入/sys/user，页面会先跳转到/sys/user页面，由于这个页面会加载请求，
 * 没有登陆的话请求会返回未登录的结果，axio全局配置才会跳转到login页面。
 *
 * 使用了前置守卫，会在进入/sys/user页面之前判断是否登陆过，不会先显示一下/sys/user这个页面，会直接跳转到login页面.
 *
 * 搭配cookie使用，这样就不会一直请求is_login的接口了
 */
router.beforeEach((to, from, next) => {
    // 如果路由routes中的meta信息中requiresAuth=true，则需要进行登陆验证
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (cookie.isKey("login")) { // 如果cookie中有login，则继续。login cookie是由is_login请求设置的
            next();
        } else { // 如果没有cookie则请求is_login，返回状态为true时则说明登陆过了
            axios.get("/is_login").then(res => {
                if (res.data.status) {
                    next();
                } // else可有可无，axios全局配置中已经将未登录的请求跳转到/login页面（main.js中axios全局配置）
                // else {
                //     next("/login");
                // }
            });
        }
    } else {
        next() // 确保一定要调用 next()
    }
});

export default router
