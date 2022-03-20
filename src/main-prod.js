import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
// 这里可以注释掉，在public/index.html中通过 CDN 加载 element-ui 的 js 和 css 样式
// import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入树形表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
// 通过
// import 'quill/dist/quill.core.css' // import styles
// import 'quill/dist/quill.snow.css' // for snow theme
// import 'quill/dist/quill.bubble.css' // for bubble theme

// 全局引入echarts，会导致加载变慢。可以按需导入，但是太麻烦懒得搞
import echarts from 'echarts'
Vue.prototype.$echarts = echarts


// 配置请求的根路径
axios.defaults.baseURL = 'http://192.168.1.5:8999/api/private/v1/'

// 对请求做预处理
axios.interceptors.request.use(config => {
  // 把token带到请求头中
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 固定写法，最后return config
  return config
})

// 挂载到Vue对象上，这样每一个组件都能直接访问到
Vue.prototype.$http = axios

// 富文本编辑器全局注册可用
Vue.use(VueQuillEditor)
Vue.config.productionTip = false

// 注册为全局可用组件
Vue.component('tree-table', TreeTable)

// 注册一个全局的过滤器
Vue.filter('dataFormat', function (originValue) {
  const dt = new Date(originValue)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}-${mm}-${ss}`
})
new Vue({
  // 配置路由器
  router,
  render: h => h(App)
}).$mount('#app')

