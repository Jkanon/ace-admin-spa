/**
 * jquery.dataTables的封装
 * @author im.Jkanon@gmail.com
 */
define(['common', 'datatables.net-bs'], function(common){
    "use strict";

    jQuery.fn.dataTableExt.oApi.fnProcessingIndicator = function ( oSettings, onoff )
    {
        if ( onoff === undefined ) {
            onoff = true;
        }
        this.oApi._fnProcessingDisplay( oSettings, onoff );
    };

    // 外部接口
    var table = {
        // 全局配置项
        config: {
            checkName: 'CHECKED' // 是否选中状态的字段名
            ,indexName: 'TABLE_INDEX' // 下标索引名
        }
        ,cache: {} // 数据缓存
        ,index: 0

        //设置全局项
        ,set: function(options){
            var that = this;
            that.config = $.extend({}, that.config, options);
            return that;
        }
    }

    // 操作当前实例
    ,thisTable = function(){
        var that = this
            ,options = that.config
            ,id = options.id || options.index;

        if(id){
            thisTable.that[id] = that; //记录当前实例对象
            thisTable.config[id] = options; //记录当前实例配置项
        }

        return {
            config: options,
            addRow: function(data){table.addRow(id, data)},
            reload: function(){
                if(arguments.length === 0){
                    table.reload(id);
                }else if(arguments.length === 1) {
                    table.reload(id, arguments[0]);
                }else if(arguments.length === 2){
                    table.reload(id, arguments[0], arguments[1]);
                }
            }
        }
    }

    // 获取当前实例配置项
    ,getThisTableConfig = function(id){
        var config = thisTable.config[id];
        if(!config) console.error('The ID option was not found in the table instance');
        return config || null;
    }

    // 转义html
    ,escapeHTML = function (text) {
        if (typeof text === 'string') {
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/`/g, '&#x60;');
        }
        return text;
    }

    // 字符常量
    ,MOD_NAME = 'datatable'
    ,EMPTY_STR = ''

    // thead区域模板
    ,TPL_HEADER = function(){
        return [
            '<thead>',
            '{{each cols item1 i1}}',
                '<tr>',
                '{{if detailView }}<th></th>{{/if}}',
                '{{each item1 item2 i2}}',
                    '<th {{if item2.type==="checkbox"||item2.type==="numbers"}}class="align-center"{{else if item2[align]}}class="align-{{item2[align]}}"{{/if}}>',
                    '{{if item2.type === "checkbox"}}',
                        '<label class="pos-rel">',
                            '<input name="table-checkbox" type="checkbox" filter="table-allChoose" class="ace">',
                            '<span class="lbl"></span>',
                        '</label>',
                    '{{/if}}',
                    '{{item2.title||""}}',
                    '</th>',
                '{{/each}}',
                '</tr>',
            '{{/each}}',
            '</thead>'
        ].join('');
    }()
    ,TPL_BODY = '<tbody></tbody>'
    // 工具栏菜单
    ,TPL_TOOLBAR = [
            '<div class="hidden-sm hidden-xs action-buttons">',
            '{{each list item index}}',
                '<a href="javascript:;" class="{{item.color}}{{if item.tooltip}} {{item.tooltip.className}}" data-rel="tooltip" data-original-title="{{item.tooltip.title}}"{{else}}"{{/if}} {{if item.event}}ace-event="{{item.event}}"{{/if}} {{if item.pop&&item.pop.title}}data-pop="{{typeof item.pop.title === \'function\' ? item.pop.title(full): item.pop.title}}"{{/if}}{{if item.disabled}} disabled{{/if}}>',
                '<i class="ace-icon fa fa-{{item.icon}} bigger-130"></i>',
                '</a>',
            '{{/each}}',
            '</div>',
            '<div class="hidden-md hidden-lg">',
                '<div class="inline pos-rel">',
                    '<button class="btn btn-minier btn-yellow dropdown-toggle" data-toggle="dropdown" data-position="auto">',
                        '<i class="ace-icon fa fa-caret-down icon-only bigger-120"></i>',
                    '</button>',
                    '<ul class="dropdown-menu dropdown-only-icon dropdown-yellow dropdown-menu-right dropdown-caret dropdown-close">',
                    '{{each list item index}}',
                        '<li>',
                            '<a href="javascript:;" {{if item.tooltip}}class="{{item.tooltip.className}}" data-rel="tooltip" data-original-title="{{item.tooltip.title}}"{{/if}} {{if item.event}}ace-event="{{item.event}}"{{/if}} {{if item.pop&&item.pop.title}}data-pop="{{typeof item.pop.title === \'function\' ? item.pop.title(full): item.pop.title}}"{{/if}}{{if item.disabled}} disabled{{/if}}>',
                            '<span class="{{item.color}}">',
                                '<i class="ace-icon fa fa-{{item.icon}} bigger-120"></i>',
                             '</span>',
                        '</a>',
                        '</li>',
                    '{{/each}}',
                    '</ul>',
                '</div>',
            '</div>'
    ].join('')
    // siwtch按钮
    ,TPL_SWITCH = [
        '<label class="inline">',
            '{{if label}}<small class="muted">{{label}}</small>{{/if}}',
            '<input {{if data === checkedValue}}checked{{/if}} type="checkbox" class="ace ace-switch {{if type}}ace-switch-{{type}}{{/if}} {{if color}}{{color}}{{/if}}"{{if event}} ace-event="{{event}}"{{/if}}>',
            '<span class="lbl middle"></span>',
        '</label>'
    ].join('')
    // 链接
    ,TPL_LINK = '<a href={{href}} target="{{target}}">{{title}}</a>'
    ,_WIN = $(window)
    ,_DOC = $(document)
    // 默认工具栏菜单集合
    ,DEFAULT_TOOLBAR = {
        'view': {
            icon: 'search-plus',
            tooltip: {
                title : "查看",
                className: "tooltip-info"
            },
            color: "blue",
            event: "view"
        },

        'edit': {
            icon: 'pencil',
            tooltip: {
                title : "编辑",
                className: "tooltip-success"
            },
            color: "green",
            event: "edit"
        },

        'delete': {
            icon: 'trash-o',
            tooltip: {
                title : "删除",
                className: "tooltip-error"
            },
            color: "red",
            event: "delete",
            pop: {
                title: "此操作不可撤销，确定删除吗？"
            }
        }
    }

    // 构造器
    ,Class = function(options, callback){
        var that = this;
        that.index = ++table.index;
        that.config = $.extend({}, that.config, table.config, options);
        that.deps = [];
        if (options.treeGrid) {
            that.deps.push("datatables.treeGrid");
        }
        if (options.responsive !== false) {
            that.deps.push("datatables.responsive");
        }
        that.render(callback);
    };

    // 默认配置
    Class.prototype.config = {
        deferRender: true  //延迟渲染，大数量时可以提高性能
        ,detailView: false //非父子表
        ,lengthChange: true //是否允许改变分页显示条数
        ,lengthMenu: [10, 25, 50, 75, 100] //默认分页条数下拉选项
        ,pageLength: 10 //默认分页条数
        ,pagingType: "full_numbers"
        ,paging: true //默认开启分页
        ,searching: true //默认支持搜索
        ,searchingDisplay: false //默认不显示搜索栏
        ,info: true //控制是否显示表格左下角的信息
        ,loading: true //请求数据时，是否显示loading，对应datatables的processing
        //启用自动调整列宽
        ,autoWidth: false //TODO 目前自动调整宽度有问题，待修复
        ,method: 'get' //ajax默认请求方式
        //国际化
        ,lang: {
            sProcessing: "处理中...", //如果你的加载中是文字，则直接写上文字即可，如果是gif的图片，使用img标签就可以加载
            sLengthMenu: "每页 _MENU_ 项",
            sZeroRecords: "没有匹配结果",
            sInfo: "当前显示第 _START_ 至 _END_ 项，共 _TOTAL_ 项。",
            sInfoEmpty: "当前显示第 0 至 0 项，共 0 项",
            sInfoFiltered: "(由 _MAX_ 项结果过滤)",
            sInfoPostFix: "",
            sSearch: "本地搜索：",
            sUrl: "",
            sEmptyTable: '暂无数据',
            sLoadingRecords: "载入中...",
            sInfoThousands: ",",
            oPaginate: {
                sFirst: "首页",
                sPrevious: "上页",
                sNext: "下页",
                sLast: "末页",
                sJump: "跳转"
            },
            oAria: {
                sSortAscending: ": 以升序排列此列",
                sSortDescending: ": 以降序排列此列"
            }
        }
    };

    // 根据列类型，定制化参数
    Class.prototype.initOpts = function() {
        var that = this
            , options = that.config
            //默认宽度
            ,initWidth = {
                checkbox: '42px'
                ,radio: '42px'
                ,numbers: '40px'
            };
        $.each(options.cols, function(i1, item1){
            $.each(item1, function(i2, item2){
                if(!item2) {
                    item1.splice(i2, 1);
                    return;
                }

                if(!item2.type) item2.type = "normal";
                if(!item2.colspan) item2.colspan = 1;
                if(!item2.rowspan) item2.rowspan = 1;
                if(item2.type !== "normal"){
                    item2.width = item2.width || initWidth[item2.type];
                }
                item2.align = item2.align || ((item2.type ==='checkbox' || item2.type === 'numbers') && 'center') || '';
                item2.escape = item2.escape === false;  //默认转义
                // datatables相关的定义
                if(!item2.field) item2.field = item2.field || EMPTY_STR;
                item2.orderable = item2.orderable === true; //默认不排序
            })
        });
    };

    //表格渲染
    Class.prototype.render = function(callback) {
        var that = this
            , options = that.config;
        options.elem = typeof(options.elem) === 'string' ? $(options.elem) : options.elem;
        options.id = options.id || options.elem.attr('id') || that.index;
        options.index = that.index;
        that.key = options.id || options.index;

        //响应数据的自定义格式
        options.response = $.extend({
            statusName: 'success'
            ,statusCode: true
            ,msgName: 'message'
            ,dataName: 'data.data'
            ,countName: 'data.recordsTotal'
            ,filterCountName: 'data.recordsFiltered'
            ,draw: 'data.draw'
        }, options.response);

        if(!options.elem[0]) return that;

        that.initOpts();

        //开始插入替代元素
        that.renderTitle();
        that.renderHeader();
        require(that.deps, function() {
            that.renderData();
            that.events();
            callback && callback();
        });
    };

    // 遍历表头
    Class.prototype.eachCols = function(callback){
        var cols = $.extend(true, [], this.config.cols)
            ,arrs = [], index = 0;

        //重新整理表头结构
        $.each(cols, function(i1, item1){
            $.each(item1, function(i2, item2){
                //如果是组合列，则捕获对应的子列
                if(item2.colspan > 1){
                    var childIndex = 0;
                    index++;
                    item2.CHILD_COLS = [];
                    $.each(cols[i1 + 1], function(i22, item22){
                        if(item22.PARENT_COL || childIndex === item2.colspan) return;
                        item22.PARENT_COL = index;
                        item2.CHILD_COLS.push(item22);
                        childIndex = childIndex + (item22.colspan > 1 ? item22.colspan : 1);
                    });
                }
                if(item2.PARENT_COL) return; //如果是子列，则不进行追加，因为已经存储在父列中
                arrs.push(item2)
            });
        });

        //重新遍历列，如果有子列，则进入递归
        var eachArrs = function(obj){
            $.each(obj || arrs, function(i, item){
                if(item.CHILD_COLS) return eachArrs(item.CHILD_COLS);
                callback(i, item);
            });
        };

        eachArrs();
    };

    // 标题栏渲染
    Class.prototype.renderTitle = function() {
        if (this.config.title) {
            this.config.elem.before("<div class='table-header'>" + this.config.title + "</div>");
        }
    };

    // 表头渲染
    Class.prototype.renderHeader = function() {
        var options = this.config,
            othis = options.elem;
        othis.append(template.render(TPL_HEADER, options));
    };

    // 数据渲染
    Class.prototype.renderData = function(){
        var that = this
            , options = that.config
            , detailView = options.detailView
            , othis = options.elem
            , response = options.response
            , cols = options.cols
            , columnsDef = []
            , order = [];
        //父子表
        if (detailView) {
            columnsDef.push({
                data: EMPTY_STR
                ,orderable: false
                ,width: '42px'
                ,className: 'align-center details-control-' + (detailView.type || '1')
                ,defaultContent: '<div class="action-buttons">' +
                                    '<a href="javascript:;" class="bigger-140 show-details-btn '+ (detailView.color || "green") +'">' +
                                        '<i class="ace-icon fa"></i>' +
                                        '<span class="sr-only">Details</span>' +
                                    '</a>' +
                                '</div>'
            });
        }

        $.each(cols, function(i1, item1){
            if(item1.length === 0) return;

            that.eachCols(function(i3, item3){
                if(item3.colspan > 1) return;
                var columnDef = {
                    data: item3.field
                    ,visible: item3.hide !== true
                    ,cellType: item3.cellType || 'td'
                    ,className: (item3.align && ('align-' + item3.align + ' ')) + (item3.className || '')
                    ,orderable: item3.orderable
                    ,width: item3.width
                    ,render: function (data, type, full, meta) {
                        //行号
                        var numbers = meta.settings._iDisplayStart + meta.row + 1 ;

                        if (item3.type === 'checkbox' || item3.type === 'numbers') {
                            var td = ['<div class="table-cell-' + function () { //返回对应的CSS类标识
                                var str = (options.index + '-' + (item3.field || i3));
                                return item3.type === 'normal' ? str
                                    : (str + ' acetable-cell-' + item3.type);
                            }() +'">' + function () {
                                //渲染复选框列视图
                                if (item3.type === 'checkbox') {
                                    var props = options.rowSelection && options.rowSelection.getCheckProps && options.rowSelection.getCheckProps(full, meta) || {};
                                    return '<label class="pos-rel"><input type="checkbox" name="table-checkbox" class="ace"' + function () {
                                        var ret = '';
                                        $.each(props, function(k, v) {
                                            if (typeof v === 'boolean') {
                                               if (v === true) {
                                                   ret += ' ' + String(k);
                                               }
                                            } else {
                                                ret += ' ' + String(k);
                                                ret += '="' + String(v) + '"';
                                            }
                                        });
                                        return ret;
                                    }() + '><span class="lbl"></span></label>';
                                } else if (item3.type === 'numbers') {
                                    return numbers;
                                }
                            }()
                                , '</div>'].join('');
                            return td;
                        } else if(item3.type === 'switch' || item3["switch"]) {
                            return template.render(TPL_SWITCH, $.extend(true, {data: data}, item3["switch"]))
                        }

                        var wrapperText = function() {
                            if (item3.type === 'link') {
                                return template.render(TPL_LINK, {
                                    target: item3.link && item3.link.target || '_blank'
                                    ,title: item3.link && item3.link.title || data
                                    ,href: item3.link && item3.link.href || data
                                });
                            }

                            if (item3.render) {
                                if (typeof item3.render === "function") {
                                    return item3.render(data, type, full, meta);
                                } else if (typeof item3.render === "object") {
                                    return _.result(item3.render, data);
                                }
                                return item3.render;
                            }
                            if (item3.templet) {
                                return template.render(($(item3.templet).html() || String(item3.templet)),full);
                            }
                            //解析工具列模板
                            if(item3.toolbar){
                                if(Array.isArray(item3.toolbar)) {
                                    var list = [];
                                    $.each(item3.toolbar, function(i, tb) {
                                        if(typeof tb === 'string') {
                                            list.push(DEFAULT_TOOLBAR[tb]);
                                        } else {
                                            var toolbar = $.extend(true, {}, tb);
                                            if(toolbar.condition) {
                                                var condition = toolbar.condition;
                                                if(typeof condition === 'string') {
                                                    condition = _.result(full, condition)
                                                } else if(typeof condition === 'function'){
                                                    condition = condition(full)
                                                }
                                                if(!condition) return
                                            }
                                            if (typeof toolbar.disabled !== 'undefined') {
                                                var disabled = toolbar.disabled;
                                                if(typeof disabled === 'string') {
                                                    disabled = _.result(full, disabled)
                                                } else if(typeof disabled === 'function'){
                                                    disabled = disabled(full)
                                                }
                                                toolbar.disabled = disabled;
                                            }
                                            if (typeof toolbar.tooltip !== 'undefined') {
                                                var title = toolbar.tooltip.title;
                                                if(typeof title === 'function'){
                                                    title = title(full)
                                                }
                                                toolbar.tooltip.title = title;
                                            }
                                            list.push(toolbar);
                                        }
                                    });

                                    return template.render(TPL_TOOLBAR, {list: list, full: full});
                                }
                                return template.render(($(item3.toolbar).html()||EMPTY_STR), full);
                            }

                            var ret = function() {
                                if (item3.defaultContent) {
                                    return (typeof data === 'undefined' || data === '' || data === null) ? item3.defaultContent : String(data);
                                }
                                return (typeof data === 'undefined' || data === null) ? (item3.defaultContent || EMPTY_STR) : String(data);
                            }();
                            return item3.escape ? escapeHTML(ret) : ret;
                        }();
                        //return ['<div class="dataTable-cell">', wrapperText, '</div>'].join('')
                        return wrapperText;
                    }
                    ,defaultContent: item3.defaultContent || EMPTY_STR
                };
                var attr = {};
                //下面改成class
                //if(item3.align) attr['align'] = item3.align;
                if(item3.event) attr['ace-event'] = item3.event; //自定义事件
                if(item3.style) attr['style'] = item3.style; //自定义样式
                if(!$.isEmptyObject(attr)) {
                    columnDef.createdCell = function (td, cellData, rowData, row, col) {
                        $(td).attr(attr)
                    }
                }
                columnsDef.push(columnDef);

                //排序方向
                if(item3.order) {
                    item3.sort = item3.order.toLowerCase() === 'asc' || 'desc';
                    order.push([detailView ? i3+1 : i3, item3.order]);
                }
            });
        });


        var datatableOption = {
            serverSide: !(!options.url || options.serverSide === false )
            ,processing: options.loading
            ,language: options.lang //提示信息
            ,lengthMenu: options.lengthMenu //每页长度
            ,lengthChange: options.lengthChange // 是否允许产品改变表格每页显示的记录数
            ,pagingType: options.pagingType
            ,pageLength: options.pageLength
            ,paging: options.paging
            ,searching: options.searching
            ,search: options.search
            // TODO searchCols放到各个列定义中去
            ,searchCols: options.searchCols
            ,contentPadding: options.contentPadding
            ,info: options.info
            ,autoWidth: options.autoWidth
            ,scrollCollapse: true
            // TODO 使用treeGrid的时候不能使用延迟渲染 —— 之后可以在treeGrid中手动调用draw
            ,deferRender: options.treeGrid ? false : options.deferRender
            ,dom: options.dom || (options.searchingDisplay ? null :
                    "<'row'<'col-sm-6'l>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row'<'col-sm-5'i><'col-sm-7'p>>"
            )
            ,responsive: typeof options.responsive === 'undefined' ? true : options.responsive
            ,treeGrid: options.treeGrid
            ,order: order
            ,columns: columnsDef
            // TODO 改成新版的ajax.data
            ,fnServerParams: options.fnServerParams
            ,drawCallback: function (settings) {
                //各级容器
                options.api = this.api();
                that.layHeader = $(options.api.table().header());
                that.layBody = $(options.api.table().body());

                var _pageJump = [
                    '<div class="page_jump">'
                    ,'{{if pages>0}}'
                    ,'<input type="number" min="1" max="{{pages}}">'
                    ,'<a class="paginate_button" tabindex="0">跳转</a>'
                    ,'{{/if}}'
                    ,'</div>'
                ].join('');
                var pageInfo = options.api.page.info();
                that.pagination = $('.dataTables_paginate', options.api.table().container());
                that.pagination
                    .wrapInner($('<div>', {'class': 'pagination'}))
                    .append(template.render(_pageJump, pageInfo));
                var jumpNumberInput = $('.page_jump input', that.pagination);
                if (pageInfo.pages > 0) {
                    function fixJumpNumber() {
                        var val = parseInt(jumpNumberInput.val());
                        if (isNaN(val)) {
                            jumpNumberInput.val('');
                        } else {
                            if (val > pageInfo.pages) {
                                val = pageInfo.pages;
                            } else if (val < 1) {
                                val = 0;
                            }
                            jumpNumberInput.val(val);
                        }
                    }
                    function jumpAction() {
                        fixJumpNumber();
                        var val = parseInt(jumpNumberInput.val());
                        if (!isNaN(val)) {
                            options.api.page(val - 1).draw(false);
                        }
                    }
                    $('.page_jump', that.pagination)
                        .off(ace.click_event, '.paginate_button')
                        .off('keypress', 'input')
                        .off('input', 'input')
                        .on(ace.click_event, '.paginate_button', jumpAction)
                        .on('keypress', 'input', function(e) {
                            if (e.which === 13) {
                                jumpAction();
                            }
                        })
                        .on('input', 'input', fixJumpNumber)
                    ;
                } else {
                    jumpNumberInput.attr('disabled', true);
                    $('.page_jump .paginate_button', that.pagination).addClass('disabled');
                }
                that.syncCheckAll();
                //$(this).closest('.layui-form').attr('lay-filter', 'LAY-table-'+that.index);
                if(options.drawCallback && typeof options.drawCallback === "function") {
                    options.drawCallback.call(this, settings);
                }
            }
        };

        if(options.height) {
            //TODO 这边需要改进，通过dom判断lp出现的次数*38
            //'<"layui-box"lp><"layui-form"t><"layui-box"ilp>'
            var full = $(window).height() - $('thead', options.elem).offset().top - $('thead', options.elem).outerHeight() - 38 - 15 + 8;
            try {
                datatableOption.scrollY = eval(options.height.toString().replace('full', full));
            } catch (e) {
                datatableOption.scrollY = options.height;
            }
        }

        if(typeof options.createdRow === 'function') {
            datatableOption.createdRow = options.createdRow;
        }

        var cacheData = function(data) {
            that.key = options.id || options.index;
            table.cache[that.key] = data; //记录数据
        };

        if(options.url) {
            //ajax
            datatableOption.ajax = {
                url: common.assemblyUrl(options.url)
                ,type: options.method
                ,params: options.params
                ,dataType: "json"
                ,beforeSend: function (request) {
                    request.setRequestHeader("X-Access-Token", common.getToken());
                }
                ,dataSrc: function (res) {
                    var data = [];
                    if(_.result(res, response.statusName) !== response.statusCode) {
                        layer.msg("请求出错了！", {icon: 5});
                        that.elem.fnProcessingIndicator(false);
                        res.recordsTotal = 0;
                        res.recordsFiltered = 0;
                    } else {
                        res.draw = _.result(res, response.draw);
                        res.recordsTotal = _.result(res, response.countName);
                        res.recordsFiltered = _.result(res, response.filterCountName);
                        data = _.result(res, response.dataName);
                    }
                    data = function() {
                        //回调
                        if (typeof options.responseHandler === 'function') {
                            return options.responseHandler(data) || data
                        }
                        return data;
                    }();
                    cacheData(data);
                    return data
                }
                ,error : function(XMLHttpRequest, textStatus, errorThrown){
                    common.ajaxErrorHandler.call(this, XMLHttpRequest, textStatus, errorThrown);
                    that.elem.fnProcessingIndicator(false);
                }
            }
        } else if(options.data && options.data.constructor === Array) {
            //本地数据源
            datatableOption.data = options.data;
            cacheData(datatableOption.data);
        }
        that.elem = othis.dataTable(datatableOption);
        /*if(options.toggleMenu) {

            var api = that.elem.api();
            var columns = api.columns().header();
            var toggleCols = options.toggleMenu.cols || api.columns().indexes();
            var data = [];
            layui.each(columns, function(i, e) {
                toggleCols.contains(i) && data.push({"index":i, "name": $(e).html(), "checked": !$(e).is(":hidden")});
            })
            var tplColumnFilter = $("#tpl_column_filter").html().replace(/(\/\/\<!\-\-)|(\/\/\-\->)/g, "");
            var filter = $(api.table().container()).find('.am-datatable-filter').append(Handlebars.compile(tplColumnFilter)({"id":id, "data": data}));
            filter.find("input[type='checkbox']").on("change", function(){
                toggleColumn(api, this.value);
            })
        }*/
    };

    //同步选中值状态
    Class.prototype.setCheckData = function(index, checked){
        var that = this
            ,options = that.config
            ,thisData = table.cache[that.key];
        if(!thisData[index]) return;
        if(thisData[index].constructor === Array) return;
        thisData[index][options.checkName] = checked;
    };

    //同步全选按钮状态
    Class.prototype.syncCheckAll = function(){
        var that = this
            ,options = that.config
            ,checkAllElem = that.layHeader.find('input[name="table-checkbox"]')
            ,syncColsCheck = function(checked){
                that.eachCols(function(i, item){
                    if(item.type === 'checkbox'){
                        item[options.checkName] = checked;
                    }
                });
                return checked;
            };

        if(!checkAllElem[0]) return;

        if(table.checkStatus(that.key).isAll){
            if(!checkAllElem[0].checked){
                checkAllElem.prop('checked', true);
            }
            syncColsCheck(true);
        } else {
            if(checkAllElem[0].checked){
                checkAllElem.prop('checked', false);
            }
            syncColsCheck(false);
        }
    };

    //事件处理
    Class.prototype.events = function() {
        var that = this
            ,options = that.config
            ,_BODY = $('body')
            ,api = options.elem.api()
            , thisTable = api.table().node()
        ;
        $(thisTable)
            //复选框选择
            .on('click', ace.vars['old_ie'] ? 'input[name="table-checkbox"]' : 'input[name="table-checkbox"]+', function(e){
                var $table = $(this).closest('table');
                if(!$table.is(thisTable))
                    return;
                var checkbox = this.tagName === "INPUT" ? $(this) : $(this).prev()
                    ,childs = that.layBody.find('input[name="table-checkbox"]')
                    ,tr = checkbox.parents('tr')
                    ,index = api.row(tr).index()
                    ,checked = ace.vars['old_ie'] ? checkbox[0].checked : !checkbox[0].checked
                    ,isAll = checkbox.attr('filter') === 'table-allChoose';
                //全选
                if(isAll){
                    childs.each(function(i, item){
                        var $item = $(item);
                        if (!($item.prop("disabled") || $item.hasClass("disabled"))) {
                            if(item.checked !== checked) {
                                $(item).closest('tr').toggleClass('selected');
                                item.checked = checked;
                            }
                            that.setCheckData(i, checked);
                        }
                    });
                    that.syncCheckAll();
                    if (!ace.vars['old_ie']) {
                        //在syncCheckAll中会进行选中，此时阻止默认点击选中事件
                        e.preventDefault();
                    }
                } else {
                    if(!(checkbox.prop("disabled") || checkbox.hasClass("disabled"))) {
                        tr.toggleClass('selected');
                        that.setCheckData(index, checked);
                        that.syncCheckAll();
                    }
                }
                /*filter && layui.event.call(this, MOD_NAME, 'checkbox('+ filter +')', {
                    checked: checked
                    ,data: table.cache[that.key] ? (table.cache[that.key][index] || {}) : {}
                    ,type: isAll ? 'all' : 'one'
                });*/
                //e.preventDefault();
            })
            //工具条操作事件
            .on(ace.click_event, '*[ace-event]', function(){
                var $table = $(this).closest('table');
                if(!$table.is(thisTable))
                    return;

                var self = this,
                    othis = $(self)
                    ,tr = othis.parents('tr').eq(0)
                    ,row = api.row(tr)
                    ,index = row.index()
                    ,ELEM_CLICK = 'ace-table-click'
                    ,data = row.data()
                ;

                if(!othis.parents('table.dataTable').eq(0).is(api.table().node()))
                    return;

                var event = othis.attr('ace-event');
                var popTitle = othis.attr('data-pop');
                var triggerEvent = function(layero, layeroIndex) {
                    that.elem.trigger(
                        event, [{
                            data: data
                            , target: self
                            , table: that.elem
                            , event: event
                            , row: row
                            , tr: tr
                            , layeroIndex: layeroIndex  //only in popconfirm
                            , del: function (redraw) {
                                row.remove().invalidate();
                                if (redraw !== false) {
                                    row.draw(false)
                                }
                            }
                            , update: function (fields, redraw) {
                                row.data(fields).invalidate();
                                if (redraw === true) {
                                    row.draw(false);
                                }
                            }
                        }]
                    );
                };
                if(popTitle) {
                    common.popconfirm({
                        title: popTitle,
                        dom: self,
                        okText: '删除',
                        ok: triggerEvent
                    })
                }else {
                    triggerEvent();
                }

                // TODO 添加样式区分操作栏点击选中行
                tr.addClass(ELEM_CLICK).siblings('tr').removeClass(ELEM_CLICK);
            })
            //折叠展开
            .on(ace.click_event, '.show-details-btn', function () {
                var $this = $(this);
                var $table = $this.closest('table');
                if(!$table.is(thisTable))
                    return;
                var tr = $this.closest('tr');
                var td = $this.closest('td');
                var row = api.row( tr );
                if ( row.child.isShown() ) {
                    row.child.hide();
                    td.removeClass('shown');
                }
                else {
                    row.child.show();
                    td.addClass('shown');
                }
            } )
    };

    // 表格选中状态
    table.checkStatus = function(id){
        var nums = 0
            ,invalidNum = 0
            ,arr = []
            ,data = table.cache[id] || []
        ;
        // 计算全选个数
        $.each(data, function(i, item){
            if(item.constructor === Array){
                invalidNum++; //无效数据，或已删除的
                return;
            }
            if(item[table.config.checkName]){
                nums++;
                arr.push(table.clearCacheKey(item));
            }
        });
        return {
            data: arr //选中的数据
            ,isAll: data.length ? (nums === (data.length - invalidNum)) : false //是否全选
        };
    };

    // 表格重载
    thisTable.that = {}; //记录所有实例对象
    thisTable.config = {}; //记录所有实例配置项

    /**
     * 表格重载
     * @param id
     * @param [boolean|url] resetPaging|reloadUrl
     * @param {boolean}
     */
    table.reload = function(){
        if(arguments.length < 1)
            return;
        var config = getThisTableConfig(arguments[0]);
        if(!config) return;
        if(arguments.length ===1) {
            return config.api.ajax.reload(null, false);
        }
        if(arguments.length === 2) {
            if(typeof arguments[1] === 'boolean') {
                return config.api.ajax.reload(null, arguments[1]);
            }else {
                return config.api.url(arguments[1]).load(null, false)
            }
        }
        if(arguments.length === 3) {
            return config.api.url(arguments[1]).load(null, arguments[2]);
        }

    };

    /**
     * 新增新行
     */
    table.addRow = function (id, data) {
        var config = getThisTableConfig(id);
        if(!config) return;
        config.api.row.add(data).draw(false)
    };

    //核心入口
    table.render = function(options, callback){
        var inst = new Class(options, callback);
        return thisTable.call(inst);
    };

    //清除临时Key
    table.clearCacheKey = function(data){
        data = $.extend({}, data);
        delete data[table.config.checkName];
        delete data[table.config.indexName];
        return data;
    };

    return table;
});
