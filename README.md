<h1 align="center">Ace Admin SPA</h1>

# 简介

基于Boostrap Ace Admin的单页面响应式后台管理前端系统。适合后端程序员或者没有时间学习新的前端框架的人员使用，减少学习成本，拿来即用。<br/>
目前仅实现了登录功能、用户管理列表，菜单管理列表，其它的待后续补充<br/>

涉及技术栈：
- bootstrap ui样式
- jquery js库
- q.js 前端单页路由
- art-template 前端模版引擎
- require.js 前端模块化
- bower 前端依赖库管理
- gulp 打包构建

# 在线Demo
待补充

# 截图
![](https://s2.ax1x.com/2019/11/02/KqCS2Q.png)
![](https://s2.ax1x.com/2019/11/02/Kq9z8g.png)

# 特性
- 前端路由
- 模块按需加载。引入RequireJS在网页端动态加载
- 对datatables进行二次封装，使得接口简单易用
- 引入layer来做模态框
- 支持mock，前后端联调时可以无缝对接
- 支持接口转发，用于联调

# 使用
- 准备工作
    - 安装nodejs
    - 安装bower
    
    npm install -g bower
    - 安装gulp命令行工具
    
    npm install -g gulp-cli
    - 安装依赖库
    
    在项目根目录下执行：<br/>
    1、npm install<br/>
    2、bower install
- 开发
```bash
# 开启本地数据模拟
$ npm start
# 禁用本地数据模拟，改用代理转发接口到后台服务器
# 目前转发地址请修改app.js中的proxyOption.target字段
$ npm run start:no-mock
```

- 构建
```bash
$ gulp build
```
直接把dist中的文件丢到生产环境中去

## 支持环境

现代浏览器及 IE11。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --- | --- | --- | --- | --- |
| IE8, Edge | last versions | last versions | last versions | last versions |

## 最后

欢迎大家来访

[![](https://img.shields.io/badge/%E7%AE%80-%40Jkanon-orange)](https://www.jianshu.com/u/53671b43e905) [![](https://img.shields.io/badge/%E7%A0%81%E4%BA%91-@Jkanon-C5212A)](https://gitee.com/Jkanon) [![](https://img.shields.io/badge/Github-@Jkanon-25292E.svg)](https://github.com/Jkanon)
