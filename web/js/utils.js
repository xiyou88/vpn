var API_URL = "https://api.yzcyhm.com/api/web";

function setCookie(name,auth) {
    let exp = new Date();
    exp.setTime(exp.getTime()+24*3600*1000);
    document.cookie = name+"="+auth+"; path=/; expires="+exp.toLocaleString()+";";
}
function getCookie(name) {
    let arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg)){
        return unescape(arr[2]);
    } else {
        return null;
    }
}
function delCookie(name) {
    setCookie(name,"",-10);
}

function add0(m){return m<10?'0'+m:m }
function dateUnixFormat(unix) {
    if(unix===0){
        return "0"
    }
    unix = String(unix).length===10?unix*1000:unix;

    let timezone = 8; //目标时区时间，东八区
    let offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
    let time = new Date(unix + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000);
    let y = time.getFullYear();
    let m = time.getMonth()+1;
    let d = time.getDate();
    let h = time.getHours();
    let mm = time.getMinutes();
    let s = time.getSeconds();
    return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
}
function timedateToUnix(t) {
    if(t==""||t=="0"){
        return 0;
    }

    t += "+0800"
    var date = new Date(t); //时间对象
	var unix = date.getTime(); //转换成时间戳
    unix = unix / 1000;
    return unix
}

function getNowTimeByDay(){
    var now = new Date();
    let y = now.getFullYear();
    let month = now.getMonth()+1;
    let d = now.getDate();
    return y + "-" + month + "-" + d;
}

function CentToYuan(num) {
    let y = num/100;
    return y.toString()
}

function dateStrFormat(str){
    let newStr = String(str).replace(/T/," ");
    str = newStr.substr(0,19);
    return str
}

const axios = function(options){
    if(options.method==""){
        options.method = "POST"
    }
    //options.async != "false" && options.async != false
    if(options.async != "false" && options.async != false){
        options.async = true;
    }

    options.method = options.method.toUpperCase();

    if(typeof(options.contentType)=="undefined"){
        options.contentType = "application/x-www-form-urlencoded";
    }

    if(options.contentType==="application/x-www-form-urlencoded"){
        var data = "";
        for(var key in options.data){
            data += "&"+key+"="+options.data[key]
        }
        options.data = data.slice(1);
    }else if(options.contentType==="application/json"){
        options.data = JSON.stringify(options.data);
    }

    if(options.method=="GET"|| options.method=="DELETE"){
        if(options.data.length>0){
            options.url = options.url+"?"+options.data;
        }
    }

    return new Promise(function (resolve,reject) {
        let xhr = new XMLHttpRequest();

        xhr.open(options.method,options.url,options.async);
        if(options.async==true){
            xhr.timeout = options.timeout?options.timeout:20000;  //等待响应的时间
        }

        for(var k in options.headers){
            xhr.setRequestHeader(k, options.headers[k]);
        }
        xhr.setRequestHeader("Content-Type",options.contentType);
        var token = layui.data('token').info;
        xhr.setRequestHeader("Authorization", token);
        let channel = layui.data('channel').info;
        if (channel == undefined){
            channel = "web"
        }

        let deviceId = layui.data('deviceId').id;
        xhr.setRequestHeader("deviceId", deviceId);
        xhr.setRequestHeader("channel", channel);
        xhr.setRequestHeader("Platform", "web");

        xhr.onabort = function () {
            reject(new Error({
                errorType: 'abort_error',
                xhr: xhr
            }));
        };
        xhr.ontimeout = function () {
            reject({
                errorType: '网络超时！！！',
                xhr: xhr
            });
        };
        xhr.onerror = function () {
            reject({
                errorType: '网络异常!!!',
                xhr: xhr
            })
        };
        xhr.onloadend = function () {
            if (xhr.status == 200){
                let res = JSON.parse(xhr.responseText);
                if(res.code==4003){
                    layui.sessionData('route',null);
                    layui.sessionData('user',null);
                }
                resolve(res);
            }else {
                reject({
                    errorType: '网络异常!!!',
                    xhr: xhr
                })
            }

        };
        try {
            xhr.send(options.data);
        }
        catch (e) {
            reject({
                errorType: '网络异常!!!',
                error: e
            });
        }
    });
    return promise;
};

