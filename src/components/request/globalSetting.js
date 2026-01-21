// import checkUpdate from '@/version/check'
// import axios from 'axios';
import storage from '@/utils/storage'
import rulParamsDataHelper from '@/utils/getURLParamsData'
import logOutChannel from '@/utils/BroadcastChannel.js'
// import Jasypt from 'jasypt';
import AES from '@/utils/aes.js';
import { version } from '../../../package.json';

const setGlobalSetting = async (axios) => {
  // ***** 免登录业务
  const query = location.search;
  const urlParamsData = rulParamsDataHelper.getSearchParamsJSON();
  const isSsoAuth = urlParamsData.get('userToken') && urlParamsData.get('username') && urlParamsData.get('userId') && urlParamsData.get('authority')
  // ***** 免登录业务

  const isAutoLogin = location.search.includes('guest=true') || isSsoAuth
  if (location.search.includes('language=')) {
    const paramList = query.split('&');

    for (const param of paramList) {
      const [key, value] = param.split('=');
      if (key === 'language') {
        storage.local.setItem('language', value)
      }
    }
  }
  // await checkUpdate()
  let token = storage.local.getItem('token')
  if (window.nvisual?.isShare) {
    token = storage.local.getItem('shareToken')
  }
  if (token?.userToken) {
    if (isAutoLogin) {
      storage.local.removeItem('token')
      await getUserInfo(isSsoAuth, axios)
    }
    const url = 'v1/global_settings/front_end'
    try {
      const res = await axios.get(url);
      if (res.status === 200) {
        res.data?.forEach((setting) => {
          globalConfig[setting.name] = setting.value
          if (setting.name === 'cloud_directory') {
            storage.local.setItem('cloudDirectory', setting.value)
            // 这个地方是获取cad工作区名字的, 原因是工作区的名字由该商户的数据库名字命名, 数据的名字 从这个接口获取后需要处理一下才能得到
            const value = setting.value;
            const valueSplit = value.split('/')
            const databaseName = valueSplit[valueSplit.length - 1]
            storage.local.setItem('nameOfCadWorkspace', databaseName) // 存储cad功能用到的 “cad工作区”名字
          } else if (setting.name === 'mapJson') {
            storage.local.setItem('mapJson', setting.value)
          }
          if (setting.name === 'printExtensionModuleAddress') {
            // 打印机列表的地址
            storage.local.setItem('printExtensionModuleAddress', setting.value)
          } else if (setting.name === 'projectExtensionModuleAddress') {
            storage.local.setItem('projectExtensionModuleAddress', setting.value)
          } else if (setting.name === 'businessExtensionModuleAddress') {
            storage.local.setItem('businessExtensionModuleAddress', setting.value)
          } else if (setting.name === 'resourceExtensionModuleAddress') {
            storage.local.setItem('resourceExtensionModuleAddress', setting.value)
          } else if (setting.name === 'workOrderExtensionModuleAddress') {
            storage.local.setItem('workOrderExtensionModuleAddress', setting.value)
          }
        })
        if (isAutoLogin) {
          location.href = '/diagram.html?id=24000000000001&v=' + version
        }
      } else {
        if (isAutoLogin) {
          location.href = '/diagram.html?id=24000000000001&v=' + version
        } else {
          logOutChannel.logOutChannel.postMessage('false')
          setTimeout(() => {
            location.href = '/access.html?v=' + version
          });
        }
      }
    } catch (e) {
      logOutChannel.logOutChannel.postMessage('false')
      setTimeout(() => {
        location.href = '/access.html?v=' + version
      });
    }
  } else {
    if (isAutoLogin) {
      await getUserInfo(isSsoAuth, axios)
      location.href = '/diagram.html?id=24000000000001&v=' + version
    } else {
      logOutChannel.logOutChannel.postMessage('false')
      setTimeout(() => {
        location.href = '/access.html?v=' + version
      });
    }
  }
  if (window.nvisual?.nvisualLanguage) {
    localStorage.setItem('Nvisual_language', window.nvisual.nvisualLanguage)
  }
  // 如果本地存储中没有语言,则调用接口获取语言数据
  if (!storage.local.getItem('Nvisual_language')) {
    if (localStorage.Nvisual_userName) {
      await axios.get(`/v1/users_locale/${localStorage.Nvisual_userName}`).then(r => {
        if (r?.data?.data?.languageCode) {
          if (r?.data?.data?.languageCode === 'zh') {
            storage.local.setItem('language', r?.data?.data?.languageCode + '-cn')
          } else {
            storage.local.setItem('language', r?.data?.data?.languageCode)
          }
        } else {
          storage.local.setItem('language', 'zh-cn')
        }
      })
    } else {
      // 单点登录导致无法获取用户名，则先获取用户名之后再获取语言数据
      await axios.get('/v1/users/getToken').then(async r => {
        storage.local.setItem('userName', r.data)
        await axios.get(`/v1/users_locale/${r.data}`).then(r => {
          if (r?.data?.data?.languageCode) {
            if (r?.data?.data?.languageCode === 'zh') {
              storage.local.setItem('language', r?.data?.data?.languageCode + '-cn')
            } else {
              storage.local.setItem('language', r?.data?.data?.languageCode)
            }
          } else {
            storage.local.setItem('language', 'zh-cn')
          }
        })
      })
    }
    location.reload();
  }
}

// guest
const getUserInfo = async (isSsoAuth, axios) => {
  if (isSsoAuth) {
    const query = location.search.slice(1);
    const queryList = query.split('&');
    const queryMap = { userToken: {}, username: {}, userId: {}, authority: {} }

    queryList?.forEach((item) => {
      const list = item.split('=');
      queryMap[list[0]] = list[1]
    })
    storage.local.setItem('token', `{"userToken":"${queryMap.userToken}","expires":null,"path":"/"}`)
    storage.local.setItem('userName', queryMap.username)
    storage.local.setItem('userId', queryMap.userId)
    storage.local.setItem('power', queryMap.authority)
  } else {
    // 加密实例
    // const jasypt = new Jasypt();
    // // 设置秘钥
    // jasypt.setPassword('kjfgwekjhfoiefoiehpfopewgkewljgpiewhfioewbnfpojwephfpoewngkewng');
    await axios.post('/v1/authenticate', {
      username: 'guest',
      // password: jasypt.encrypt('nwvdi') // 加密
      password: AES.encrypt('nwvdi') // 加密
    }).then(async (r) => {
      storage.local.setItem('token', `{"userToken":"${r.data.data.access_token}","expires":null,"path":"/"}`)
      storage.local.setItem('userName', r.data.data.user)
      storage.local.setItem('userId', r.data.data.userId)
      storage.local.setItem('power', r.data.data.authority)
    })
  }
}

export default setGlobalSetting
