const fs = require("fs");                                            
const url = require("url");                                            
const path = require("path");
const chalk = require("chalk");
const opn = require("opn");
const express = require("express");
const pkg = require("./package.json");
const port = 8080;

var app = express();
app.use(function(req, res, next) {
    var urls = req.url;
    //通过输入信息截取相关路径信息                                               
    urls = url.parse(urls).pathname;
    //获取文件的后缀名并调用自定义模块更改信息                           
    var urlstype = getextName(fs, path.extname(urls));
    //判断是否只输入了域名，如果是则更改为index页面                                             
    if (urls === "/") {
        urls = "index.html";
    }
    if (urls.indexOf('.') !== -1) {
        fs.readFile("src/" + urls, (err, data) => {
            if (err) {
                res.writeHead(404, {"content-type": "" + urlstype + ";charset='utf-8'"});
                //将404页面内容填入页面
                res.write('404 Not Found');
                //关闭刷新
                res.end();
                return;
            }
            //编写头部信息
            res.writeHead(200, {"content-type": "" + urlstype + ";charset='utf-8'"});
            res.write(urls.endsWith('.html') ? assemblyHtml(data) : data);                                                                               //将获取的网页内容写入
            res.end();                                                                                    //关闭
        });
    } else {
        next();
    }
});

const arguments = process.argv.splice(2);
if (arguments.length === 0 || !arguments.includes( 'MOCK=false')) {
    const mockServer = require("./mock/mock-server");
    mockServer(app);
} else {
    const proxyMiddleWare= require('http-proxy-middleware');
    const proxyOption ={
        target: "http://127.0.0.1:8000/",
        changeOrigoin:true,
        ws: true,
    };
    app.use(proxyMiddleWare(proxyOption));
}

app.listen(port, function () {
    const uri = `http://localhost:${port}`;
    console.log(chalk.green(`> Preview at ${uri}`));
    opn(uri);
});

const regInclude = /@@include\('([^']+)',\s*\{([^}]*)\}/g;
function assemblyHtml(data) {
    let ret = data.toString('utf-8');
    while(tempR = regInclude.exec(ret)) {
        ret = ret.replace(tempR[0], fs.readFileSync("src/" + tempR[1]).toString('utf-8'));
    }
    ret = ret.replace(/\${name}/g, pkg.description)
        .replace(/\${company}/g, pkg.company)
        .replace(/\${brief}/g, pkg.name);
    return ret;
}

//暴露模块的方法getextName，传入fs文件模块，和想更改的文件类型名
function getextName(fs,Extname) {
    //通过文件模块同步的读取方法获取json值
    var mes = fs.readFileSync("mime.json");
    //将获取的值转换为Json对象   
    mes = JSON.parse(mes)[Extname];
    //返回转换的值，如果没有查找成功则返回"text/html"
    return mes || "text/html";
}
