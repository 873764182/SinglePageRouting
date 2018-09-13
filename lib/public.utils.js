/**
 * ============================================ 自定义方法 ============================================
 */

/**
 * 所有的接口地址集合
 */
function API() {
    return {
        /**
         * 获取视频课程列表
         * page :    页数,1开始
         * limit :    页大小
         * belColumn :    课程分区,理财专栏:lczl,市场热点:scrd,专家点评:zjdp,免费体验:mfty
         * sort :    排序方式(系统默认按时间:insertTime, 按热度watchCount)
         * text :    搜索关键字,根据标题
         */
        "C_CLVBA": "/course/courseListVideoByApp.do",
        /**
         * 获取视频详细信息
         * _id: 视频ID
         * columnId: 专栏ID(专栏视频时使用)
         */
        "C_CVI": "/course/courseVideoInfo.do"
    };
}

/**
 * 加载JS到指定节点
 *
 * https://blog.csdn.net/wzgdjm/article/details/50799459
 */
function downLoadJs(url, dom) {
    var elem = document.createElement("script");
    elem.src = url;
    dom.appendChild(elem);
}

/**
 * 加载CSS到指定节点
 *
 * https://blog.csdn.net/wzgdjm/article/details/50799459
 */
function downLoadCss(url, dom) {
    var elem = document.createElement("link");
    elem.rel = "stylesheet";
    elem.type = "text/css";
    elem.href = url;
    dom.appendChild(elem);
}

/**
 * 包装一下URL,方便调整
 */
function buildUrl(url) {
    return url.toString();
}

/**
 * 加载指定页面,需要配合WeUI
 */
function loadPage(pageName, viewName) {
    get((pageName + ".html").toString(), function (response) {
        let view = $(viewName.toString());
        view.attr("type", "text/html");
        view.text(response);
    });
}

/**
 * 页面参数
 */
function pageParam(pageName, param) {
    if (param === undefined || param == null) {
        let json = sessionStorage.getItem(pageName);
        if (json != null && json.toString().length > 0) {
            param = JSON.parse(json);
        }
    } else {
        sessionStorage.setItem(pageName, JSON.stringify(param));
    }
    return param;
}

/**
 * POST 请求
 */
function get(url, action) {
    $.get(buildUrl(url), action);
}

/**
 * POST 请求
 */
function post(url, param, action) {
    $.post(buildUrl(url), param, action);
}

/**
 * 加载数据
 * https://www.cnblogs.com/koleyang/p/5146498.html
 * https://blog.csdn.net/github_35780818/article/details/52578748
 */
function ajax(url, param, success, error) {
    $.ajax({
        type: 'POST',
        url: buildUrl(url),
        timeout: 5000,
        data: typeof(param) === "string" ? param : JSON.stringify(param),   // 需要字符串
        contentType: "application/json; charset=utf-8",
        headers: buildVueRequestHeaders(),
        dataType: 'json',
        success: success ? success : function (result) {
            console.log("ajax success", JSON.stringify(result));
        },
        error: error ? error : function (xhr, type) {
            console.log("ajax error", JSON.stringify(xhr) + "\t" + JSON.stringify(type));
        }
    });
}

/**
 * 程序信息
 */
function getAppInfo() {
    return {
        "clientId": getBrowserFingerprint().toString(),
        "clientType": "wx",
        "versionCode": "20180801",
        "versionName": "1.0.0"
    };
}

/**
 * token 获取 / 设置
 */
function token(value) {
    if (value == null || value === undefined) {
        let token = localStorage.getItem("token_value");
        return token ? (token.toString()) : "";
    } else {
        localStorage.setItem("token_value", value);
        return value;
    }
}

/**
 * 获取请求URL参数
 */
function getUrlParam() {
    const url = location.search; // 获取 url 中 "?" 符后的字串
    const parameter = {};
    if (url.indexOf("?") !== -1) {
        const string = url.substr(1);
        let strArr = string.split("&");
        for (let i = 0; i < strArr.length; i++) {
            let strArrParam = strArr[i].split("=");
            parameter[strArrParam[0]] = unescape(strArrParam[1]);   // 编码后赋值
        }
    }
    return parameter;
}

/**
 * 获取浏览器指纹
 */
function getBrowserFingerprint() {
    var bf = localStorage.getItem("BROWSER_FINGERPRINT");
    if (bf == null || bf.length <= 0) {
        bf = new Fingerprint().get();
        localStorage.setItem("BROWSER_FINGERPRINT", bf);
    }
    return bf;
}

/**
 * 创建Layui框架Table请求头
 */
function buildVueRequestHeaders() {
    let tv = "eyJpc3MiOiJMWFdYIiwiaWF0IjoxNTMzMjY0MDE0MTgyLCJleHAiOjE1MzU4NTYwMTQxODIsImF1ZCI6ImNsaWVudCIsIm5iZiI6NzY2NjMyMDA3MDkxLCJhY2NvdW50IjoiYWRtaW4iLCJyb2xlcyI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjM0NTYiLCJjbGllbnRJZCI6IjQxOTA4MTUyOTUiLCJhbGciOiJIUzI1NiIsInppcCI6IkRFRiJ9.eNqqViouTVKyUvKJCI9QqgUAAAD__w.4gJ0yfQoVnUUsenhihgrrF7VLJG6jYNGvy2MAs7fPw8";
    return {
        'token-value': tv /*token().toString()*/,
        'clientId': "4190815295" /*getAppInfo().clientId.toString()*/,
        'clientType': getAppInfo().clientType.toString(),
        'clientVersion': getAppInfo().versionName.toString(),
        'timestamp': new Date().getTime().toString()
    };
}

/**
 * 发送 GET 异步请求
 * httpGet(url, params).then((message) => { 成功 }).catch((message) => { 失败 });
 * https://blog.csdn.net/xjlinme/article/details/64128394
 * https://www.cnblogs.com/mrszhou/p/7859012.html
 */
// function httpGet(url, params, headers) {
//     if (params == null || params === undefined) {
//         params = {};
//     }
//     if (headers == null || headers === undefined) {
//         headers = buildVueRequestHeaders();
//     }
//     // console.log("GET请求", url + "\n" + JSON.stringify(params) + "\n" + JSON.stringify(headers));
//     return new Promise((resolve, reject) => {
//         Vue.http.get(buildUrl(url),
//             {
//                 headers: headers,
//                 params: params
//             },
//             {
//                 emulateJSON: true
//             }
//         ).then((res) => {
//             resolve(res);
//         }).catch((res) => {
//             reject(res);
//         });
//     });
// }

/**
 * 发送 GET 异步请求
 * httpPost(url, params).then((message) => { 成功 }).catch((message) => { 失败 });
 * https://blog.csdn.net/xjlinme/article/details/64128394
 * https://www.cnblogs.com/mrszhou/p/7859012.html
 */
// function httpPost(url, params, headers) {
//     if (params == null || params === undefined) {
//         params = {};
//     }
//     if (headers == null || headers === undefined) {
//         headers = buildVueRequestHeaders();
//     }
//     // console.log("POST请求", url + "\n" + JSON.stringify(params) + "\n" + JSON.stringify(headers));
//     return new Promise((resolve, reject) => {
//         Vue.http.post(buildUrl(url),
//             {
//                 headers: headers,
//                 params: params
//             },
//             {
//                 emulateJSON: true
//             }
//         ).then((res) => {
//             resolve(res.body);
//         }).catch((res) => {
//             reject(res.body);
//         });
//     });
// }
