// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueMaterial from 'vue-material'
import store from './vuex/store'

Vue.config.productionTip = false

Vue.use(VueMaterial)

Vue.material.registerTheme('default', {
  primary: 'lime',
})

/* eslint-disable no-new */
new Vue({
  store,
  el: '#app', 
  router,
  template: '<App/>',
  components: { App }
})
