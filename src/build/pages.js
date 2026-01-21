const glob = require('glob');
const path = require('path')

const pages = {}
// 使用绝对路径查找
const files = glob.sync(path.resolve(__dirname, '..') + '/entry/*.js');
files.forEach(file => {
  file.match(/.+\/(.*)\.js/)
  const filename = RegExp.$1 // 获取匹配结果
  pages[filename] = {
    entry: `src/entry/${filename}.js`,
    template: `public/${filename}.html`,
    filename: `${filename}.html`,
    favicon: 'public/favicon.ico'
  }
  // if (filename === 'access') {
  //   pages[filename] = {
  //     entry: `src/entry/${filename}.js`,
  //     template: `public/${filename}.html`,
  //     filename: `${filename}.html`,
  //     favicon: 'public/favicon.ico'
  //   }
  // } else if (filename === 'project') {
  //   pages[filename] = {
  //     entry: `src/entry/${filename}.js`,
  //     template: `public/${filename}.html`,
  //     filename: `${filename}.html`,
  //     favicon: 'public/favicon.ico'
  //   }
  // }
})

module.exports = pages;
