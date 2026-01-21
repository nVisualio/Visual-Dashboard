/**
 * 请求队列接口
 * 当token 失效后, 用rtoken去请求新的token, 当rtoken 失效后才真的触发退出操作
 * 当token 失效后, 用rtoken去拿新的token, 然后继续之前的请求
 */

// import { Message } from 'element-ui'
import methods from './methods'
import storage from '@/utils/storage'
// import store from '@/store'
import i18n from '@/i18n';

import { MessageBox } from 'element-ui';

const NvisualSDK = storage.local.getItem('NvisualSDK')
class TokenExceptionHandling {
  constructor(axios) {
    this.axios = axios
    this.isRefreshing = false // 是否正在刷新的标记
    this.requests = [] // 重试队列，每一项将是一个待执行的函数形式
    this._catchExceptionCallBack = null
  }

  verify(response, _catchExceptionCallBack) {
    this._catchExceptionCallBack = _catchExceptionCallBack
    const { code } = response.data
    // 有些接口没有标准返回结构, 所以这种情况没有code , 在没有code的情况下, 默认为成功
    if (response.config.url !== 'v1/refresh_token' && ((code && (code === 800304 || code === 800084)) || methods.requestCertification(response))) {
      // 说明token过期了,获取新的token.
      return this.response(response)
    } else {
      return response
    }
  }

  response(response) {
    // 接下来会在这里进行token过期的逻辑处理
    const config = response.config
    // 判断一下状态
    if (!this.isRefreshing) {
      // 修改状态，进入更新token阶段
      this.isRefreshing = true
      // 获取当前的请求
      return this.refreshToken().then(res => {
        this.setInformationAboutLoginStatus(res)
        if (res.code === 200) {
          return this.axios(config).finally(res => {
            // 已经刷新了token，将所有队列中的请求进行重试 reverse()
            this.requests.forEach(cb => cb())
            // 重试完了别忘了清空这个队列
            this.requests = []
          })
        }
      }).catch(res => {
        console.error(res);
        // store.commit('setLoadingStatus', false);
      }).finally(() => {
        // 完成之后在关闭状态
        this.isRefreshing = false
      })
    } else {
      // 正在刷新token，返回一个未执行resolve的promise
      return new Promise(resolve => {
        // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
        this.requests.push(token => {
          resolve(this.axios(config))
        })
      })
    }
  }

  _loginTimeout = true

  _login() {
    // 设置开发模式下,可以做如下操作
    if (process.env.NODE_ENV === 'development') {
      // 如果是开发环境, 则在请求报错后自动登录一次, 防止后台token失效引起跨域所造成的token不能重新获取的问题.
      if (window.location.hostname === 'dev.nvisual.com' && this._loginTimeout) {
        this._loginTimeout = false;
        this.refreshToken().then(res => {
          this.setInformationAboutLoginStatus(res)
        }).finally(r => {
          this.isRefreshing = false
          // store.commit('setLoadingStatus', false);
          setTimeout(() => {
            this._loginTimeout = true;
          }, 2000);
        })
      }
    }
  }

  setInformationAboutLoginStatus(res) {
    /**
     *  800083,"找不到刷新令牌"
        800086,"用户从另一台计算机登录"
        800082,"无效的刷新令牌"
        5123,"刷新令牌过期"
    */
    if (res.code === 200) {
      // 刷新token成功，将最新的token更新到header中，同时保存在localStorage中
      const token = {
        userToken: res.data.access_token,
        expires: new Date(res.data.expires),
        path: '/'
      }
      const refreshToken = {
        refreshToken: res.data.refresh_token,
        issued: res.data.issued,
        expires: res.data.expires,
        path: '/'
      }
      storage.local.setItem('token', token)
      storage.local.setItem('refreshToken', refreshToken) // 在token失效时,去请求新的token所使用的
      storage.local.setItem('power', res.data.authority)
      storage.local.setItem('userName', res.data.user)
      storage.local.setItem('userId', res.data.userId)
      storage.local.setItem('organization', res.data.organization)
    } else {
      const refreshTokens = storage.local.getItem('refreshToken')
      const oTimestamp = Date.parse(new Date(refreshTokens.issued)) // 原来的时间戳
      const nTimestamp = Date.parse(new Date()) // 最新的时间戳
      const howMuchTimeHasPassed = (nTimestamp - oTimestamp) / 1000 / 60 / 60 // 过去了多少时间
      // 如果过去了6个小时则不提示,直接跳转到登录页面 || // 如果是在跳转前就退户,也不提示用户,直接跳转到登录页面
      // console.error('refreshToken 过去了多少时间 -> howMuchTimeHasPassed: ', howMuchTimeHasPassed);
      if (window.location.pathname === '/' || howMuchTimeHasPassed > 6) {
        this._logOuts(res)
      } else {
        if (res.code === 800086) {
          MessageBox.alert(i18n.getTrans('notice', 'The user is logged in from another computer'), i18n.getTrans('notice', 'tip'), {
            confirmButtonText: i18n.getTrans('task', 'Logout'),
            type: 'warning',
            showClose: false,
            callback: action => {
              this._logOuts(res)
            }
          });
        } else {
          MessageBox.alert(i18n.getTrans('notice', 'Login timeout, need to login again'), i18n.getTrans('notice', 'tip'), {
            confirmButtonText: i18n.getTrans('task', 'Logout'),
            type: 'warning',
            showClose: false,
            callback: action => {
              this._logOuts(res)
            }
          });
        }
      }
    }
  }

  _logOuts(res) {
    // store.commit('setLoadingStatus', false);
    // 判断是否是sdk环境, 如果是且传递了退出操作的回调方法,则触发.
    if ((NvisualSDK === 1 || NvisualSDK === '1')) {
      this._catchExceptionCallBack && this._catchExceptionCallBack(res);
    } else {
      // 重新请求token失败，跳转到登录页
      methods.logOut()
    }
  }

  refreshToken() {
    return this.axios.post('v1/refresh_token').then(res => {
      storage.local.removeItem('userName')
      storage.local.removeItem('userId')
      storage.local.removeItem('token')
      storage.local.removeItem('power');
      return res.data;
    })
  }

  // 自动刷新
  autoRefreshToken(interval, cb) {
    setInterval(() => {
      this.refreshToken().then(res => {
        this.setInformationAboutLoginStatus(res)
        if (typeof cb === 'function') cb()
      })
    }, interval)
  }
}

export default TokenExceptionHandling
