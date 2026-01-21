import Vue from 'vue'
import App from '@/pages/Dashboard'
import router from '../router/index'
import '@/assets/fonts/style.css' // 增加iconfont字体
import axios from '../components/request/nvisualApi'
import '../style/common/scroller.styl'
import setGlobalSetting from '../components/request/globalSetting';
import storage from '@/utils/storage'
// 引入频道监听(监听其他页面退出后进行同步退出操作)
import '@/utils/BroadcastChannel.js'
// import store from '@/store/largeScreen.js'
storage.init()
Vue.prototype.$storage = storage
Vue.config.productionTip = false

// axios.setStore({ store })
setGlobalSetting(axios.axios).then(() => {
  new Vue({
    router,
    // store,
    render: h => h(App)
  }).$mount('#app')
})
