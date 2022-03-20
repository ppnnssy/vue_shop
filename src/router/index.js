import Vue from 'vue';
import Router from 'vue-router';
// import Login from '../components/Login.vue'
import Home from '../components/Home.vue';
// import Welcome from '../components/Welcome.vue'

// 使用import实现路由懒加载，同样webpackChunkName的模块会打包到同一个js文件中
const Users = () => import(/* webpackChunkName: 'ImportFuncDemo' */ '@/components/user/Users.vue');
const Rights = () => import(/* webpackChunkName: 'ImportFuncDemo' */ '@/components/power/Rights.vue');
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue';
import Cate from '../components/goods/Cate.vue';
import Params from '../components/goods/Params.vue';
import Goods from '../components/goods/Goods.vue';
import Add from '../components/goods/Add.vue';
import Order from '../components/order/Order.vue';
import Report from '../components/report/Report.vue';

// 全局挂载路由，使用Vue.$router访问
Vue.use(Router);

const router = new Router({
  routes: [
    { path: '/login', component: (resolve) => require(['@/components/Login'], resolve) },
    // 当/时自动跳转到login
    { path: '/', redirect: '/login' },
    {
      path: '/home',
      component: Home,
      // 重定向到welcome
      redirect: '/welcome',
      children: [
        // vue-router配置路由 , 使用vue的异步组件技术 , 可以实现按需加载 .
        // 但是,这种情况下一个组件生成一个js文件
        { path: '/welcome', component: (resolve) => require(['@/components/Welcome.vue'], resolve) },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },

        // webpack提供的require.ensure() 多个路由指定相同的chunkName，会合并打包成一个js文件。r就是resolve
        { path: '/roles', name: 'roles', component: (r) => require.ensure([], () => r(require('@/components/power/Roles.vue')), 'demo') },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: Goods },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report },
      ],
    },
  ],
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 访问登录页，直接放行，不需要权限
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // 如果token不存在,跳转到登录页
  if (!tokenStr) return next('/login');

  next();
});

export default router;
