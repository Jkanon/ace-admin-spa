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
                    {field: "", render: function (data, type, item) {
                            if (item.children && item.children.length>0) {
                                return '<span class="blue bigger-140"><i class="fa fa-plus-square"></i></span>';
                            }
                            return '';
                        }, className: 'treegrid-control', target: 0},
                    {type: "checkbox"},
                    {field: "name", title: "名称"},
                    {field: "menutype", title: "类型"},
                    {field: "icon", title: "图标"},
                    {field: "url", title: "路径"},
                    {field: "sortNo", title: "排序"},
                    {title: "操作", toolbar: [
                            "edit", {
                                icon: "trash-o",
                                tooltip: {
                                    title : "删除",
                                    class: "tooltip-error"
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
            common.get(self.API.queryList, null, function(data) {
                self.data = data;
                self.redrawTable();
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
