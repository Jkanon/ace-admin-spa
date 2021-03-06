const util = require("../util");

const userList = [
    {
        "birthday":null,
        "salt":"BqTYZciC",
        "sex_dictText":"男",
        "sex":1,
        "activitiSync":"1",
        "telephone":null,
        "updateTime":"2019-10-05 15:58:58",
        "avatar":"files/20191004/logo-2_1570120810189.png",
        "status_dictText":"正常",
        "delFlag":"0",
        "realname":"秦风",
        "workNo":"200",
        "password":"4a3cba079a6c2eba",
        "createBy":"admin",
        "post":"",
        "phone":null,
        "createTime":"2019-10-03 16:33:40",
        "updateBy":"qinfeng",
        "orgCode":null,
        "id":"1179675874431131649",
        "email":null,
        "username":"qinfeng",
        "status":0
    },
    {
        "birthday":"2019-04-01",
        "salt":"ABCmGZS1",
        "sex_dictText":"女",
        "sex":2,
        "activitiSync":"1",
        "telephone":null,
        "updateTime":"2019-10-19 15:53:20",
        "avatar":"user/20190401/20180607175028Fn1Lq7zw_1554118444672.png",
        "status_dictText":"正常",
        "delFlag":"0",
        "realname":"小芳",
        "workNo":"A001",
        "password":"0989b9c364a4b6ffb6edcedab3ff2af9",
        "createBy":"admin",
        "post":"001",
        "phone":"",
        "createTime":"2019-10-01 19:34:10",
        "updateBy":"admin",
        "orgCode":null,
        "id":"f0019fdebedb443c98dcb17d88222c38",
        "email":"",
        "username":"zhagnxiao",
        "status":0
    },
    {
        "birthday":"2018-12-05",
        "salt":"RCGTeGiH",
        "sex_dictText":"女",
        "sex":2,
        "activitiSync":"1",
        "telephone":null,
        "updateTime":"2019-10-20 23:23:19",
        "avatar":"files/20190719/4afbfbedab64034f9015f1bca8c379310b551dab_1563514371342.jpg",
        "status_dictText":"正常",
        "delFlag":"0",
        "realname":"管理员",
        "workNo":"A000",
        "password":"50718226758117a9",
        "createBy":null,
        "post":"002",
        "phone":"18611788525",
        "createTime":"2019-06-21 17:54:10",
        "updateBy":"admin",
        "orgCode":"A01",
        "id":"e9ca23d68d884d4ebb19d07889727dae",
        "email":"11@qq.com",
        "username":"admin",
        "status":0
    },
    {
        "birthday":null,
        "salt":"vDDkDzrK",
        "sex_dictText":"男",
        "sex":1,
        "activitiSync":"1",
        "telephone":null,
        "updateTime":"2019-10-07 15:05:46",
        "avatar":"assets/images/avatars/user.jpg",
        "status_dictText":"正常",
        "delFlag":"0",
        "realname":"Jkanon",
        "workNo":"A002",
        "password":"3dd8371f3cf8240e",
        "createBy":"admin",
        "post":"002",
        "phone":"13426432921",
        "createTime":"2019-02-13 16:02:36",
        "updateBy":"admin",
        "orgCode":"A01A04",
        "id":"a75d45a015c44384a04449ee80dc3503",
        "email":"im.Jkanon@gmail.com",
        "username":"Jkanon",
        "status":1
    }
];

module.exports = [
{
    url: '/sys/users',
    type: 'get',
    response: function(config) {
        return {
            "success": true,
            "message": "操作成功！",
            "code": 200,
            "data": {
                draw: config.query.draw,
                recordsTotal: userList.length,
                recordsFiltered: userList.length,
                data: userList
            },
            "timestamp":Number(new Date())
        };
    }
},
{
    url: '/sys/users',
    type: 'post',
    response: function(config) {
        const user = {
            ...config.body,
            id: userList.length + (Math.random() * 100).toFixed(0),
            status: 0,
            sex: typeof config.body.sex === 'string' ? parseInt(config.body.sex) : undefined
        };
        userList.unshift(user);
        return {
            "success": true,
            "message": "操作成功！",
            "code": 200,
            "data": user,
            "timestamp":Number(new Date())
        };
    }
},
{
    url: '/sys/users/:id',
    type: 'put',
    response: function(config) {
        for (let i = 0; i < userList.length; i++) {
            if (config.params.id === userList[i].id) {
                userList[i] = { ...userList[i], ...config.body, sex: typeof config.body.sex === 'string' ? parseInt(config.body.sex) : undefined };
                break;
            }
        }
        return {
            "success": true,
            "message": "操作成功！",
            "code": 200,
            "data": config.body,
            "timestamp":Number(new Date())
        };
    }
},
{
    url: '/sys/users/:id',
    type: 'delete',
    response: function(config) {
        return util.deleteTableList(config, userList);
    }
},
{
    url: '/login',
    type: 'post',
    response: function(config) {
        return {
            "success":true,
            "message":"登录成功",
            "code":200,
            "data":{
                "multi_depart":1,
                "userInfo":{
                    "id":"a75d45a015c44384a04449ee80dc3503",
                    "username":"Jkanon",
                    "realname":"Jkanon",
                    "password":"3dd8371f3cf8240e",
                    "salt":"vDDkDzrK",
                    "avatar":"user.jpg",
                    "birthday":null,
                    "sex":1,
                    "email":"im.Jkanon@gmail.com",
                    "phone":"13426432921",
                    "orgCode":"A01A04",
                    "status":1,
                    "delFlag":"0",
                    "workNo":"A002",
                    "post":"002",
                    "telephone":null,
                    "createBy":"admin",
                    "createTime":"2019-02-13 16:02:36",
                    "updateBy":"admin",
                    "updateTime":"2019-10-07 15:05:46",
                    "activitiSync":"1"
                },
                "departs":[
                    {
                        "id":"67fc001af12a4f9b8458005d3f19934a",
                        "parentId":"c6d7cb4deeac411cb3384b1b31278596",
                        "departName":"财务部",
                        "departNameEn":null,
                        "departNameAbbr":null,
                        "departOrder":0,
                        "description":null,
                        "orgCategory":"1",
                        "orgType":"2",
                        "orgCode":"A01A04",
                        "mobile":null,
                        "fax":null,
                        "address":null,
                        "memo":null,
                        "status":null,
                        "delFlag":"0",
                        "createBy":"admin",
                        "createTime":"2019-02-21 16:14:35",
                        "updateBy":"admin",
                        "updateTime":"2019-02-25 12:49:41"
                    }
                ],
                "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1NzI0ODUzMjgsInVzZXJuYW1lIjoiamVlY2cifQ.OD2E9KEPff00z2W1lxrbKQ7nH1s_ntaF3zXU6_w7y8k"
            },
            "timestamp":Number(new Date())
        };
    }
}
];
