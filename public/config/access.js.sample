(function () {
  // 头部配置项
  var headerHeight = 0 // 头部高度(相对于屏幕尺寸的百分比)
  var headerBackground = '' // 头部背景颜色

  // 脚部配置项
  var footerBackground = '' // 脚部背景颜色
  var footerHeight = 0 // 脚部高度(相对于屏幕尺寸的百分比)

  // 左上角区域配置项，默认在头部区域垂直居中
  var headerLeftWidth = 0  // 左上角图片的宽度(相对于头部区域的百分比)
  var headerLeftLeft = 0 // 左上角图片距左侧距离(相对于头部区域的百分比)
  var headerLeftHeight = 0 // 左上角图片高度(相对于头部区域的百分比)
  var headerLeftSrc = ''; // 左上角图片的路径

  // 头部中间区域配置项，默认在头部区域垂直居中
  var headerCenterHeight = 0 // 头部中间图片的高度(相对于头部区域的百分比)
  var headerCenterWidth = 0 // 头部中间图片的宽度(相对于头部区域的百分比)
  var headerCenterSrc = ''; // 头部中间图片的路径

  // 右上角区域配置项，默认在头部区域垂直居中
  var headerRightWidth = 0 // 右上角图片宽度(相对于头部区域的百分比)
  var headerRightRight = 0 // 右上角图片距右侧距离(相对于头部区域的百分比)
  var headerRightHeight = 0 // 右上角图片高度(相对于头部区域的百分比)
  var headerRightSrc = ''; // 右上角图片的路径

  // 左下角配置项，默认在脚部区域垂直居中
  var footerLeftWidth = 0 // 左下角图片的宽度(相对于脚部区域尺寸的百分比)
  var footerLeftLeft = 0 // 左下角图片距左侧距离(相对于脚部区域尺寸的百分比)
  var footerLeftHeight = 0 // 左下角图片的高度(相对于脚部区域尺寸的百分比)
  var footerLeftSrc = ''; // 左下角图片的路径

  // 脚部中间区域配置项，默认在脚部区域垂直居中
  var footerCenterHeight = 0 // 脚部中间图片的高度(相对于脚部区域尺寸的百分比)
  var footerCenterWidth = 0 // 脚部中间图片的宽度(相对于脚部区域尺寸的百分比)
  var footerCenterSrc = ''; // 脚部中间角图片的路径

  // 右下角配置项，默认在脚部区域垂直居中
  var footerRightWidth = 0 // 右下角图片的宽度(相对于脚部区域尺寸的百分比)
  var footerRightRight = 0 // 右下角图片距右侧距离(相对于脚部区域尺寸的百分比)
  var footerRightHeight = 0 // 右下角图片的高度(相对于脚部区域尺寸的百分比)
  var footerRightSrc = ''; // 右下角图片的路径

  // 可移动区域配置项
  var moveDivWidth = 0; // 可移动区域的宽度(相对于屏幕尺寸的百分比)
  var moveDivHeight = 0; // 可移动区域的高度(相对于屏幕尺寸的百分比)
  var moveDivLeft = 0; // 可移动区域距屏幕左侧的距离(相对于屏幕尺寸的百分比)
  var moveDivTop = 0; // 可移动区域距屏幕上方侧的距离(相对于屏幕尺寸的百分比)
  var moveDivBackground = ''; // 可移动区域的背景颜色

  // 可移动区域图片配置项
  var moveImgWidth = 100; // 可移动区域图片的宽度（相对于可移动区域的百分比），默认为100%，即铺满整个可移动区域
  var moveImgHeight = 100; // 可移动区域图片的高度（相对于可移动区域的百分比），默认为100%，即铺满整个可移动区域
  var moveImgLeft = 0; // 可移动区域图片距离可移动区域左侧边框的距离（相对于可移动区域的百分比）
  var moveImgTop = 0; // 可移动区域图片距离可移动区域上方边框的距离（相对于可移动区域的百分比）
  var moveImgSrc = ''; // 可移动区域的图片的图片路径

  // 用户名、密码输入框上方Logo配置项
  var logoImgVisible = true; // logo图片是否显示，默认显示。可选值为true和false，其中：true:显示  false:隐藏
  var logoImgSrc = './../img/accessTip/LOGO.svg'; // logo图片的图片路径，默认为nVisual Logo

  var loginAreaBackground = 'rgba(255, 255, 255, 0.9)'; // 用户名、密码输入区域背景色
  var accessButtonBackground = 'rgba(17, 172, 128, 1)'; // 登录按钮的背景色
  var accessButtonColor = '#fff'; // 登录按钮的文字的背景色

  var backgroundImgSrc = './../img/bg/saasLogin.jpg'; // 登录页的背景图，默认为img/bg/saasLogin.jpg

  if (document.getElementById('header')) {
    document.getElementById('header').style.height = headerHeight + '%';
    document.getElementById('header').style.backgroundColor = headerBackground;
    document.getElementById('headerLeft').style.height = headerLeftHeight + '%';
    document.getElementById('headerLeft').style.width = headerLeftWidth + '%';
    document.getElementById('headerLeft').style.left = headerLeftLeft + '%';
    document.getElementById('headerRight').style.height = headerRightHeight + '%';
    document.getElementById('headerRight').style.width = headerRightWidth + '%';
    document.getElementById('headerRight').style.right = headerRightRight + '%';

    document.getElementById('headerCenter').style.width = headerCenterWidth + '%';
    document.getElementById('headerCenter').style.height = headerCenterHeight + '%';
    document.getElementById('headerLeft').src = headerLeftSrc;
    document.getElementById('headerCenter').src = headerCenterSrc;
    document.getElementById('headerRight').src = headerRightSrc;
  }
  if (document.getElementById('footer')) {
    document.getElementById('footer').style.backgroundColor = footerBackground;
    document.getElementById('footer').style.height = footerHeight + '%';
    document.getElementById('footer').style.top = 100 - footerHeight + '%';

    // document.getElementById('main').style.height = 100 - footerHeight - headerHeight + '%';
    // document.getElementById('footer').style.bottom = -100 + footerHeight + headerHeight + '%';
    document.getElementById('footerLeft').style.height = footerLeftHeight + '%';
    document.getElementById('footerLeft').style.width = footerLeftWidth + '%';
    document.getElementById('footerLeft').style.left = footerLeftLeft + '%';
    document.getElementById('footerRight').style.height = footerRightHeight + '%';
    document.getElementById('footerRight').style.width = footerRightWidth + '%';
    document.getElementById('footerRight').style.right = footerRightRight + '%';

    document.getElementById('footerCenter').style.width = footerCenterWidth + '%';
    document.getElementById('footerCenter').style.height = footerCenterHeight + '%';

    document.getElementById('footerLeft').src = footerLeftSrc;
    document.getElementById('footerCenter').src = footerCenterSrc;
    document.getElementById('footerRight').src = footerRightSrc;
  }

  if (document.getElementById('moveDiv')) {
    document.getElementById('moveDiv').style.width = moveDivWidth + '%';
    document.getElementById('moveDiv').style.height = moveDivHeight + '%';
    document.getElementById('moveDiv').style.left = moveDivLeft + '%';
    document.getElementById('moveDiv').style.top = moveDivTop + '%';
    document.getElementById('moveDiv').style.backgroundColor = moveDivBackground;
  }

  if(document.getElementById('moveImg')) {
    document.getElementById('moveImg').style.width = moveImgWidth + '%';
    document.getElementById('moveImg').style.height = moveImgHeight + '%';
    document.getElementById('moveImg').style.left = moveImgLeft + '%';
    document.getElementById('moveImg').style.top = moveImgTop + '%';
    document.getElementById('moveImg').src = moveImgSrc;
  }

  if(document.getElementById('logoImg')) {
    if (logoImgVisible) {
      document.getElementById('logoImg').style.display = 'block';
    } else {
      document.getElementById('logoImg').style.display = 'none';
    }
    document.getElementById('logoImg').src = logoImgSrc;
  }

  if(document.getElementById('login_area')) {
    document.getElementById('login_area').style.backgroundColor = loginAreaBackground;
  }

  if(document.getElementById('body')) {
    if (backgroundImgSrc) {
      document.getElementById('body').style.backgroundImage = 'url(' + backgroundImgSrc + ')'
    }
  }

  if(document.getElementById('loginButton')) {
    document.getElementById('loginButton').style.backgroundColor = accessButtonBackground;
    document.getElementById('loginButton').style.color = accessButtonColor;
  }

  var imgs = document.getElementsByTagName('img');
  if (imgs) {
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.getAttribute('src')) {
          img.style.display = 'none';
      }
    }
  }
})()