function jsonToFrom(obj) {
    var data = "";
    for(var key in obj){
        data += "&"+key+"="+obj[key];
    }
    return  data.slice(1);
}

function GetRequestParams(str) {
    if (str=="" || str==undefined) {
        str = location.search; //获取url中"?"符后的字串
    }else {
        let strs = str.split("?");
        if(strs.length>1){
           str = strs.slice(1,).join("?");
           str = "?"+str;
        }
    }

    var theRequest = new Object();
    if (str.indexOf("?") != -1) {
        str = str.substr(1);
        let strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            let arr = strs[i].split("=");
            let key = arr[0];
            let value = arr.slice(1,).join("=");
            theRequest[key]=decodeURIComponent(value);
        }
    }
    return theRequest;
}

var $,tab,layer;

/*弹出层*/
/*
    参数解释：
    title   标题
    url     请求的url
    id      需要操作的数据id
    w       弹出层宽度（缺省调默认值）
    h       弹出层高度（缺省调默认值）
*/
function x_admin_show(title,url,w,h){
    if (title == null || title == '') {
        title=false;
    };
    if (url == null || url == '') {
        return;
    };
    if (w == null || w == '') {
        w = ($(window).width() *0.8);
    };
    if (h == null || h == '') {
        h=($(window).height() *0.8);
    };

    var layer = layui.layer;
    var form = layui.form;
    layer.open({
        type: 2,
        area: [w+'px', h +'px'],
        shadeClose: true,
        shade:0.4,
        title: title,
        content: url
    });
}

/*关闭弹出框口*/
function x_admin_close(){
    var index = parent.layer.getFrameIndex(window.name);
    parent.layer.close(index);
}

function draw(show_num) {
    var canvas_width=$('#canvas').width();
    var canvas_height=$('#canvas').height();
    var canvas = document.getElementById("canvas");//获取到canvas的对象，演员
    var context = canvas.getContext("2d");//获取到canvas画图的环境，演员表演的舞台
    canvas.width = canvas_width;
    canvas.height = canvas_height;
    var sCode = "A,B,C,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0";
    var aCode = sCode.split(",");
    var aLength = aCode.length;//获取到数组的长度

    for (var i = 0; i <= 3; i++) {
        var j = Math.floor(Math.random() * aLength);//获取到随机的索引值
        var deg = Math.random() * 30 * Math.PI / 180;//产生0~30之间的随机弧度
        var txt = aCode[j];//得到随机的一个内容
        show_num[i] = txt.toLowerCase();
        var x = 10 + i * 20;//文字在canvas上的x坐标
        var y = 20 + Math.random() * 8;//文字在canvas上的y坐标
        context.font = "bold 23px 微软雅黑";

        context.translate(x, y);
        context.rotate(deg);

        context.fillStyle = randomColor();
        context.fillText(txt, 0, 0);

        context.rotate(-deg);
        context.translate(-x, -y);
    }
    for (var i = 0; i <= 5; i++) { //验证码上显示线条
        context.strokeStyle = randomColor();
        context.beginPath();
        context.moveTo(Math.random() * canvas_width, Math.random() * canvas_height);
        context.lineTo(Math.random() * canvas_width, Math.random() * canvas_height);
        context.stroke();
    }
    for (var i = 0; i <= 30; i++) { //验证码上显示小点
        context.strokeStyle = randomColor();
        context.beginPath();
        var x = Math.random() * canvas_width;
        var y = Math.random() * canvas_height;
        context.moveTo(x, y);
        context.lineTo(x + 1, y + 1);
        context.stroke();
    }
}

function randomColor() {//得到随机的颜色值
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    return "rgb(" + r + "," + g + "," + b + ")";
}

function checkIsJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    return false;
}

function toPercent(num, total) {
    if(total<=0 || num<0){
        return "0%";
    }
    return (Math.round(num / total * 10000) / 100.00 + "%");// 小数点后两位百分比

}

var $ = layui.$;
$(document).ready(function () {
    console.log("start")
    var deviceId = layui.data('deviceId').id;
    if (deviceId == undefined || deviceId == ""){
        var md5v = md5(navigator.userAgent);
        layui.data('deviceId',{key:'id',value: "web"+md5v});
    }
})