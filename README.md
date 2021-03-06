<h1 align="center">Ace Admin SPA</h1>

# 简介

基于Boostrap Ace Admin的单页面响应式后台管理前端系统，适合后端程序员或者没有时间学习新的前端框架的人员使用，减少学习成本，拿来即用。

涉及技术栈：
- bootstrap ui样式
- jquery js库
- q.js 前端单页路由
- art-template 前端模版引擎
- require.js 前端模块化
- bower 前端依赖库管理
- gulp 打包构建

# [在线Demo](https://jkanon.github.io/ace-admin-spa/index.html)
用户名/密码随意填<br />
可操作增删改，刷新页面之后恢复初始状态

# 截图
![](https://s2.ax1x.com/2019/11/02/KL0buT.png)
![](https://s2.ax1x.com/2019/11/15/MdxWaF.png)
![](https://s2.ax1x.com/2019/11/19/McrM5V.png)
![](https://s2.ax1x.com/2019/11/15/MdzBdO.png)

# 特性
- 前端路由
- SPA单页面应用
- 前后端分离
- 模块按需加载。引入RequireJS在网页端动态加载
- 运行时前端模版引擎渲染
- 对datatables，表单等进行了大量封装，简单易用
- 引入layer,zTree等第三方插件，并进行了本地化改造，统一UI接口
- 支持数据接口模拟，前后端联调时可以无缝对接。支持纯前端模拟和本地服务模拟两种方式
- 支持接口转发，便于联调
- 支持ace的所有样式，具体可参考[Ace](http://ace.jeka.by/)

# 使用
- 准备工作
    - 安装[nodejs](https://nodejs.org/en/)
    - 安装gulp命令行工具
    
    `npm install -g gulp-cli`
    - 安装依赖库
    
    在项目根目录下执行`npm install`
- 开发
```bash
# 开启本地数据模拟
$ npm start
# 禁用本地数据模拟，改用代理转发接口到后台服务器
# 目前转发地址请修改app.js中的proxyOption.target字段
$ npm run start:no-mock
```

- 部署
```bash
$ npm run build  // 然后直接把dist中的目标文件丢到生产环境中去
```


# 开发指南
### 总体流程
- 定义路由，修改`mock/modules/menus.js`中的`menus`变量
- 每个子页面由同名的`html`和`js`组成
- 在[src/views/inner](src/views/inner)中添加路由对应的子页面html文件
- 在[src/assets/js/inner](src/assets/js/inner)中添加子页面同名的js文件
- `js`采用AMD规范的模块化加载方法。`js`文件通过`define`函数定义模块，同时可以声明依赖的其它模块
- 需在`js`中定义入口函数`init`，此函数将在`js`文件加载完成之后调用
- 模块化加载默认路径为`assets/js`，如果需要加载其它路径下的目录请填写相对路径

### 前后端交互
- 采用ajax交互
- 前后端`token`通过`header`中的`X-Access-Token`字段进行交互。有需要可在`common.js`中的`ajax`函数中修改
- 后端返回的`json`格式标准如下：
```
{
    success: boolean,  // 请求是否成功
    code: number,
    data: object,   // 返回的数据，ajax回调取到的值即为这个
    message: string // 错误提示
}
```
- 可以根据需要适配接口格式。请修改`common.js`中的`appConfig["global"].response`字段，支持嵌套格式。同时需要单独修改`login.js`文件。

### 数据模拟（Mock）
- Mock数据文件放在[mock/modules](mock/modules)下
- Mock数据文件主要声明需要模拟的接口地址，请求方法，返回的数据

### html公用模版引入
- 在`html`文件中支持`@@include`函数引入公共`html模版`
- 约定引用的模块文件存放目录为[src/views/template](src/views/template)
- 公共模块文件将在打包构建的时候引入到目标文件中去

### IE8
如果需要兼容`IE8`，请避免使用`IE8`的关键字。如`delete`, `class`, `default`, `switch`等<br/>
本系统也没能避开关键字的坑，因此遗留着部分`IE8`的关键字，使用的时候请通过字符串下标的方式进行引用。

# 支持环境

IE8以上及现代浏览器。

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --- | --- | --- | --- | --- |
| IE8, Edge | latest version | latest version | latest version | latest version |

# 最后

欢迎大家来访

[![](https://img.shields.io/badge/%E7%AE%80-%40Jkanon-orange)](https://www.jianshu.com/u/53671b43e905) [![](https://img.shields.io/badge/%E7%A0%81%E4%BA%91-@Jkanon-C5212A)](https://gitee.com/Jkanon) [![](https://img.shields.io/badge/Github-@Jkanon-25292E.svg)](https://github.com/Jkanon)
