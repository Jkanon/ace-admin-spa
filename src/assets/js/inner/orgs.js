define(["datatables", "common", "app"], function (datatable, common, APP) {
    return {
        API: {
            queryPage: "/sys/orgs"
        },
        init: function () {
            this.initTree();
            this.initForm();
        },
        initTree: function() {
            common.get({
                url: this.API.queryPage,
                success: function(data) {
                    common.initZtree($("#orgs-tree"), data, {
                        data: {
                            key: {
                                name: "departName"
                            }
                        }
                    });
                }
            });
        },
        initForm: function(data) {
            var templet = {
                items: [
                    {
                        type: "hidden",
                        name: "id",
                        hiddenWhenNotExist: true
                    }, {
                        type: "input",
                        label: "机构名称",
                        name: "departName",
                        placeholder: "请输入机构名称",
                        required: true
                    }, {
                        type: "input",
                        label: "上级机构",
                        name: "parentId",
                        placeholder: "请输入机构名称",
                        required: true
                    }, {
                        type: "input",
                        label: "机构编码",
                        name: "orgCode",
                        placeholder: "请输入机构编码",
                        required: true
                    }, {
                        type: "radio",
                        label: "机构类型",
                        name: "sex",
                        options: [
                            {label: "公司", value: 1, defaultValue: true}
                        ]
                    }],
                data: data || {}
            };
            $("#orgs-form").html(
                template("tpl-formInput", templet || {})
            );
        }
    };
});
