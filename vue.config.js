const { resolve } = require('path');
const { defineConfig } = require('@vue/cli-service')
// const OpenBrowserPlugin = require('open-browser-webpack-plugin')
const pages = require('./src/build/pages')
const pathResolve = (dir) => resolve(__dirname, dir);

module.exports = {
  pwa: undefined,
  transpileDependencies: ['color-parse', 'color-rgba', 'ol'],
  productionSourceMap: false,
  lintOnSave: false, /* 关闭语法检查 */
  pages,
  publicPath: './',
  // lintOnSave: false,
  configureWebpack: {
    // plugins: [
    //   // 启动后自动打开默认的浏览器页面
    //   new OpenBrowserPlugin({ url: 'dev.nvisual.com:8080' })
    // ],
    resolve: {
      alias: {
        '@': pathResolve('./../../src'), // 引用主程序
        '@@': pathResolve('src'),
      },
    },
  },
  chainWebpack: config => {
    config.plugins.delete('pwa')
    config.plugins.delete('workbox')
    // config.module.rule('pug')
    //   .test(/\.pug$/)
    //   .use('pug-html-loader')
    //   .loader('pug-html-loader')
    //   .end()
  }
}
