layui.use(['form', 'table', 'miniPage'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var miniPage = layui.miniPage;
    var ts = 120000;

    var token = layui.data('token').info;
    if(token == undefined || token == ""){
       window.location = 'login.html';
    }
});
