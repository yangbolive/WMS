﻿//变量 _grwebapp_url 指定WEB报表客户端安装程序的下载URL，当通过WebSocket通讯不成功时，提示用户用此URL下载程序进行安装。
//或用于自动更新WEB报表客户端时下载新版本，开发者应将 _grwebapp_url 改为自己服务器的URL，方便用户从可访问的WEB服务器下载
//变量 _grwebapp_version 指定自动更新时，客户端程序需要的版本号，如果小于此版本号，则自动进行更新
import { ElMessageBox } from 'element-plus'

var _grwebapp_websocket = null,
    _grwebapp_url = "http://www.rubylong.cn/download/gridreport6-webapp.exe",
    _grwebapp_version = "6.8.3.0",
    webapp_onmessage ; //如果需要响应执行任务后的消息响应，应该写一个名称为 webapp_onmessage 的 function

function webapp_url_method_valid(url, method) {
    if (!method) {
        if (typeof url == "object") {
            method = url.method;
            url = url.url;
        }
        if (!method) {
            method = /.grf|.txt|.xml|.json/.test(url) ? "GET" : "POST";
        }
    }
    return method;
}

//此函数用于判断一个变量是否为URL字符串，如果类型为字符串且首个非空白字符不为“<”与“{”即判定为URL
//如果参数是一个object对象，且其具有“url”属性，则其是HTTPParam对象，是一个url参数
var webapp_is_url = function (p) {
    var index = 0,
        len = p.length,
        ch;

    //对象如果有url属性，判定为url
    if (typeof p == "object") {
        return !!p.url;
    }

    if (typeof p != "string") {
        return 0;
    }

    //首先找到第一个非空白字符
    while (index < len) {
        ch = p[index];
        if (!/\s/g.test(ch))
            break;
        index++;
    }

    //如果不是xml或json文本串，则判定为url
    return (ch != "{") && (ch != "<") && (p.substr(index, 4) != "_WR_");
};

function webapp_ajax(method, url, callback, cbthis, params) {
    var xmlhttp = new XMLHttpRequest(),
        headers;

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status > 0) {
            callback.call(cbthis, xmlhttp, xmlhttp.status == 200);
        }
    }

    xmlhttp.onerror = function () {
        callback.call(cbthis, xmlhttp, 0);
    }

    if (typeof url == "object") {
        headers = url.headers;
        if (typeof headers == "string") {
            headers = JSON.parse(headers)
        }

        if (!method) {
            method = url.method;
        }

        if (!params) {
            params = url.data;
        }

        url = url.url;
    }

    xmlhttp.open(webapp_url_method_valid(url, method), url, true); //异步请求数据

    if (headers && typeof headers == "object") {
        for (var key in headers) {
            xmlhttp.setRequestHeader(key, headers[key]);
        }
    }

    xmlhttp.send(params);  //POST 或 PUT 可以传递参数
}

/////////////////////////////////////////////////////////////////////////////
//创建启动WEB报表客户端的URL协议参数
function _gr_up_href(args) {
    return "grwebapp://" + (args ? JSON.stringify(args) : "");
}

//通过URL协议启动WEB报表客户端程序
//参数 appUpdate 指定是否自动更新WEB报表客户端程序，根据_grwebapp_version与已经安装的程序版本进行比较，按需进行自动升级
function webapp_urlprotocol_startup(appUpdate) {
    var arg = appUpdate ? {
        type: "update",
        url: _grwebapp_url,
        ver: _grwebapp_version
    } : 0;
    window.location.href = _gr_up_href(arg);
}

//如果WEB报表客户端程序未运行，先通过URL协议启动WEB报表客户端程序
//通知WEB报表客户端程序根据模板与数据的URL，以及生成类型等相关参数进行报表生成，
function webapp_urlprotocol_run(args, report_url, data_url) {
    if (report_url) {
        args.report = report_url;
    }
    if (data_url) {
        args.data = data_url;
    }
console.log(args, report_url, data_url,'321312313123');
window.location.href = _gr_up_href(args);
}

