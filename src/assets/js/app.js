//上下文内容
var isLTIE8 = function () {
    var ua = navigator.userAgent,
    isIE = ua.indexOf('MSIE') > -1,
    a = isIE ? /\d+/.exec(ua.split(';')[1]) : 'no ie';
    return a <= 8;
}();
require.config({
    baseUrl : "assets/js",
    map: {
        '*': {
            'css': '../components/require-css/css.min'
        }
    },
    paths : {
        "jquery": isLTIE8 ? "jquery-1.11.3.min" : "../components/jquery/dist/jquery",
        "jquery-mobile": "jquery.mobile.custom.min",
        "jquery.spring-friendly": "jquery.spring-friendly.min",
        "bootstrap": "../components/bootstrap/dist/js/bootstrap.min",
        "ace": "ace.min",
        "ace-elements": "ace-elements.min",
        "datatables.net": "../components/datatables.net/js/jquery.dataTables.min",
        "datatables.net-bs": "../components/datatables.net-bs/js/dataTables.bootstrap.min",
        "datatables.treeGrid": "./dataTables.treeGrid",
        "layer": "../components/layer/dist/layer",
        "lodash": "../components/lodash/dist/lodash.min",
        //"jquery.maskedinput": "../components/jquery.maskedinput/dist/jquery.maskedinput.min"
        "jquery.inputmask": "../components/inputmask/dist/jquery.inputmask.bundle"
        , "jquery.inputlimiter": "../components/jquery-inputlimiter/jquery-inputlimiter/jquery.inputlimiter.1.3.1"
        , "jquery.validate.message-zh": "../components/jquery-validation/src/localization/messages_zh"
        , "jquery.validate.min": "../components/jquery-validation/dist/jquery.validate.min"
        , "jquery.additional-methods": "../components/jquery-validation/dist/additional-methods.min"
        , "jquery.validate.custom": "custom.jquery.validate"
        , "autosize": "../components/autosize/dist/autosize.min"
        , "dropzone": "../components/dropzone/dist/min/dropzone-amd-module.min"
        , "zTree": "../components/zTree/js/jquery.ztree.all.min"
        , "codemirror": "../components/codemirror/5.42.0/lib/codemirror.min"
        , "shell": "../components/codemirror/5.42.0/mode/shell/shell"
    },
    shim: {
        "bootstrap": {
            deps: ['jquery']
        },
        "ace-elements": {
            deps: ['jquery']
        },
        "ace": {
            deps: ['ace-elements', 'bootstrap']
        },
        "datatables.net": {
            deps: ['jquery.spring-friendly']
        },
        "jquery.validate.message-zh": {
            deps: ["jquery.validate.min"]
        },
        "jquery.validate.custom": {
            deps: ["jquery.validate.min"]
        },
        "codemirror": {
            deps: ["css!../components/codemirror/5.42.0/lib/codemirror.min"]
        },
        "shell": {
            deps: ["codemirror"]
        }
    }
});
template.defaults.imports._ = function(){
    return _;
};
template.defaults.imports.defaults = function(){
    for(var i = 0; i < arguments.length; i++) {
        if(typeof arguments[i] !== 'undefined') {
            return arguments[i];
        }
    }

    return "";
};

