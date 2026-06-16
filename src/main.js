import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

Vue.config.productionTip = false

// 尝试恢复登录状态
store.dispatch('restoreLogin')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')