/////////////////////////////////////////////////////////////////////////////
//检查WebSocket是否已经创建并通讯连接成功
function webapp_ws_check(slience) {
    if (!slience) {
        if (!_grwebapp_websocket) {
            alert("WebSocket没有创建，无法发送数据！");
        }
        else if (_grwebapp_websocket.readyState != 1) {
            alert("WebSocket正在连接中，暂不能发送数据！");
        }
    }
    return _grwebapp_websocket && (_grwebapp_websocket.readyState === 1);
}

//创建并通讯连接WebSocket
function webapp_ws_create(onopen) {
    //如果已经创建，且连接正常，则不要再次创建
    if (_grwebapp_websocket && _grwebapp_websocket.readyState === 1) {
        return;
    }

    //判断当前浏览器是否支持WebSocket
    if ('WebSocket' in window) {
        _grwebapp_websocket = new WebSocket("ws://127.0.0.1:22333");

        //连接成功建立的回调方法
        if (onopen) {
            _grwebapp_websocket.onopen = function () {
                //alert("_grwebapp_websocket.onopen");
                onopen();
            }
        }
        debugger;
        //接收到消息的回调方法
        if (window.webapp_onmessage) {
            _grwebapp_websocket.onmessage = function (event) {
                window.webapp_onmessage(event);
            }
        }

        _grwebapp_websocket.onerror = function () {
            var children = document.body.children,
                childrenLen = children.length,
                referNode = childrenLen ? children[0] : null,
                newNode = document.createElement("h3");

            _grwebapp_websocket = null;

            //弹出alert提示信息，可修改为更适合的表述
            //alert("创建WebSocket失败，可能是‘WEB报表客户端程序’在本机没有安装，或在报表网页加载时没有调用‘webapp_urlprotocol_startup’函数进行启动。");
      
            ElMessageBox.confirm(`您还没有安装打印程序，是否进行安装?`)
            .then(() => {
              window.location.href = 'http://www.rubylong.cn/download/gridreport6-webapp.exe'
            })
            .catch(() => {
              // catch e 
            })  
        };

        //连接关闭的回调方法
        _grwebapp_websocket.onclose = function () {
            _grwebapp_websocket = null;
        }

        //感觉这部分可以不要
        //监听窗口关闭事件，当窗口关闭时，主动去关闭_grwebapp_websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        //window.onbeforeunload = function () {
        //    if (_grwebapp_websocket) {
        //        _grwebapp_websocket.close();
        //    }
        //}
    }
    else {
        alert('当前浏览器不支持HTML5的WebSocket，请选用更新版本的浏览器！')
    }
}

function webapp_build_one(pack, report, report_method, data, data_method, callback_fun, dataParams) {
    if (!report) {
        alert("在参数中没有定义报表模板的url，报表不能生成！");
        return;
    }

    if (data) {
        if (webapp_is_url(data)) {
            webapp_ajax(data_method, data, function (xmlhttp, success) {
                if (success) {
                    pack.data = xmlhttp.responseText;
                    callback_fun();
                }
                else {
                    //alert("载入报表数据失败，响应消息：" + xmlhttp.responseText);
                    window.open(data, "blank");
                }
            }, undefined, dataParams);
        }
        else {
            pack.data = (typeof data == "object") ? JSON.stringify(data) : data;
            callback_fun();
        }
    }
    else {
        pack.data = "";
    }

    if (webapp_is_url(report)) {
        webapp_ajax(report_method, report, function (xmlhttp, success) {
            if (success) {
                pack.report = xmlhttp.responseText;
                callback_fun();
            }
            else {
                //alert("载入报表模板失败，响应消息：" + xmlhttp.responseText);
                window.open(report, "blank");
            }
        });
    }
    else {
        pack.report = (typeof report == "object") ? JSON.stringify(report) : report;
        callback_fun();
    }
}