define(['ace', 'common'], function(ACE, common){
    //通过requirejs引入时，ace.min.js中的这句话执行时ace.demo还未定义，因此这边手动重新执行一遍
    try {
        //true参数不可少，否则通过requirejs引入也无法真正执行
        ace.demo.init(true);
    } catch (b) {}
    if('ontouchstart' in document.documentElement) {
        require(['jquery-mobile']);
    }

    $(function() {
        initUserInfo();
        initNav();
        initRouter();
        initEventListener();
    });

    //路由注册
    function initRouter() {
        Q.reg('home', function(){
            load('dashBoard')
        }).reg(/(.+)/, function(path){
            load(path == 'home' ? 'dashBoard' : path)
        }).init({
            index: 'home',
            pop: navchange
        });
    }

    function initEventListener() {
        $(document)
            .on(ace.click_event, '#changePwd', changePwd)
            .on(ace.click_event, '#logout', common.logout)
            .on('keypress', '.input-group > input', function(ev) {
                if (ev.keyCode == 13) {
                    //回车
                    var btnOk = $(this).parent().find('button.js-ok');
                    btnOk && btnOk.length > 0 && btnOk.click();
                }
            })
        ;
    }

    //异步加载子页面
    function load(path) {
        $("#page-content").load("views/inner/" + path +".html",function() {
            if (path !== 'dashBoard') {
                require(['inner/' + path], function (Demo) {
                    Demo.init && Demo.init();
                }, function(err) {
                    console.log(err.requireType);
                    if ("scripterror" == err.requireType) {

                    }
                });
            }
        });
    }

    //初始化用户信息
    function initUserInfo(){
        try {
            var user = common.getCurrentUser();
            if (!user) {
                message.confirm("当前未登录或者登录已超时，请重新登录！", { btn: ['确定'], closeBtn: false }, function() {
                    common.logout();
                });
            }
            $("#nav-username").text(user.username || user.loginName);
            var $photo = $("#nav-user-photo");
            if(user.avatar) {
                $photo.attr('src', "assets/images/avatars/" + user.avatar);
            }
            $photo.attr('alt', user.username || user.loginName);
        } catch (e) {
            console.log(e.message);
        }
    }

    //Menu相关==================
    //获取左侧导航栏
    function initNav(){
        var menus = [
            {
                "icon": "home",
                "name": "后台首页",
                "href": "#!home"
            },
            {
                "icon": "tachometer",
                "name": "系统监控",
                "subMenus": [
                    {
                        "icon": "",
                        "name": "定时任务",
                        "href": "#!quartz-jobs"
                    },{
                        "icon": "",
                        "name": "操作日志",
                        "href": "logs"
                    }
                ]
            },
            {
                "icon": "cog",
                "name": "系统管理",
                "subMenus": [/*{
                    "icon": "",
                    "name": "菜单管理"
                },{
                    "icon": "",
                    "name": "角色管理"
                },*/{
                    "icon": "",
                    "name": "机构管理",
                    "href": "#!orgs"
                },{
                    "icon": "",
                    "name": "用户管理",
                    "href": "#!users"
                },{
                    "icon": "",
                    "name": "角色管理",
                    "href": "#!roles"
                },{
                    "icon": "",
                    "name": "菜单管理",
                    "href": "#!menus"
                }/*,{
                    "icon": "",
                    "name": "参数设置"
                },{
                    "icon": "leaf",
                    "name": "二级菜单",
                    "subMenus": [{
                        "icon": "",
                        "name": "三级菜单"
                    }]
                }*/]
            }
        ];
        document.getElementById("index-sidenav").innerHTML = template('tplSideNav', { list: menus });
    }

    /**
     * url变化监听
     * @param L
     */
    function navchange() {/* 每次有url变更时都会触发pop回调 */
        var L = arguments.length > 1 ? arguments[1] : arguments[0]
        //菜单栈
        var stack = [];
        var c = $('.nav a[href="#!' + L + '"]');
        var a = c.parent();
        if (a && a[0].className !== 'active') {
            $('.nav li.active,.nav li.open').attr('class', '');
            stack.unshift({"name": $.trim(c.text()), "href": c.attr('href')});
            a[0].className = 'active';
            var p, link;
            while((p = a.parent()) && p[0].tagName == "UL" && p.hasClass('submenu')) {
                a = p.parent();
                link = p.siblings('a:first');
                stack.unshift({"name": $.trim(link.text()), "href": link.attr('href')});
                a[0].className = "open active";
            }

            changeBreadcrumb(stack);
            changeTitle(stack[stack.length - 1].name);
        }

    }

    /**
     * 更改面包屑导航
     */
    function changeBreadcrumb(menus) {
        $('#breadcrumb').replaceWith(
            template('tplBreadcrumb', {list: menus})
        );
    }

    /**
     * 更改页面title
     */
    function changeTitle(t) {
        var title = document.title;
        title = title.substr(title.indexOf(' -'));
        common.modifyTitle(t + title);
    }

    function changePwd() {
        common.modal({
            title: "修改密码",
            template: {id: "tplChangePwd"},
            area: ['600px', '280px'],
            cancel: function(){},
            ok: function(layero, index){
                var txt1 = $("#txtOldPwd").val();
                var txt2 = $("#txtNewPwd").val();
                var txt3 = $("#txtNewPwdConfirm").val();

                if(txt1 == "" || txt2 == "" || txt3 == ""){
                    message.error("密码不能为空");
                    return false;
                }
                if(txt2 !== txt3 ){
                    message.error("两次输入新密码不一致，请重新输入!");
                    return false;
                }
                var info = {"oldpwd": txt1, "newpwd": txt2};
                common.put("/password", info, function(){
                    message.success("密码更新成功, 请重新登录!");
                    layer.close(index);
                    setTimeout(function(){common.logout();}, 1000)
                });
            }
        });
    }

    //注入业务相关公共函数==============
    return {
        CONSTANT: {
            UPDATE_METHOD: {
                client: 1,
                server: 0
            },
            REQUEST_FORM_UPDATE_STRATEGY: {
                BY_ORDER: 0,
                AT_THE_SAME_TIME: 1
            }
        },
        /**
         * 提交数据（新增或者编辑数据）
         * @param api
         * @param type
         * @param data
         * @param callback
         */
        saveData: function(api, type, data, callback) {
            if(type == 'add') {
                common.post( api["add"], data, callback)
            } else {
                common.put(api["edit"].replace('{id}', data.id), data, callback)
            }
        }

        /**
         * 删除数据
         * @param api
         * @param id
         */
        ,deleteData: function(api, id, callback){
            common.delete(api["delete"].replace('{id}', id), null, function(ret){
                typeof callback == 'function' && callback(ret);
                message.success("删除成功");
            })
        }

        /**
         * 打开编辑框
         * @param options {callback: "保存回调", success: "成功回调", ignore: "忽略验证元素"}
         */
        ,openFormDialog: function(options){
            var that = this;
            common.modal({
                title: (options.type == 'add' && '新增' || '编辑') + options.title,
                area: options.area || '400px',
                offset: options.offset,
                template: options.template,
                success: options.success,
                ok: function(layero, index){
                    var originData = this.form.serializeObject();
                    that.saveData(options.api, options.type,
                        typeof options.format == 'function' && options.format(originData) || (originData),
                        function(ret){
                            layer.close(index);
                            message.success("保存成功");
                            typeof options.callback == 'function' && options.callback(ret);
                    });
                },
                reset: options.reset,
                rules: options.rules,
                ignore: options.ignore
            });
        }

        /**
         * 刷新codemirror视图
         * @param form
         * @param cb
         */
        ,refreshCodeMirror: function (form, cb) {
            var that = this;
            var editorElem = $('textarea[class*=codemirror]', form);
            if (editorElem && editorElem.length > 0) {
                require(['codemirror'], function(CodeMirror){
                    $.each(editorElem, function(i, elem) {
                        require([$(elem).attr('data-mode')], function(){
                            that.getCodeMirrorObj($(elem)).refresh();
                            typeof cb == 'function' && cb();
                        });
                    })
                });
            }
        }

        ,getCodeMirrorObj: function(elem) {
            return window[$(elem).attr("id")+"_cm"];
        }

        /**
         * 刷新下拉列表
         */
        ,refreshSelect: function(options) {
            var target = typeof options.elem == 'string' && $(options.elem) || options.elem;
            target.empty();
            if(options.hasEmpty !== false) {
                target.append("<option value=''>"+(options.emptyText || "请选择")+"</option>");
            }
            $.each(options.options, function(i, o){
                var option = "<option value=\""+o[options.value]+"\">"+o[options.label]+"</option>";
                target.append(option)
            });
        }
    };
});

