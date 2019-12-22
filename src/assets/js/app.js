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
        "ace": "ace.min",
        "ace-elements": "ace-elements.min",
        "autosize": "../components/autosize/dist/autosize.min",
        "bootstrap": "../components/bootstrap/dist/js/bootstrap.min",
        "codemirror": "../components/codemirror/lib/codemirror",
        "codemirror/shell": "../components/codemirror/mode/shell/shell",
        "datatables.net": "../components/datatables.net/js/jquery.dataTables.min",
        "datatables.net-bs": "../components/datatables.net-bs/js/dataTables.bootstrap.min",
        "datatables.treeGrid": "datatables.treeGrid",
        "datatables.net-responsive": "../components/datatables.net-responsive/js/dataTables.responsive.min",
        "datatables.responsive": "../components/datatables.net-responsive-bs/js/responsive.bootstrap.min",
        "dropzone": "../components/dropzone/dist/min/dropzone-amd-module.min",
        "fuelux.spinbox": "../components/fuelux/js/spinbox",
        "jquery": isLTIE8 ? "../components/jquery.1x/dist/jquery.min" : "../components/jquery/dist/jquery.min",
        "jquery-mobile": "jquery.mobile.custom.min",
        "jquery.spring-friendly": "jquery.spring-friendly.min",
        "jquery.chosen": "../components/chosen/chosen.jquery.min",
        "jquery.inputmask": "../components/inputmask/dist/jquery.inputmask.bundle",
        "jquery.inputlimiter": "../components/jquery-inputlimiter/jquery-inputlimiter/jquery.inputlimiter.1.3.1",
        "jquery.validate.min": "../components/jquery-validation/dist/jquery.validate.min",
        "jquery.additional-methods": "../components/jquery-validation/dist/additional-methods.min",
        "jquery.validate.custom": "custom.jquery.validate",
        "layer": "../components/layer/dist/layer",
        "lodash": "../components/lodash/lodash",
        //"moment": "../components/moment/min/moment.min",
        "../moment": "../components/moment/min/moment.min",
        "momentcn": "../components/moment/locale/zh-cn",
        "zTree": "../components/zTree/js/jquery.ztree.all.min"
    },
    shim: {
        "bootstrap": {
            deps: ['jquery']
        },
        "ace": {
            deps: ['jquery', 'bootstrap']
        },
        "ace-elements": {
            deps: ['ace']
        },
        "datatables.net": {
            deps: ['jquery.spring-friendly']
        },
        "datatables.responsive": {
            deps: ["css!../components/datatables.net-responsive-bs/css/responsive.bootstrap.min"]
        },
        "codemirror": {
            deps: ["css!../components/codemirror/lib/codemirror"]
        },
        "codemirror/shell": {
            deps: ["codemirror"]
        }
    },
    waitSeconds: 0
});

template.defaults.imports.console = console;
template.defaults.imports.JSON = JSON;
template.defaults.imports.defaults = function(){
    for(var i = 0; i < arguments.length; i++) {
        if(typeof arguments[i] !== 'undefined') {
            return arguments[i];
        }
    }

    return "";
};

