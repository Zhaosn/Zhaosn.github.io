/* global Fluid */

HTMLElement.prototype.wrap = function(wrapper) {
  this.parentNode.insertBefore(wrapper, this);
  this.parentNode.removeChild(this);
  wrapper.appendChild(this);
};

/**
 * 将十六进制颜色转换为 RGB 对象
 * @param {string} hex 十六进制颜色值
 * @returns {object|null} RGB 对象 {r, g, b} 或 null
 */
function hexToRgb(hex) {
  // 移除 # 号
  hex = hex.replace(/^#/, '');
  
  // 处理缩写形式（如 #fff 转换为 #ffffff）
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // 解析十六进制值
  var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

Fluid.events = {

  registerNavbarEvent: function() {
    var navbar = jQuery('#navbar');
    if (navbar.length === 0) {
      return;
    }
    var submenu = jQuery('#navbar .dropdown-menu');
    if (navbar.offset().top > 0) {
      navbar.removeClass('navbar-dark');
      submenu.removeClass('navbar-dark');
    }
    Fluid.utils.listenScroll(function() {
      var scrollTop = jQuery(window).scrollTop();
      var maxScroll = 300; // 最大滚动距离，超过此值后效果不再变化
      var scrollRatio = Math.min(scrollTop / maxScroll, 1); // 滚动比例，范围0-1
      
      // 非线性滚动比例计算（开始慢，后面快）
      var exponent = 1.5; // 指数系数，大于1时实现开始慢后面快的效果
      var nonlinearScrollRatio = Math.pow(scrollRatio, exponent);
      
      // 平滑添加/移除类（根据滚动比例）
      if (scrollRatio > 0) {
        navbar.addClass('top-nav-collapse');
        submenu.addClass('dropdown-collapse');
      } else {
        navbar.removeClass('top-nav-collapse');
        submenu.removeClass('dropdown-collapse');
      }
      
      // 平滑改变导航栏高度（根据滚动比例）
      var defaultPadding = 12; // 默认 padding
      var collapsedPadding = 5; // 折叠后 padding
      var currentPadding = defaultPadding - (defaultPadding - collapsedPadding) * nonlinearScrollRatio;
      navbar.css('padding-top', currentPadding + 'px');
      navbar.css('padding-bottom', currentPadding + 'px');
      
      // 平滑改变毛玻璃效果的透明度（根据滚动比例）
      var alpha = scrollRatio * 0.7; // 最大不透明度
      // 从 CSS 变量中获取当前主题的导航栏背景色
      var navbarBgColor = getComputedStyle(document.documentElement).getPropertyValue('--navbar-bg-color').trim();
      // 将十六进制颜色转换为 RGB
      var rgbColor = hexToRgb(navbarBgColor);
      if (rgbColor) {
        navbar.css('background', 'rgba(' + rgbColor.r + ', ' + rgbColor.g + ', ' + rgbColor.b + ', ' + alpha + ')');
      }
      navbar.css('-webkit-backdrop-filter', 'blur(10px)');
      navbar.css('backdrop-filter', 'blur(10px)');
            
      // 注释掉页首取消毛玻璃效果的代码
      // if (navbar.offset().top > 0) {
      //   navbar.removeClass('navbar-dark');
      //   submenu.removeClass('navbar-dark');
      // } else {
      //   navbar.addClass('navbar-dark');
      //   submenu.removeClass('navbar-dark');
      // }
    });
    jQuery('#navbar-toggler-btn').on('click', function() {
      jQuery('.animated-icon').toggleClass('open');
      jQuery('#navbar').toggleClass('navbar-col-show');
    });
  },

  registerParallaxEvent: function() {
    var ph = jQuery('#banner[parallax="true"]');
    if (ph.length === 0) {
      return;
    }
    var board = jQuery('#board');
    if (board.length === 0) {
      return;
    }
    var parallax = function() {
      var pxv = jQuery(window).scrollTop() / 5;
      var offset = parseInt(board.css('margin-top'), 10);
      var max = 96 + offset;
      if (pxv > max) {
        pxv = max;
      }
      ph.css({
        transform: 'translate3d(0,' + pxv + 'px,0)'
      });
      var sideCol = jQuery('.side-col');
      if (sideCol) {
        sideCol.css({
          'padding-top': pxv + 'px'
        });
      }
    };
    Fluid.utils.listenScroll(parallax);
  },

  registerScrollDownArrowEvent: function() {
    var scrollbar = jQuery('.scroll-down-bar');
    if (scrollbar.length === 0) {
      return;
    }
    scrollbar.on('click', function() {
      Fluid.utils.scrollToElement('#board', -jQuery('#navbar').height());
    });
  },

  registerScrollTopArrowEvent: function() {
    var topArrow = jQuery('#scroll-top-button');
    if (topArrow.length === 0) {
      return;
    }
    var board = jQuery('#board');
    if (board.length === 0) {
      return;
    }
    var posDisplay = false;
    var scrollDisplay = false;
    // Position
    var setTopArrowPos = function() {
      var boardRight = board[0].getClientRects()[0].right;
      var bodyWidth = document.body.offsetWidth;
      var right = bodyWidth - boardRight;
      posDisplay = right >= 50;
      topArrow.css({
        'bottom': posDisplay && scrollDisplay ? '20px' : '-60px',
        'right' : right - 64 + 'px'
      });
    };
    setTopArrowPos();
    jQuery(window).resize(setTopArrowPos);
    // Display
    var headerHeight = board.offset().top;
    Fluid.utils.listenScroll(function() {
      var scrollHeight = document.body.scrollTop + document.documentElement.scrollTop;
      scrollDisplay = scrollHeight >= headerHeight;
      topArrow.css({
        'bottom': posDisplay && scrollDisplay ? '20px' : '-60px'
      });
    });
    // Click
    topArrow.on('click', function() {
      jQuery('body,html').animate({
        scrollTop: 0,
        easing   : 'swing'
      });
    });
  },

  registerImageLoadedEvent: function() {
    if (!('NProgress' in window)) { return; }

    var bg = document.getElementById('banner');
    if (bg) {
      var src = bg.style.backgroundImage;
      var url = src.match(/\((.*?)\)/)[1].replace(/(['"])/g, '');
      var img = new Image();
      img.onload = function() {
        window.NProgress && window.NProgress.status !== null && window.NProgress.inc(0.2);
      };
      img.src = url;
      if (img.complete) { img.onload(); }
    }

    var notLazyImages = jQuery('main img:not([lazyload])');
    var total = notLazyImages.length;
    for (const img of notLazyImages) {
      const old = img.onload;
      img.onload = function() {
        old && old();
        window.NProgress && window.NProgress.status !== null && window.NProgress.inc(0.5 / total);
      };
      if (img.complete) { img.onload(); }
    }
  },

  registerRefreshCallback: function(callback) {
    if (!Array.isArray(Fluid.events._refreshCallbacks)) {
      Fluid.events._refreshCallbacks = [];
    }
    Fluid.events._refreshCallbacks.push(callback);
  },

  refresh: function() {
    if (Array.isArray(Fluid.events._refreshCallbacks)) {
      for (var callback of Fluid.events._refreshCallbacks) {
        if (callback instanceof Function) {
          callback();
        }
      }
    }
  },

  billboard: function() {
    if (!('console' in window)) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log(`
-------------------------------------------------
|                                               |
|      ________  __            _        __      |
|     |_   __  |[  |          (_)      |  ]     |
|       | |_ \\_| | | __   _   __   .--.| |      |
|       |  _|    | |[  | | | [  |/ /'\`\\' |      |
|      _| |_     | | | \\_/ |, | || \\__/  |      |
|     |_____|   [___]'.__.'_/[___]'.__.;__]     |
|                                               |
|            Powered by Hexo x Fluid            |
| https://github.com/fluid-dev/hexo-theme-fluid |
|                                               |
-------------------------------------------------
    `);
  }
};
