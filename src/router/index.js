import Vue from 'vue'
// 已在public/index中导入vue-router，不能在这里重复导入了
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import Goods from '../components/goods/Goods.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

// 全局挂载路由，使用Vue.$router访问
Vue.use(Router)

const router = new Router({
    routes: [
        { path: "/login", component: Login },
        // 当/时自动跳转到login
        { path: '/', redirect: '/login' },
        {
            path: '/home',
            component: Home,
            // 重定向到welcome
            redirect: '/welcome',
            children: [
                { path: '/welcome', component: Welcome },
                { path: '/users', component: Users },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Roles },
                { path: '/categories', component: Cate },
                { path: '/params', component: Params },
                { path: '/goods', component: Goods, },
                { path: '/goods/add', component: Add },
                { path: '/orders', component: Order },
                { path: '/reports', component: Report },
            ]
        },

    ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // 访问登录页，直接放行，不需要权限
    if (to.path === '/login') return next()
    // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    // 如果token不存在,跳转到登录页
    if (!tokenStr) return next('/login')

    next()
})

export default router