//将参数通过WebSocket发送给WEB报表客户端，WEB报表客户端执行对应的任务
//参数说明：
//args：
//  报表生成相关的参数，为一个结构体对象或结构体对象数组。
//  当参数为数组时，表示是执行批量任务。此时后面的 report 与 data 参数不会被用到。
//  结构体对象的各个数据项说明请参考帮助中“WEB报表(B/S报表)->WEB报表客户端->启动参数说明”部分
//report：
//  报表模板文本，报表定义格式必须为JSON格式。此参数可空，为空表示执行非报表生成任务，或WEB报表客户端通过URL获取报表模板。
//data：
//  报表数据文本，此参数可空，报表无需提供数据，或WEB报表客户端通过URL获取报表数据。
//
//  报表数据对应的 XML 或 JSON 文本，请参考帮助“WEB报表(B/S报表)->WEB报表数据”中的说明。 
function webapp_ws_run(variant_args, report, data) {
    function run_one(args, reportText, dataText) {
        var msg;

        if (webapp_ws_check()) {
            if (typeof args === "string") {
                args = {
                    type: args
                };
            }
            msg = JSON.stringify(args);

            if (reportText) {
                if (reportText.substr(0, 4) === "_WR_") {
                    msg += reportText.length;
                }
                msg += reportText;

                if (dataText) {
                    msg += dataText;
                }
            }

            _grwebapp_websocket.send(msg);
        }
    } //end of run_one

    if (!webapp_ws_check(1)) {
        //如果WebSocket没有连接，则首先创建并连接WebSocket，并在onopen事件中执行相关的任务
        webapp_ws_create(function () {
            webapp_ws_run(variant_args, report, data);
        });
        return;
    }

    if (Array.isArray(variant_args)) {
        variant_args.forEach(function (args) {
            run_one(args, report, data);
        })
    }
    else {
        run_one(variant_args, report, data);
    }
}

//通过 ajax 方式获取报表模板与报表数据，然后通过 WebSocket 发送相关数据给WEB报表客户端并生成报表
//参数既可以是单个结构体对象，也可以是结构体对象数组。如果是数组，表示成批生成多个报表。
//结构体对象的各个数据项说明请参考帮助中“WEB报表(B/S报表)->WEB报表客户端->启动参数说明”部分。
function webapp_ws_ajax_run(variant_args) {
    function run_one(args) {
        var report = args.report,
        data = args.data,
        report_method = args.report_method,
        data_method = args.data_method,
        dataUrlParams = args.dataUrlParams,
        pack = {};

        function run() {
            //只有当report与data都赋值之后才运行，即向WEB报表客户端程序发送数据
            if (pack.report && pack.data !== undefined) {
                webapp_ws_run(args, pack.report, pack.data);
            }
        }

        //因为args需要传递给WEBAPP，report与data的url相关的参数不需要传递，所以将其删除掉
        delete args.report;
        delete args.data;
        delete args.report_method;
        delete args.data_method;
        delete args.dataUrlParams;

        webapp_build_one(pack, report, report_method, data, data_method, run, dataUrlParams);
    } //end of run_one

    if (!webapp_ws_check(1)) {
        //如果WebSocket没有连接，则首先创建并连接WebSocket，并在onopen事件中执行相关的任务
        webapp_ws_create(function () {
            webapp_ws_ajax_run(variant_args);
        });
        return;
    }

    if (Array.isArray(variant_args)) {
        variant_args.forEach(function (args) {
            run_one(args);
        });
    }
    else {
        run_one(variant_args);
    }
}

