define(['datatables', 'common', 'app'], function (datatable, common, APP) {
    return {
        mainTable: null,
        ADMIN_ACCOUNT_NAME: "admin",
        API: {
            queryPage: "/sys/users",
            add: "/sys/users",
            edit: "/sys/users/{id}",
            "delete": "/sys/users/{id}",
            resetPwd: "/sys/users/{id}/password",
            freeze: "/sys/users/{id}/status/{status}",
        },
        init: function () {
            this.initMainTable();
        },
        initMainTable: function () {
            var self = this;
            self.mainTable = datatable.render({
                elem: '#table-users',
                url: self.API.queryPage,
                cols: [[
                    {type: 'checkbox'},
                    {field: 'username', title: '账号'},
                    {field: 'realname', title: '姓名'},
                    {field: 'sex', title: '性别', render: { 1: "男", 2: "女" }},
                    {field: 'phone', title: '手机号码'},
                    {field: 'email', title: '邮箱地址'},
                    {field: 'createTime', title: '创建时间'},
                    {field: 'status', title: '状态', "switch": {checkedValue: 0, type: 10, color: "green", event: "freeze"}},
                    {title: '操作', toolbar: [{
                            icon: 'key',
                            tooltip: {
                                title: "重置密码",
                                className: "tooltip-info"
                            },
                            color: "blue",
                            event: "resetpwd",
                        }, 'edit', {
                            icon: 'trash-o',
                            tooltip: {
                                title : "删除",
                                className: "tooltip-error"
                            },
                            color: "red",
                            event: "delete",
                            pop: {
                                title: "此操作不可撤销，确定删除吗？"
                            },
                            condition: function (data) {
                                return true;
                            }
                        }]}
                ]]
            }, self.initEventListener.bind(self));
        },
        initEventListener: function () {
            var self = this;
            $(document).off(ace.click_event, '#btn-addUser').on(ace.click_event, '#btn-addUser', function (e) {
                self.openUserDialog("add", null, function (data) {
                    self.mainTable.addRow(data)
                });
            }).off(ace.click_event, '#btn-refreshUser').on(ace.click_event, '#btn-refreshUser', function (e) {
                self.mainTable.reload(false);
            }).off(ace.click_event, '#users-btn-query').on(ace.click_event, '#users-btn-query', function(){
                self.mainTable.config.elem.api()//.columns( 1 )
                    .search( $(this).parent().siblings('input').val(), true )
                    .draw();
            });

            self.mainTable.config.elem.on("edit", function (event, options) {
                self.openUserDialog("edit", options.data, function (data) {
                    options.update(data)
                });
            })
                .on("delete", function (event, options) {
                    layer.close(options.layeroIndex);
                    APP.deleteData(self.API, options.data.id, options.del);
                })
                .on("resetpwd", function(event, options) {
                    self.resetPassword(options.data.id);
                })
                .on("freeze", function(event, options){
                    var flag = $(options.target).is(":checked");
                    if (!flag) {
                        if (options.data.username === self.ADMIN_ACCOUNT_NAME) {
                            message.warning("无法冻结管理员账号！");
                            $(options.target).prop("checked",true);
                            return;
                        } else if (common.getCurrentUser().username === options.data.username) {
                            message.warning("无法冻结当前登录用户！");
                            $(options.target).prop("checked",true);
                            return;
                        }
                    }
                    self.freeze(options.data.id, flag ? "enable" : "disable", function() {
                        $(options.target).prop("checked", !flag);
                    });
                })
            ;
        },
        /**
         * 打开用户编辑窗口
         * @param type
         * @param data
         * @param callback
         */
        openUserDialog: function (type, data, callback) {
            var self = this;
            APP.openFormDialog({
                title: "用户",
                type: type,
                template: {
                    data: {
                        items: [
                            {
                                type: 'hidden',
                                name: 'id',
                                hiddenWhenNotExist: true
                            }, {
                                type: 'input',
                                label: '账号',
                                name: 'username',
                                placeholder: '请输入用户名',
                                required: true,
                                colon: false,
                                readonly: data && data.username === self.ADMIN_ACCOUNT_NAME
                            }, {
                                type: 'radio',
                                label: '性别',
                                name: 'sex',
                                options: [
                                    {label: '男', value: 1, defaultValue: true},
                                    {label: '女', value: 2}
                                ]
                            }, {
                                type: 'input',
                                label: '用户姓名',
                                name: 'realname',
                                placeholder: '请输入用户姓名',
                                required: true
                            }, {
                                type: 'input',
                                label: '手机',
                                name: 'phone',
                                suffix: 'fa fa-phone fa-flip-horizontal',
                                size: 'medium',
                                inputMask: "'mask': '999 9999 9999'",
                                placeholder: '手机号码',
                                className: 'mobileZH'
                            }, {
                                type: 'input',
                                label: '邮箱',
                                name: 'email',
                                addonBefore: 'fa fa-envelope',
                                placeholder: '邮箱地址',
                                className: 'email'
                            }],
                        data: data || {},
                        hideRequiredMark: false,
                        colon: true
                    }
                },
                api: this.API,
                callback: callback
            });
        },

        resetPassword: function(id) {
            common.put({
                url: this.API.resetPwd.replace("{id}", id),
                success: function() {
                    message.success("密码已重置！")
                }
            })
        },

        freeze: function(id, status, error) {
            common.put({
                url: this.API.freeze.replace("{id}", id).replace("{status}", status),
                success: function() {
                },
                error: error
            })
        }
    };
});
