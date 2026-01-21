import Vue from 'vue'
import axios from 'axios'
import storage from '@/utils/storage'
import rulParamsDataHelper from '@/utils/getURLParamsData'
// import methods from './methods'
import TokenExceptionHandling from './tokenExceptionHandling.js'
const tokenExceptionHandlingInstance = new TokenExceptionHandling(axios);
const urlParamsData = rulParamsDataHelper.getSearchParamsJSON();
// 创建一个实例
// const axios = oAxios.create()

// 以下为axios的全局设置
Vue.prototype.$axios = axios
// 设置请求的baseurl 分为开发模式和生产模式
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = storage.local.getItem('devModeApiUrl') || 'http://release.nvisual.com:8080/wapi/'
} else if (process.env.NODE_ENV === 'production') {
  if (window.nvisualApi?.diagramApiHost) {
    axios.defaults.baseURL = `${window.nvisualApi.diagramApiHost}/wapi/`
  } else {
    axios.defaults.baseURL = `//${location.host}/diagramApi/wapi/`
  }
}

// 请求超时设置
axios.defaults.timeout = 10000000000

// 设置post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
// axios.defaults.headers.post['Access-Control-Allow-Origin'] = 'http://dev.nvisual.com'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.common['Access-Control-Allow-Methods'] = '*'
axios.defaults.headers.common['Access-Control-Allow-Headers'] = '*'
axios.defaults.headers['Access-Control-Allow-Credentials'] = true

// 请求拦截
axios.interceptors.request.use(
  config => {
    const isShare = urlParamsData.get('isShare');
    let token = storage.local.getItem('token');
    let refreshToken = storage.local.getItem('refreshToken');

    if (isShare) {
      token = storage.local.getItem('shareToken');
      refreshToken = storage.local.getItem('shareRefreshToken')
      window.nvisual.isShare = true;
    }
    config.headers.Authorization = `Bearer ${(token && token.userToken) || ''}`;
    config.headers['Refresh-Token'] = (refreshToken && refreshToken.refreshToken) || '';
    if (vuex?.state.socketConnection.connecting) {
      config.headers.socketUuid = vuex.state.socketConnection.connection._connection.uuid;
    }
    // 请求转发
    return config
  }, error => {
    // 请求error
    return Promise.reject(error)
  }
)

// 响应拦截
axios.interceptors.response.use(response => {
  return tokenExceptionHandlingInstance.verify(response)
}, error => {
  // 响应error
  if (error.message !== 'cancel') {
    tokenExceptionHandlingInstance._login()
  }
  return Promise.reject(error)
})

let vuex
export default {
  setStore: ({ store }) => {
    vuex = store
  },
  axios
}
