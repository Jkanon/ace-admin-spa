define(["datatables", "common", "app"], function (datatable, common, APP) {
    return {
        API: {
            queryList: "/sys/permission"
        },
        mainTable: null,
        data: [],
        init: function() {
            this.initMainTable();
        },
        initMainTable: function () {
            var self = this;
            self.mainTable = datatable.render({
                elem: "#table-menus",
                data: self.data,
                cols: [[
                    {type: "checkbox"},
                    {field: "name", title: "名称", render: function (data, type, item) {
                            if (item.children && item.children.length>0) {
                                return '<span class="blue bigger-140"><i class="fa fa-plus-square"></i></span>' + data;
                            }
                            return data;
                        }, className: 'treegrid-control', target: 0
                    },
                    {field: "menuType", title: "类型"},
                    {field: "icon", title: "图标", render: function(data) {
                        if (data) {
                            return '<span class="bigger-140"><i class="' + data + '"></i></span>';
                        }
                    }},
                    {field: "href", title: "路径"},
                    {field: "sort", title: "排序"},
                    {title: "操作", toolbar: [
                            "edit", {
                                icon: "trash-o",
                                tooltip: {
                                    title : "删除",
                                    className: "tooltip-error"
                                },
                                color: "red",
                                event: "delete",
                                pop: {
                                    title: "此操作不可撤销，确定删除吗？"
                                }
                            }]
                    }
                ]],
                paging: false,
                treeGrid: {
                    indentColumnIndex: 2,
                    indentSize: 15,
                    expandIcon: '<span class="blue bigger-140"><i class="fa fa-plus-square"></i></span>',
                    collapseIcon: '<span class="blue bigger-140"><i class="fa fa-minus-square"></i></span>'
                }
            }, self.reloadData.bind(this));
        },
        reloadData: function() {
            var self = this;
            common.get({
                url: self.API.queryList, success: function(data) {
                    self.data = data;
                    self.redrawTable();
                }
            });
        },
        redrawTable: function() {
            var table = this.mainTable.config.elem.api();
            table.clear();
            table.rows.add(this.data);
            table.draw();
        }
    };
});
