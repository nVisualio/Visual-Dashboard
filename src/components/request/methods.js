
import storage from '@/utils/storage'
import logOutChannel from '@/utils/BroadcastChannel.js'
// import { version } from '../../../package.json'
import packageInfo from '../../../package.json'
// import { MessageBox, Message } from 'element-ui';
/**
 * token状态码的异常验证
 * 验证code 验证接口是否需要退出登录是否需要重新获取token
 * 1. token 错误,需要退出
 * 2. token 过期,需要重新获取token
 */
const requestCertification = (response) => {
  let message = ''
  if (typeof response?.data?.message === 'number') {
    response.data.message = response.data.message.toString()
  }
  message = (response?.data?.message?.split(':')) || ['200'];
  const tokenError = ['800305', '800084', '800306', '800086']
  // console.error('message', message, 'message[0].trim()', message[0].trim());
  if (tokenError.includes(message[0].trim()) || response.status === 207 || response.data.code === 5054) {
    return true; // 返回true 代表token只是过期,只需要重新获取token就好了
  } else {
    if (response.data.code === 'token 错误需要退出') {
      logOut();
    }
    return false;
  }
}

// 清空登录状态, 看情况是否跳转到登录页面
function logOut () {
  if (!['/access.html', '/SLA.html', '/regist.html', '/forgetPassword.html', '/resetPassword.html', '/share.html'].includes(window.location.pathname)) {
    storage.session.setItem('url', window.location.href)
    storage.local.removeItem('token')
    storage.local.removeItem('userId')
    storage.local.removeItem('userName')
    storage.local.removeItem('power')
    logOutChannel.logOutChannel.postMessage('false')

    setTimeout(() => {
      location.href = '/access.html?v=' + packageInfo.version;
    }, 1000);
  }
  storage.local.removeItem('token')
}

const getCodeMessage = () => {}

export default {
  requestCertification,
  getCodeMessage,
  logOut
}