//通过 ajax 方式获取多个报表的模板与数据，然后用 WebSocket 将数据一次性发送给WEB报表客户端程序。
//实现多个报表同时生成在一个任务中(应用Grid++Report的独立子报表功能实现)，达到多个报表同时预览、打印与数据导出
function webapp_ws_ajax_together(args, reports) {
    var reportCount = reports.length,
        reportPacks = [],
        gettedCount = 0; //指示已经获取到数据的报表个数

    function ajaxRequestOne(arg, index) {
        var report = arg.report,
        data = arg.data,
        report_method = arg.report_method,
        data_method = arg.data_method,
        dataUrlParams = arg.dataUrlParams,
        pack = reportPacks[index];

        function try_ws_send() {
            var msg,
                dataMsg = "",
                lengths = [];

            if (pack.report && pack.data !== undefined) {
                if (++gettedCount >= reportCount) { //只有当全部报表的模板与数据都已经获取到之后，才会向WEB报表客户端发送数据
                    msg = JSON.stringify(args);

                    reportPacks.forEach(function (item) {
                        var report = item.report,
                            data = item.data,
                            reportLen = report.length,
                            reportLenText = "";

                        if (report.substr(0, 4) === "_WR_") {
                            reportLenText += reportLen;
                            dataMsg += reportLenText;
                            reportLen += reportLenText.length;
                        }
                        dataMsg += report;

                        if (data) {
                            dataMsg += data;
                        }

                        lengths.push(reportLen + data.length);
                    });

                    msg += JSON.stringify(lengths);
                    msg += dataMsg;

                    _grwebapp_websocket.send(msg);
                }
            }
        }

        webapp_build_one(pack, report, report_method, data, data_method, try_ws_send, dataUrlParams);
    } //end of ajaxRequestOne

    if (!webapp_ws_check(1)) {
        //如果WebSocket没有连接，则首先创建并连接WebSocket，并在onopen事件中执行相关的任务
        webapp_ws_create(function () {
            webapp_ws_ajax_together(args, reports);
        });
        return;
    }

    reports.forEach(function (report, index) {
        reportPacks.push({});
        ajaxRequestOne(report, index);
    });
}

/////////////////////////////////////////////////////////////////////////////
//通过WebSocket向WEB报表客户端发送枚举出当前电脑的所有打印机信息的指令
//在网页的 webapp_onmessage 函数中接收WEB报表客户端返回的结果，具体请参考例子。
function webapp_ws_fun_Printers() {
    webapp_ws_run({
        type: "fun",
        fun: "Printers"
    });
}

//通过WebSocket向WEB报表客户端发送枚举出当前电脑的指定打印机的全部可用纸张的指令
//在网页的 webapp_onmessage 函数中接收WEB报表客户端返回的结果，具体请参考例子
function webapp_ws_fun_PrinterPapers(printer) {
    webapp_ws_run({
        type: "fun",
        fun: "PrinterPapers",
        printer: printer
    });
}

//通过WebSocket向WEB报表客户端发送停止当前报表预览并关闭预览窗口的指令
function webapp_ws_fun_StopPreview() {
    webapp_ws_run({
        type: "fun",
        fun: "StopPreview"
    });
}

/////////////////////////////////////////////////////////////////////////////
//通过WebSocket向WEB报表客户端发送消息进行自动更新检查处理
function webapp_ws_autoupdate() {
    webapp_ws_run({
        type: "update",
        url: _grwebapp_url,
        ver: _grwebapp_version
    });
}

/////////////////////////////////////////////////////////////////////////////
//为URL追加一个名为id的随机数参数，用于防止浏览器缓存。
//报表模板重新设计后，因为浏览器缓存而让报表生成不能反映出新修改的设计结果，URL后追加一个随机数参数可以避免这样的问题
//参数url必须是静态的URL，其后本身无任何参数
//如果模板几乎不怎么修改，可以去掉对本函数的调用
function urlAddRandomNo(url) {
    return url + "?id=" + Math.floor(Math.random() * 10000);
}

//根据当前网页URL获取到当前WEB服务器的根URL，并记录在 window.rootURL 中
function gr_extractRootURL() {
    var path = window.location.pathname,
        index = path.lastIndexOf("/");

    window.rootURL = window.location.protocol + "//" + window.location.host;
    if (index >= 0) {
        path = path.substr(0, index);

        //demmo的根目录在当前页面的1级目录之上
        index = path.lastIndexOf("/");
        if (index >= 0) {
            path = path.substr(0, index);
        }

        window.rootURL += path;
    }
    window.rootURL += "/";
}

//如果是在VUE下使用，请将本段代码的注释去掉
export { 
    webapp_url_method_valid, 
    webapp_urlprotocol_startup, 
    webapp_ajax, 
    webapp_ws_ajax_run, 
    webapp_urlprotocol_run, 
    urlAddRandomNo, 
    webapp_onmessage, 
    webapp_ws_fun_StopPreview, 
    webapp_ws_fun_PrinterPapers, 
    webapp_ws_fun_Printers, 
    webapp_ws_ajax_together, 
    webapp_ws_autoupdate, 
    gr_extractRootURL 
}
