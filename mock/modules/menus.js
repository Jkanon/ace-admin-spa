const menus = [
    {
        "id":"9502685863ab87f0ad1134142788a385",
        "icon": "fa fa-home",
        "name": "后台首页",
        "href": "#!home",
        "menuType": 0,
        "sort": 1,
        "isLeaf": true
    },
    {
        "id":"08e6b9dc3c04489c8e1ff2ce6f105aa4",
        "icon": "fa fa-tachometer",
        "name": "系统监控",
        "isLeaf": false,
        "menuType": 0,
        "sort": 1,
        "children": [
            {
                "id":"b1cb0a3fedf7ed0e4653cb5a229837ee",
                "icon": "",
                "name": "定时任务",
                "href": "#!quartz-jobs",
                "menuType": 1,
                "sort": 1,
                "isLeaf": true
            },{
                "id":"58857ff846e61794c69208e9d3a85466",
                "icon": "",
                "name": "操作日志",
                "href": "#!logs",
                "menuType": 1,
                "sort": 2,
                "isLeaf": true
            }
        ]
    },
    {
        "id": "d7d6e2e4e2934f2c9385a623fd98c6f3",
        "icon": "fa fa-cog",
        "name": "系统管理",
        "isLeaf": false,
        "menuType": 0,
        "sort": 2,
        "children": [{
            "id":"45c966826eeff4c99b8f8ebfe74511fc",
            "icon": "",
            "name": "机构管理",
            "href": "#!orgs",
            "menuType": 1,
            "sort": 1,
            "isLeaf": true
        },{
            "id":"3f915b2769fc80648e92d04e84ca059d",
            "icon": "fa fa-user",
            "name": "用户管理",
            "href": "#!users",
            "menuType": 1,
            "sort": 2,
            "isLeaf": true
        },{
            "id":"e8af452d8948ea49d37c934f5100ae6a",
            "icon": "",
            "name": "角色管理",
            "href": "#!roles",
            "menuType": 1,
            "sort": 3,
            "isLeaf": true
        },{
            "id":"54dd5457a3190740005c1bfec55b1c34",
            "icon": "",
            "name": "菜单管理",
            "href": "#!menus",
            "menuType": 1,
            "sort": 4,
            "isLeaf": true
        },{
            "id":"700b7f95165c46cc7a78bf227aa8fed3",
            "icon": "",
            "name": "二级菜单",
            "menuType": 0,
            "sort": 5,
            "isLeaf": false,
            "children": [{
                "id":"8d1ebd663688965f1fd86a2f0ead3416",
                "icon": "fa fa-external-link",
                "name": "外部链接",
                "href": "https://www.baidu.com",
                "menuType": 1,
                "sort": 1,
                "isLeaf": true
            },{
                "id":"8d1ebd663688965f1ad86a2f0ead3416",
                "icon": "fa fa-eye",
                "name": "三级菜单",
                "menuType": 0,
                "sort": 2,
                "isLeaf": false,
                "children": [{
                    "id":"8d1ebd663a88965f1fd86a2f0ead3416",
                    "icon": "fa fa-leaf",
                    "name": "四级菜单",
                    "menuType": 1,
                    "sort": 1,
                    "isLeaf": true
                }]
            }]
        }]
    }
];
module.exports = [
    {
        url: "/sys/permission",
        type: "get",
        response: function() {
            return {
                "success": true,
                "message": "操作成功！",
                "code": 200,
                "data": menus,
                "timestamp": Number(new Date())
            }
        }
    },
    {
        url: "/permission",
        type: "get",
        response: function() {
            return {
                "success": true,
                "message": "操作成功！",
                "code": 200,
                "data": { menus: menus },
                "timestamp": Number(new Date())
            }
        }
    }
];
