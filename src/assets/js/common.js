/**
 * 公共函数
 */
define(['jquery', 'lodash', 'layer', 'momentcn'], function ($, _) {
    "use strict";
    /* url 正則 */
    var reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
    var r20 = /%20/g,
        rbracket = /\[\]$/,
        rCRLF = /\r?\n/g,
        rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
        rsubmittable = /^(?:input|select|textarea|keygen)/i;

    var rcheckableType = (/^(?:checkbox|radio)$/i);
    var rtagName = (/<([\w:-]+)/);
    var rscriptType = (/^$|\/(?:java|ecma)script/i);
    var rArrayName = /^(.+)\[(\d+)\]$/;
    (function ($) {
        $.fn.extend({
                serializeArray1: function () {
                    return this.map(function () {

                        // Can add propHook for "elements" to filter or add form elements
                        var elements = jQuery.prop(this, "elements");
                        return elements ? jQuery.makeArray(elements) : this;
                    })
                        .filter(function () {
                            var type = this.type;

                            // Use .is( ":disabled" ) so that fieldset[disabled] works
                            return this.name && !jQuery(this).is(":disabled") &&
                                rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) &&
                                (this.checked || !rcheckableType.test(type));
                        })
                        .map(function (i, elem) {
                            var that = jQuery(this);
                            var val = that.val();
                            //ADD增加对mask的支持
                            try {
                                if (this.inputmask) {
                                    val = this.inputmask.unmaskedvalue();
                                }
                            } catch (e) {
                            }
                            return val == null ?
                                null :
                                jQuery.isArray(val) ?
                                    jQuery.map(val, function (val) {
                                        return {name: elem.name, value: val.replace(rCRLF, "\r\n")};
                                    }) :
                                    {name: elem.name, value: val.replace(rCRLF, "\r\n")};
                        }).get();
                },
                serializeObject: function () {
                    var o = {};
                    var a = this.serializeArray1();
                    $.each(a, function () {
                        var name = this.name;
                        var value = this.value;
                        var paths = name.split(".");
                        var len = paths.length;
                        var obj = o;
                        $.each(paths, function (i, e) {
                            if (i === len - 1) {
                                if (obj[e]) {
                                    if (!obj[e].push) {
                                        obj[e] = [obj[e]];
                                    }
                                    obj[e].push(value || '');
                                } else {
                                    obj[e] = value || '';
                                }
                                obj = o[e];
                            } else {
                                var idx = rArrayName.exec(e);
                                if (idx == null) {
                                    if (!obj[e]) {
                                        obj[e] = {};
                                    }
                                    obj = o[e];
                                } else {
                                    if (!obj[idx[1]]) {
                                        obj[idx[1]] = [];
                                    }
                                    if (obj[idx[1]].length < idx[2]) {
                                        obj[idx[1]].length = idx[2];
                                    }
                                    if (obj[idx[1]][idx[2]] === undefined) {
                                        obj[idx[1]][idx[2]] = {};
                                    }
                                    obj = obj[idx[1]][idx[2]];
                                }
                            }
                        });
                    });
                    return o;
                }
            }
        );

        /**
         * 获取表单数据
         * @returns {*}
         */
        $.fn.getFormData = function () {
            return $(this).serializeObject()
        };

        /**
         * 设置form表单值
         */
        $.fn.setFormData = function (data) {
            /*if(!_.isEmpty(data))
            {
                $(this)[0].reset();
                $(this).autofill(data);
            }*/
        };
    }(jQuery));
    //工程配置项
    if (!("appConfig" in window)) {
        window.appConfig = {
            "global": {
                "servletUrl": "", //异步请求地址,本地工程可以不填
                "response": { //响应结果配置
                    "statusName": "success", //数据状态的字段名称
                    "statusCode": true, //成功的状态码
                    "countName": "data.recordsTotal", //数据总数的字段名称
                    "msgName": "message", //消息名称
                    "dataName": "data" //数据列表的字段名称
                }
            }
        };
    }
    var appConfig = window.appConfig;
    //公共函数==================================
    var statusName = _.result(appConfig, "global.response.statusName", "code"),
        statusCode = _.result(appConfig, "global.response.statusCode", 0),
        msgName = _.result(appConfig, "global.response.msgName", "msg"),
        dataName = _.result(appConfig, "global.response.dataName", "data.data");

    /**
     * 获取当前token
     */
    function getToken() {
        return ace.data.get("token");
    }

    /**
     * 获取当前登录的user
     * @returns {any}
     */
    function getCurrentUser() {
        return JSON.parse(ace.data.get("user"));
    }

    /**
     * 登出系统
     */
    function logout() {
        ace.data.remove("token");
        ace.data.remove("user");
        location.replace("login.html");
        // exports.delete("/login", null, function () {
        //     ace.data.remove("token");
        //     ace.data.remove("user");
        //     location.replace("login.html");
        // });
    }

    /**
     * ajax错误处理函数
     * @param XMLHttpRequest
     * @param textStatus
     * @param errorThrown
     */
    function ajaxErrorHandler(XMLHttpRequest, textStatus, errorThrown) {
        window.globalErrorCode = 1;
        if (textStatus === "timeout") {
            layer.msg("请求超时!", {icon: 5});
        } else {
            var responseJson = XMLHttpRequest.responseJSON;
            var status = XMLHttpRequest.status;
            if (textStatus === "404") {
                message.error("请求地址出错!");
            } else if (status === '401') {
                layer.alert(responseJson && _.result(responseJson, msgName) || "身份验证失败，请重新登录", {icon: 5}, function () {
                    logout();
                });
            } else if (status === '504') {
                message.error("请求超时!");
            } else {
                if (responseJson) {
                    var msg = _.result(responseJson, msgName);
                    if (msg) {
                        message.error(msg);
                        return;
                    }
                }
                message.error("请求失败");
            }
        }
    }

    /**
     * ajax请求
     * @param url 请求地址
     * @param [type] 请求类型
     * @param [param] 请求参数
     * @param [callBackFunc] 成功回调
     * @param [async] 是否异步调用
     */
    function ajax(options) {
        //打开加载层
        var index = layer.load();
        var ajaxOption = {
            url: this.assemblyUrl(options.url),
            type: options.type || 'get',
            async: options.async !== false,
            dataType: options.dataType || "json",
            beforeSend: function (request) {
                request.setRequestHeader("X-Access-Token", getToken());
                options.beforeSend && options.beforeSend(request);
            },
            complete: function (XMLHttpRequest, textStatus) {
                //关闭加载层
                layer.close(index);
                options.complete && options.complete(XMLHttpRequest, textStatus);
            },
            success: function (result, textStatus, XMLHttpRequest) {
                window.globalErrorCode = 0;
                if (_.result(result, statusName) !== statusCode) {
                    var filters = appConfig["filters"];
                    if (!_.isEmpty(filters)) {
                        var otherFunction = filters[_.result(result, statusName)];
                        if (_.isFunction(otherFunction)) {
                            otherFunction(result);
                            return
                        }
                    }
                    var msg = _.result(result, msgName);
                    if (msg) {
                        //提示错误消息
                        message.error(msg);
                        options.error && options.error(XMLHttpRequest, textStatus, msg, result);
                    }
                    return;
                }
                try {
                    options.success && options.success(_.result(result, dataName));
                } catch (e) {
                    console.log(e)
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                ajaxErrorHandler.call(this, XMLHttpRequest, textStatus, errorThrown);
                options.error && options.error(XMLHttpRequest, textStatus, errorThrown);
            }
        };
        if (options.data) {
            if (_.isString(options.data)) {
                ajaxOption.data = options.data;
                ajaxOption.contentType = "application/json";
            } else if (_.isPlainObject(options.data)) {
                if (!_.isEmpty(options.data)) {
                    ajaxOption.data = options.data;
                    if (ajaxOption.type.toLowerCase() !== 'get') {
                        ajaxOption.data = JSON.stringify(options.data);
                    }
                    ajaxOption.contentType = "application/json";
                }
            } else {
                // Form Data
                ajaxOption.data = options.data;
                ajaxOption.contentType = false;
                ajaxOption.processData = false;
            }
        }

        $.ajax($.extend({}, options, ajaxOption));

    }

    /**
     * 遮罩弹窗
     * @param options
     */
    function modal(options) {
        layer.open({
            type: 1,
            title: options.title,
            closeBtn: options.closeBtn || 1,
            shadeClose: options.shadeClose !== false,
            area: options.area || 'auto',
            offset: options.offset || 'auto',
            maxmin: options.maxmin === true,
            skin: 'layer-ace',
            content: template(options.template.id || 'tpl-formInput', options.template.data || {}),
            btn: ['重置', options.okText || '保存'],
            yes: function (index, layero) {
                /*if(option.cancel) {
                    if(typeof option.cancel === 'function' ) {
                        var ret = option.cancel.call(this, index, layero);
                        if(typeof ret !== 'undefined' &&  ret === false) {
                            return;
                        }
                    }
                }
                layer.close(index);*/
                try {
                    $('form', layero)[0].reset();

                    if (typeof options.reset !== 'undefined') {
                        if (typeof options.reset === 'function') {
                            options.reset.call(this)
                        } else if (options.reset) {
                            $('input[type=checkbox]:checked', this.form).trigger('change');
                            $('input[type=radio]:checked', this.form).trigger('change');
                        }
                    } else {
                        $('input[type=checkbox]:checked', this.form).trigger('change');
                        $('input[type=radio]:checked', this.form).trigger('change');
                    }

                    options.reset && typeof options.reset === 'function' && options.reset.call(this)
                } catch (e) {
                }
            },
            btn2: function (index, layero) {
                var that = this;
                var doneFlag = 1;
                function submit() {
                    if (--doneFlag === 0) {
                        if (that.form && !that.form.valid()) {
                            return;
                        }
                        typeof options.ok === 'function' && options.ok.call(that, layero, index);
                    }
                }
                var editorElem = $('textarea[class*=codemirror]', this.form);
                if (editorElem && editorElem.length > 0) {
                    require(['codemirror'], function(){
                        $.each(editorElem, function(i, elem) {
                            doneFlag++;
                            var mode = $(elem).attr('data-mode');
                            require([mode], function(){
                                $(elem).text(window[$(elem).attr("id")+"_cm"].getValue());
                                submit();
                            });
                        })
                    });
                }
                submit();
                return false;
            },
            cancel: options.cancel,
            success: function (layero, index) {
                var that = this;
                var doneFlag = 1; //确保所有的模块加载完成之后调用回调
                var form = this.form = $('form', layero);
                //success callback
                function sc() {
                    if (--doneFlag === 0) {
                        //change函数在success中进行声明，因此这边顺序不可颠倒
                        typeof options.success === 'function' && options.success.call(that, layero, index, form);
                        $('input[type=checkbox]:checked, input[type=radio]:checked', form).trigger('change');
                    }
                }
                try {
                    $('input:first', form).focus();
                    var maskinput = $("[data-inputmask]", form);
                    if (maskinput && maskinput.length > 0) {
                        doneFlag++;
                        require(['jquery.inputmask'], function () {
                            doneFlag--;
                            maskinput.inputmask();
                            sc();
                        });
                    }
                    // 下拉框
                    var chosenSelect = $('.chosen-select', form);
                    if (chosenSelect.length > 0) {
                        doneFlag++;
                        require(['jquery.chosen'], function (){
                            var defaultOptions = {
                                allow_single_deselect:true,
                                placeholder_text_multiple: "请选择",
                                placeholder_text_single: "请选择",
                                no_results_text: "无匹配项",
                                width: "66.66666667%"
                            };
                            chosenSelect.each(function() {
                                var $this = $(this);
                                $this.chosen($.extend({}, defaultOptions, $this.data("options")));
                            });
                            sc();
                        });
                    }
                    // 文件上传
                    var fileInput = $("input[type=file]", form);
                    if (fileInput.length > 0 ) {
                        fileInput.ace_file_input({
                            no_file:'未选择文件',
                            btn_choose:'选择',
                            btn_change:'更改',
                            droppable:false,
                            onchange:null,
                            thumbnail:false
                        })
                        // $('.js-file-input').ace_file_input('show_file_list', [
                        //     {type: 'image', name: 'name of image', path: 'http://path/to/image/for/preview'}
                        // ]);
                    }
                    // 数字框
                    var spinner = $(".js-spinner", form);
                    if (spinner && spinner.length > 0) {
                        doneFlag++;
                        require(['fuelux.spinbox'], function () {
                            $.each(spinner, function (i, o) {
                                var t = $(o);
                                t.ace_spinner({
                                    min: t.attr('min'),
                                    max: t.attr('max'),
                                    step: t.attr('step') || 1,
                                    btn_up_class: 'btn-info',
                                    btn_down_class: 'btn-info'
                                })
                            });
                            sc();
                        });
                    }
                    //TODO 目前limit的zindex会低于layer导致看不到
                    var inputlimit = $('.limited', form);
                    if (inputlimit && inputlimit.length > 0) {
                        doneFlag++;
                        require(['jquery.inputlimiter'], function () {
                            inputlimit.inputlimiter({
                                remText: '还能够输入%n个字',
                                limitText: '最多允许: %n.'
                            });
                            sc();
                        });
                    }
                    var autosizeElem = $('textarea[class*=autosize]', form);
                    if (autosizeElem && autosizeElem.length > 0) {
                        doneFlag++;
                        require(['autosize'], function (autosize) {
                            autosize(autosizeElem);
                            sc();
                        });
                    }
                    var editorElem = $('textarea[class*=codemirror]', form);
                    if (editorElem && editorElem.length > 0) {
                        require(['codemirror'], function(CodeMirror){
                            $.each(editorElem, function(i, elem) {
                                doneFlag++;
                                var mode = $(elem).attr('data-mode');
                                require([mode], function(){
                                    window[$(elem).attr("id")+"_cm"] = CodeMirror.fromTextArea(elem, {
                                        lineNumbers: true,
                                        matchBrackets: true,
                                        mode: mode,
                                        indentUnit: 4,
                                        indentWithTabs: true
                                    });
                                    sc();
                                });
                            })
                        });
                    }
                    //TODO 待完善规则
                    require(["jquery.validate.custom"], function () {
                        form.validate($.extend({
                            errorElement: 'div',
                            errorClass: 'help-block',
                            focusInvalid: false,
                            ignore: options.ignore || ":hidden", //隐藏元素不验证
                            highlight: function (e) {
                                $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
                            },
                            success: function (e) {
                                $(e).closest('.form-group').removeClass('has-error');//.addClass('has-info');
                                $(e).remove();
                            },
                            errorPlacement: function (error, element) {
                                if (element.is('input[type=checkbox]') || element.is('input[type=radio]')) {
                                    var controls = element.closest('div[class*="col-"]');
                                    if (controls.find(':checkbox,:radio').length > 1) controls.append(error);
                                    else error.insertAfter(element.nextAll('.lbl:eq(0)').eq(0));
                                }
                                else if (element.is('.select2')) {
                                    error.insertAfter(element.siblings('[class*="select2-container"]:eq(0)'));
                                }
                                else if (element.is('.chosen-select')) {
                                    error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
                                }
                                else
                                    error.insertAfter(element.parent());
                            },
                            submitHandler: function (form) {
                            },
                            invalidHandler: function (form) {
                            }
                        }, options.rules || {}));
                        sc();
                    })
                } catch (e) {
                    console.log(e)
                }
            }
        });
    }

    window.message = {
        /**错误msg提示 */
        error: function (text, time) {
            layer.msg(text, {icon: 5, time: time || 5000});
        },
        /**成功 msg提示 */
        success: function (text, time) {
            layer.msg(text, {icon: 1, time: time || 5000});
        },
        /**警告弹出提示*/
        warning: function (text, time) {
            layer.msg(text, {icon: 0, time: time || 5000});
        },
        confirm: layer.confirm
    };

    return {
        ApiContext: _.result(appConfig, "global.servletUrl"),
        modal: modal,
        popconfirm: function (options) {
            layer.tips(
                ['<i class="fa fa-exclamation-circle fa-lg layer-popover-icon"></i><span class="layer-popover-message-title">', options.title, '</span>'].join('')
                , options.dom
                , $.extend(true, {
                    time: -1,
                    skin: 'layer-ace-popconfirm',
                    btn: [options.cancelText || '取消', options.okText || '保存'],
                    yes: options.cancel,
                    btn2: function (index, layero) {
                        typeof options.ok === 'function' && options.ok.call(this, layero, index);
                        return false;
                    },
                }, options))
        },
        modifyTitle: function (title) {
            document.title = title;
        },
        ajaxErrorHandler: ajaxErrorHandler,
        ajax: ajax,
        assemblyUrl: function(url) {
            if (!_.isEmpty(this.ApiContext) && !(url.indexOf('http://') == 0 || url.indexOf('https://') == 0)) {
                url = this.ApiContext + url;
            }
            return url + (url.indexOf("?") >=0 ? "&" : "?" + "_=" + Number(new Date()));
        },
        download: function(url) {
            window.open(url + (url.indexOf("?") != -1 ? "&" : "?") + "token=" + this.getToken());
        },
        get: function (options) {
            this.ajax($.extend(options, { type: "get" }))
        },
        post: function (options) {
            this.ajax($.extend(options, { type: "post" }))
        },
        put: function (options) {
            this.ajax($.extend(options, { type: "put" }))
        },
        "delete": function (options) {
            this.ajax($.extend(options, { type: "delete" }))
        },
        initZtree: function (elem, data, settings) {
            var defaultSetting = {
                view: {
                    showIcon: function (treeId, treeNode) {
                        return false;
                    }
                },
                check: {
                    enable: true,
                    chkStyle: "checkbox",
                },
                data: {
                    simpleData: {
                        enable: false
                    }
                },
                callback: {
                    onClick: zTreeOnClick
                }
            };

            function zTreeOnClick(event, treeId, treeNode) {
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (treeObj.setting.callback.beforeCheck) {
                    if (treeObj.setting.callback.beforeCheck.call(this, treeId, treeNode)) {
                        treeObj.checkNode(treeNode, !treeNode.checked, true);
                    }
                } else {
                    treeObj.checkNode(treeNode, !treeNode.checked, true);
                }
            }

            require(['zTree'], function () {
                $.fn.zTree.init(elem, $.extend(true, defaultSetting, settings || {}), data);
            });
        },
        //数字前置补零
        digit: function (num, length) {
            var str = '';
            num = String(num);
            length = length || 2;
            for (var i = num.length; i < length; i++) {
                str += '0';
            }
            return num < Math.pow(10, length) ? str + (num | 0) : num;
        },
        //转化为日期格式字符
        toDateString: function (time, format) {
            var that = this
                , date = new Date(time || new Date())
                , ymd = [
                that.digit(date.getFullYear(), 4)
                , that.digit(date.getMonth() + 1)
                , that.digit(date.getDate())
            ]
                , hms = [
                that.digit(date.getHours())
                , that.digit(date.getMinutes())
                , that.digit(date.getSeconds())
            ];

            format = format || 'yyyy-MM-dd HH:mm:ss';

            return format.replace(/yyyy/g, ymd[0])
                .replace(/MM/g, ymd[1])
                .replace(/dd/g, ymd[2])
                .replace(/HH/g, hms[0])
                .replace(/mm/g, hms[1])
                .replace(/ss/g, hms[2]);
        },
        //防 xss 攻击
        escape: function (html) {
            return String(html || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        },
        ip2Int: function(ip) {
            var num = 0;
            ip = ip.split(".");
            num = Number(ip[0]) * 256 * 256 * 256 + Number(ip[1]) * 256 * 256 + Number(ip[2]) * 256 + Number(ip[3]);
            num = num >>> 0;
            return num;
        },
        isUrl: function(input) {
            return reg.test(input);
        },
        getToken: getToken,
        getCurrentUser: getCurrentUser,
        logout: logout
    };
});
