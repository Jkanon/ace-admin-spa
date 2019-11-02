const Mock = require('mockjs');

function param2Obj(url) {
    const search = url.split('?')[1]
    if (!search) {
        return {};
    }
    return JSON.parse(
        '{"' +
        decodeURIComponent(search)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"')
            .replace(/\+/g, ' ') +
        '"}'
    );
}

const fs = require('fs');
const path = require('path');

if (typeof require.context === 'undefined') {
    require.context = (base = '.', scanSubDirectories = false, regularExpression = /\.js$/) => {
        const files = {};

        function readDirectory(directory) {
            fs.readdirSync(directory).forEach((file) => {
                const fullPath = path.resolve(directory, file);

                if (fs.statSync(fullPath).isDirectory()) {
                    if (scanSubDirectories) readDirectory(fullPath);

                    return;
                }

                if (!regularExpression.test(fullPath)) return;

                files[fullPath] = true;
            });
        }

        readDirectory(path.resolve(__dirname, base));

        function Module(file) {
            return require(file);
        }

        Module.keys = () => Object.keys(files);

        return Module;
    };
}

let mocks = [];
const modulesFiles = require.context('./modules', true, /\.js$/);
modulesFiles.keys().reduce((modules, modulePath) => {
    const value = modulesFiles(modulePath);
    if (value) {
        mocks = mocks.concat(value);
    }
}, {});

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
