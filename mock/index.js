const Mock = require('mockjs');

function param2Obj(url) {
    const search = url.split('?')[1]
    if (!search) {
        return {};
    }
    try {
        return JSON.parse(
            '{"' +
            decodeURIComponent(search)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"')
                .replace(/\+/g, ' ') +
            '"}'
        );
    } catch (e) {
        // TODO Datatables参数解析会出错
        return {};
    }
}

let mocks = [];
if (typeof window === 'undefined') {
    const normalizedPath = require("path").join(__dirname, "./modules/");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        mocks = mocks.concat(require("./modules/" + file));
    });
} else {
    const mocksMap = require('./modules/*.js', {mode: 'hash'});
    for (const x in mocksMap) {
        mocks = mocks.concat(mocksMap[x]);
    }
}

// for front mock
// please use it cautiously, it will redefine XMLHttpRequest,
// which will cause many of your third-party libraries to be invalidated(like progress event).
function mockXHR() {
    // mock patch
    // https://github.com/nuysoft/Mock/issues/300
    Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send;
    Mock.XHR.prototype.send = function () {
        if (this.custom.xhr) {
            this.custom.xhr.withCredentials = this.withCredentials || false

            if (this.responseType) {
                this.custom.xhr.responseType = this.responseType
            }
        }
        this.proxy_send(...arguments)
    };

    function XHR2ExpressReqWrap(respond) {
        return function (options) {
            let result = null;
            if (respond instanceof Function) {
                const {body, type, url} = options;
                // https://expressjs.com/en/4x/api.html#req
                result = respond({
                    method: type,
                    body: JSON.parse(body),
                    query: param2Obj(url)
                })
            } else {
                result = respond;
            }
            return Mock.mock(result);
        }
    }

    for (const i of mocks) {
        Mock.mock(new RegExp(i.url), i.type || 'get', XHR2ExpressReqWrap(i.response));
    }
}
if (typeof window !== 'undefined') {
    mockXHR();
}

// for mock server
const responseFake = (url, type, respond) => {
    return {
        url: url,
        type: type || 'get',
        response(req, res) {
            res.json(Mock.mock(respond instanceof Function ? respond(req, res) : respond));
        }
    };
};

module.exports = mocks.map(route => {
    return responseFake(route.url, route.type, route.response);
});
