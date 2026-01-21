import code from '../../../../src/code';
import axios from 'axios'
import { Message } from 'element-ui'
import AES from '@/utils/aes.js';
import storage from '@/utils/storage'
import detectBrowser from '@/utils/detectBrowser'
import i18n from '@/i18n';
// import utils from '@/utils';
// import { version } from '../../package.json'
// 引入频道监听(监听其他页面退出后进行同步退出操作)
import logOutChannel from '@/utils/BroadcastChannel.js'
const demo = {
  data: {
    saas_login_userName: '', // 用户名input dom
    saas_login_password: '', // 密码input dom
    saas_login_submit: '', // 登录提交按钮 dom
    saas_login_forgetPassword: '', // 忘记密码的dom
    saas_login_resetButton: '', // 非管理员忘记密码提示的dom
    // login 登录参数
    userName: '',
    password: '',
  },

  init() {
    // if (!location.search.includes('')) {
    //   location.href = '/access.html';
    // }
    const browser = detectBrowser()
    if (!['Chrome', 'Edge'].includes(browser)) {
      alert(i18n.getTrans('access', 'nVisual only supports Chrome and Edge browsers'))
    }
    this.$code = code
    this.$message = Message
    this.$axios = axios
    this.data.saas_login_userName = document.getElementById('from_userName')
    // this.data.saas_login_password = document.getElementById('from_password')
    this.data.saas_login_password = document.getElementById('form_md5_password')
    this.data.saas_login_submit = document.getElementById('loginButton')
    this.data.saas_login_forgetPassword = document.getElementById('forgetPassword')
    this.data.saas_login_resetButton = document.getElementById('reseting')
    this.axiosInit() // axios 初始化
    this.bindingEvent() // 初始化绑定事件
    this.bgImg()
  },

  bindingEvent() {
    var _this = this;
    this.data.saas_login_submit.addEventListener('click', function () {
      _this.signStatus()
    })
    // this.data.saas_login_forgetPassword.addEventListener('click', function () {
    //   _this.forgetPassword()
    // })
    // this.data.saas_login_resetButton.addEventListener('click', function () {
    //   document.getElementById('reseting').style.display = 'none';
    // })
    // document.addEventListener('click', (e) => {
    //   let mainMenuClose = true
    //   e.path.forEach(dom => {
    //     if (dom === this.data.dom_passwordTr) {
    //       mainMenuClose = false
    //     }
    //   })
    //   if (mainMenuClose) {
    //     _this.data.dom_iconSuffix.style.visibility = 'hidden'
    //   }
    // })
    document.body.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        document.querySelector('#loginButton') && document.querySelector('#loginButton').click()
      }
    })
  },

  bgImg() {
    document.onvisibilitychange = () => {
      if (!document.hidden) {
        this.$axios.get('/v1/isOk2').then(r => {
          if (r.data === 'ok') {
            location.href = storage.session.get('url') || '/';
          }
        })
      }
    }
  },

  axiosInit() {
    if (process.env.NODE_ENV === 'development') {
      axios.defaults.baseURL = 'http://release.nvisual.com:6060/diagramApi/wapi/'
      localStorage.setItem('Nvisual_devModeApiUrl', axios.defaults.baseURL)
    } else if (process.env.NODE_ENV === 'production') {
      if (window.nvisualApi.diagramApiHost) {
        axios.defaults.baseURL = `${window.nvisualApi.diagramApiHost}/wapi/`
      } else {
        axios.defaults.baseURL = `//${location.host}/diagramApi/wapi/`
      }
    }
    // 请求超时设置
    axios.defaults.timeout = 10000000000
    axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
    axios.defaults.headers.post['Access-Control-Allow-Origin'] = location.origin
    axios.defaults.headers['Access-Control-Allow-Credentials'] = true
    // 请求拦截
    axios.interceptors.request.use(config => {
      // const token = JSON.parse(localStorage.getItem('token'))
      // config.headers.Authorization = `Bearer ${(token && token.userToken) || ''}`
      return config
    }, error => {
      // 请求error
      return Promise.reject(error)
    })
    var requestCertification = (response) => {
      const message = (response?.data?.message?.split(':')) || ['200'];
      const tokenError = ['800305', '800084', '800306']
      if (tokenError.includes(message[0].trim()) || response.status === 207) {
        if (window.location.pathname !== '/access.html') {
          storage.session.setItem('url', window.location.pathname)
          storage.local.removeItem('token')
          storage.local.removeItem('userId')
          storage.local.removeItem('userName')
          storage.local.removeItem('power')
          location.href = '/';
        }
        storage.local.removeItem('token')
      }
    }
    // 响应拦截
    axios.interceptors.response.use(response => {
      requestCertification(response)
      // 响应转发
      return response
    }, error => {
      // 响应error
      return Promise.reject(error)
    })
  },

  enrollment: false,
  signInDisabled: false,
  forgetPassword() {
    location.href = '/forgetPassword.html';
  },

  signStatus() {
    if (this.signInDisabled === false) {
      const that = this;
      that.signInDisabled = true;
      document.getElementById('loginButton').style.display = 'none'
      document.getElementById('loginingButton').style.display = 'block'
      // document.getElementById('loginButton').style.backgroundColor = '#eee'
      // document.getElementById('loginButton').style.color = '#11ac80'
      document.getElementById('loginButton').style.cursor = 'wait'
      this.signIn();
    }
  },

  reloginTimes: 50, // 重复登录次数
  reloginCounter: 0, // 重复登录计时器
  // 登录
  async signIn() {
    this.data.userName = this.data.saas_login_userName.value
    // 加密
    this.data.password = AES.encrypt(this.data.saas_login_password.value);
    if (this.data.userName && this.data.password) {
      this.loginStatus = false
      let onLoginMessage; // 消息提示
      // 如果不是第一次登录
      if (!this.reloginCounter) {
        onLoginMessage = this.$message({
          message: i18n.getTrans('accessTip', 'Signing in, please wait'),
          duration: 0
        })
      }

      const result = await this.$axios.post('/v1/authenticate', {
        username: this.data.userName,
        password: this.data.password
      }).then((r) => {
        this.signInDisabled = false
        // document.getElementById('loginButton').style.backgroundColor = '#11ac80'
        // document.getElementById('loginButton').style.color = '#fff'
        document.getElementById('loginButton').style.display = 'block'
        document.getElementById('loginingButton').style.display = 'none'
        document.getElementById('loginButton').style.cursor = 'pointer'
        this.loginStatus = true
        storage.local.removeItem('userName')
        storage.local.removeItem('userId')
        storage.local.removeItem('token')
        storage.local.removeItem('power')
        return r
      }).catch((e) => {
        // 是否是网络错误
        const isNetworkError = e.message === 'Network Error'
        this.loginStatus = true
        this.signInDisabled = false
        // document.getElementById('loginButton').style.backgroundColor = '#11ac80'
        // document.getElementById('loginButton').style.color = '#fff'
        document.getElementById('loginButton').style.display = 'block'
        document.getElementById('loginingButton').style.display = 'none'
        document.getElementById('loginButton').style.cursor = 'pointer'
        onLoginMessage?.close()

        // 显示持续时间
        const duration = 2000;
        // 如果是第一次登录
        if (!this.reloginCounter) {
          onLoginMessage = this.$message({
            message: i18n.getTrans('accessTip', 'Server error'),
            duration,
            type: 'error'
          })
          // 如果是网络错误
          if (isNetworkError) {
            setTimeout(() => {
              onLoginMessage = this.$message({
                message: i18n.getTrans('accessTip', 'Back-end program is starting, please wait.......'),
                duration: 0,
              })
            }, duration);
          }
        }

        // 如果计时器数值小于等于设定的次数
        if (this.reloginCounter <= this.reloginTimes) {
          this.reloginCounter++
          // 延时10秒再发送一次请求
          setTimeout(async () => {
            // 执行登录请求
            await this.signIn()
          }, 10000);
        }
      })
      // 如果返回为空则中断处理
      if (!result) return;
      onLoginMessage?.close()
      if ([5023, 5024, 200].includes(result.data.code)) {
        const token = {
          userToken: result.data.data.access_token,
          expires: new Date(result.data.expires),
          path: '/'
        }
        const refreshToken = {
          refreshToken: result.data.data.refresh_token, // It’s a token used to get a new access_token
          issued: result.data.data.issued, // Time where the token was created
          expires_in: result.data.data.expires_in, // Time of validity in milliseconds
          path: '/'
        }
        this.$message({
          message: `${result.data.data.user} ` + i18n.getTrans('accessTip', 'welcome back'),
          duration: 1000,
          type: 'success'
        })
        storage.local.setItem('token', token)
        storage.local.setItem('refreshToken', refreshToken) // 在token失效时,去请求新的token所使用的
        storage.local.setItem('power', result.data.data.authority)
        storage.local.setItem('userName', result.data.data.user)
        storage.local.setItem('userId', result.data.data.userId)
        storage.local.setItem('organization', result.data.data.organization)
        storage.local.setItem('defaultHomePage', 'project.html')
        logOutChannel.logOutChannel.postMessage('true')
        setTimeout(() => {
          location.href = '/index.html';
        }, 800)
      } else if (result.data.code === 5005) {
        this.$message({
          message: i18n.getTrans('accessTip', 'Wrong user name or password'),
          duration: 1000,
          type: 'error'
        })
      } else if ([5021, 800090, 5022].includes(result.data.code)) {
        // , 5023, 5024
        this.$message({
          message: this.$code.login[result.data.code],
          duration: 1000,
          type: 'error'
        })
        setTimeout(() => {
          location.href = '/setting.html?typeName=AuthSettings';
        }, 800)
      } else if (result.data.code === 5004) {
        // , 5023, 5024
        this.$message({
          message: i18n.getTrans('accessTip', 'The account has not been opened or expired, please contact the support personnel 400-716-8986'),
          duration: 3000,
          type: 'error'
        })
      } else if (result.data.code === 5054) {
        // , 5023, 5024
        this.$message({
          message: i18n.getTrans('accessTip', 'Please login again'),
          duration: 1000,
          type: 'error'
        })
      } else if (result.data.code === 5126) {
        // , 5023, 5024
        this.$message({
          message: i18n.getTrans('accessTip', 'The account has been locked. Please contact the administrator to open it'),
          duration: 1000,
          type: 'error'
        })
      } else if (result.data.code === 5110) {
        // , 5023, 5024
        this.$message({
          message: i18n.getTrans('accessTip', 'This user cannot log in, please contact the administrator'),
          duration: 1000,
          type: 'error'
        })
      } else {
        this.$message({
          message: i18n.getTrans('message', result.data.message),
          duration: 1000,
          type: 'error'
        })
      }
    } else {
      this.signInDisabled = false
      document.getElementById('loginButton').style.display = 'block'
      document.getElementById('loginingButton').style.display = 'none'
      // document.getElementById('loginButton').style.backgroundColor = '#11ac80'
      // document.getElementById('loginButton').style.color = '#fff'
      document.getElementById('loginButton').style.cursor = 'pointer'
      this.$message({
        message: i18n.getTrans('accessTip', 'Please check the user name and password input specification'),
        duration: 1000,
        type: 'warning'
      })
    }
  },

  // adjust_position() {
  //   if (document.getElementById('moveDiv') && document.getElementById('login_area') && document.getElementById('footer')) {
  //     const loginPosition = document.getElementById('login_area').getBoundingClientRect();
  //     if (loginPosition.top - 80 > 0) {
  //       document.getElementById('moveDiv').style.top = loginPosition.top - 80 + 'px'
  //     } else {
  //       document.getElementById('moveDiv').style.height = loginPosition.top - 30 + 'px'
  //       document.getElementById('moveDiv').style.top = 10 + 'px'
  //     }
  //     document.getElementById('footer').style.top = '75%'
  //     if (document.getElementById('footerCenter').getBoundingClientRect().top < loginPosition.bottom) {
  //       document.getElementById('footer').style.top = loginPosition.bottom + 20 + 'px'
  //       document.getElementById('footerCenter').style.height = window.screen.availHeight - loginPosition.bottom - 110 + 'px'
  //     } else if (document.getElementById('footerCenter').getBoundingClientRect().bottom > document.documentElement.clientHeight) {
  //       document.getElementById('footerCenter').style.height = document.documentElement.clientHeight - document.getElementById('footerCenter').getBoundingClientRect().top - 5 + 'px'
  //     }
  //   }
  // }
}

// window.onload = function() {
document.getElementById('loading').style.display = 'none'
demo.init()
// demo.adjust_position()
// };

// (function() {
//   document.getElementById('loading').style.display = 'none'
//   demo.init()
// })()