define(['ace-elements', 'common'], function(ACE, common){
    template.defaults.imports._ = _;
    template.defaults.imports._isUrl = common.isUrl;

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
            load(path === 'home' ? 'dashBoard' : path)
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
                if (ev.keyCode === 13) {
                    //回车
                    var btnOk = $(this).parent().find('button.js-ok');
                    btnOk && btnOk.length > 0 && btnOk.click();
                }
            })
        ;

        $(window)
            .off('resize.chosen')
            .on('resize.chosen', function() {
                $('.chosen-select').each(function() {
                    var $this = $(this);
                    var width = _.get($this.data("options"), "width", "66.66666667%");
                    $this.next().css({ width: width });
                });
            }).trigger('resize.chosen');

        $('body').tooltip({
            selector: "[data-rel=tooltip]",
            trigger: "hover"
        });
    }

    //异步加载子页面
    function load(path) {
        $("#page-content").load("views/inner/" + path +".html",function(responseTxt,statusTxt,xhr) {
            if (xhr.status === 200) {
                if (path !== 'dashBoard') {
                    require(['inner/' + path], function (Demo) {
                        if (Demo) {
                            if (Demo.init) {
                                Demo.init();
                            } else {
                                console.log("warn: 未发现入口函数");
                            }
                        }
                    }, function(err) {
                        console.log(err.requireType);
                        if ("scripterror" === err.requireType) {

                        }
                    });
                }
            } else if (xhr.status === 404) {
                $(this).html(template('tpl404', {}));
            } else if (xhr.status === 500) {
                $(this).html(template('tpl500', {}));
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
            $("#nav-username").text(user.realname || user.username);
            var $photo = $("#nav-user-photo");
            if(user.avatar) {
                $photo.attr('src', "assets/images/avatars/" + user.avatar);
            }
            $photo.attr('alt', user.realname || user.username);
        } catch (e) {
            console.log(e.message);
        }
    }

    //Menu相关==================
    //获取左侧导航栏
    function initNav(){
        common.get({ url: "/permission",
            data: { token: common.getToken() },
            success: function(data) {
                var menus = data.menus;
                if (menus && menus.length > 0) {
                    document.getElementById("index-sidenav").innerHTML = template('tplSideNav', {list: menus});
                }
            },
            async: false
        });
    }

    /**
     * url变化监听
     * @param L
     */
    function navchange() {/* 每次有url变更时都会触发pop回调 */
        var L = arguments.length > 1 ? arguments[1] : arguments[0];
        //菜单栈
        var stack = [];
        var c = $('.nav a[href="#!' + L + '"]');
        var a = c.parent();
        if (a.length && a[0].className !== 'active') {
            $('.nav li.active,.nav li.open').attr('class', '');
            stack.unshift({"name": $.trim(c.text()), "href": c.attr('href')});
            a[0].className = 'active';
            var p, link;
            while((p = a.parent()) && p[0].tagName === "UL" && p.hasClass('submenu')) {
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

                if(txt1 === "" || txt2 === "" || txt3 === ""){
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

        },
        /**
         * 提交数据（新增或者编辑数据）
         * @param method
         * @param api
         * @param type
         * @param data
         * @param callback
         */
        saveData: function(method, api, type, data, callback) {
            if (method) {
                common[method]({ url: api.replace('{id}', data.id), data: data, success: callback });
            } else {
                if(type === 'add') {
                    common.post({ url: typeof api === "string" && api || api["add"], data: data, success: callback });
                } else {
                    common.put({ url: (typeof api === "string" && api || api["edit"]).replace('{id}', data.id), data: data, success: callback });
                }
            }
        }

        /**
         * 删除数据
         * @param api
         * @param id
         */
        ,deleteData: function(api, id, callback){
            common['delete']({
                url: api["delete"].replace('{id}', id),
                success: function(ret) {
                    if (typeof callback == 'function') {
                        callback(ret);
                    }
                    message.success("删除成功");
                }
            })
        }

        /**
         * 打开编辑框
         * @param options {callback: "保存回调", success: "成功回调", ignore: "忽略验证元素"}
         */
        ,openFormDialog: function(options){
            var that = this;
            common.modal({
                title: (options.type && (options.type === 'add' && '新增' || '编辑') || '') + options.title,
                area: options.area || '450px',
                offset: options.offset,
                template: options.template,
                success: options.success,
                ok: function(layero, index){
                    if (options.onSubmit) {
                        options.onSubmit.call(this, layero, index);
                    } else {
                        var originData = null;
                        var fileInputs = $('input[type=file]', this.form);
                        if (fileInputs.length > 0) {
                            //混合文件
                            if( "FormData" in window ) {
                                var formDataObject = new FormData();
                                //serialize our form (which excludes file inputs)
                                $.each(this.form.serializeArray1(), function(i, item) {
                                    //add them one by one to our FormData
                                    formDataObject.append(item.name, item.value);
                                });
                                //and then add files
                                fileInputs.each(function(){
                                    var fieldName = $(this).attr('name');
                                    //for fields with "multiple" file support, field name should be something like `myfile[]`
                                    var files = $(this).data('ace_input_files');
                                    if(files && files.length > 0) {
                                        for(var f = 0; f < files.length; f++) {
                                            formDataObject.append(fieldName, files[f]);
                                        }
                                    }
                                });
                                originData = formDataObject;
                            } else {

                            }
                        } else {
                            originData = this.form.serializeObject();
                        }
                        that.saveData(options.method, options.api, options.type,
                            typeof options.formatter == 'function' && options.formatter(originData) || (originData),
                            function(ret){
                                layer.close(index);
                                message.success("保存成功");
                                typeof options.callback == 'function' && options.callback(ret);
                            });
                    }
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

