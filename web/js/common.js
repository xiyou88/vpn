layui.use(['form', 'table', 'miniPage'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var miniPage = layui.miniPage;
    var ts = 120000;
    var inter = setInterval(getBroadcastLastId,ts);
    var interfeedback = setInterval(getFeedbackLastId, ts);

    var token = layui.data('token').info;
    if(token == undefined || token == ""){
        clearInterval(inter);
        clearInterval(interfeedback);
       window.location = 'login.html';
    }

    function closeInterval(){
        clearInterval(inter);
    }

    // showQuickGuide();

    function startInterval(){
        getBroadcastLastId();
        inter = setInterval(getBroadcastLastId, ts);
    }
    function getBroadcastLastId(){
        axios({
            "method": "GET",
            "url": `${API_URL}/common/broadcast/last`
        }).then((json) => {
            if (json.code == 200) {
                let id = layui.data('broadcast').last;
                if(id==undefined || id<json.data.id){
                    $('#broadcast-id').addClass("layui-badge-dot");
                    $('.broadcast-show .time').text(dateUnixFormat(json.data.created));
                    $('.broadcast-show .desc').html(json.data.content);
                    $('.broadcast-show .id').text(json.data.id);
                    $('.broadcast-show').show();
                };
            }
        }, (e) => {
            layer.msg(e.errorType);
        });
    }

    function getFeedbackLastId(){
        axios({
            "method": "GET",
            "url": `${API_URL}/common/feedback/last`
        }).then((json) => {
            if (json.code == 200) {
                let id = layui.data('feedback').last;
                if(id<json.data.id){
                    $('#feedback-id').addClass("layui-badge-dot");
                };
            }
        }, (e) => {
            layer.msg(e.errorType);
        });
    }

    function getActivityInfo(){
        axios({
            "method": "GET",
            "url": `${API_URL}/common/activity/info`
        }).then((json) => {
            if (json.code == 200) {
                let now = parseInt(new Date().getTime()/1000);
                let activityInfo = layui.data('activity').info;
                if(activityInfo != undefined && activityInfo.id == json.data.id && activityInfo.expire_time>now){
                    startInterval();
                    return true;
                }

                if(json.data.image_url != undefined && json.data.image_url != ""){
                    layer.open({
                        type: 1,
                        title: false,
                        closeBtn: 1,
                        area: '250px',
                        offset: 'auto',
                        skin: 'layui-layer-nobg',
                        shadeClose: false,
                        content: `<img style="width: 325px;height: 442px;" src="${json.data.image_url}"/>`,
                        end: function(index, layero){
                            startInterval();
                            json.data.expire_time = now + json.data.expire_time*3600;
                            layui.data('activity',{key:"info",value: json.data});
                            return false;
                        }
                    });
                }else {
                    startInterval();
                }

            }
        }, (e) => {
            layer.msg(e.errorType);
            startInterval();
        });
    }

    function showQuickGuide(){
        var webapp = window.navigator.standalone;
        var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if(webapp || !isiOS){
            getActivityInfo();
            return true;
        }

        let now = parseInt(new Date().getTime()/1000);
        var ts = layui.data('quick_guide').ts;
        if (ts>now){
            getActivityInfo();
            return true;
        }

        var content = miniPage.getHrefContent('quick_guide.html');
        layer.open({
            type: 1,
            title: false,
            closeBtn: 1,
            area: ['300px','442px'],
            offset: 'auto',
            shadeClose: true,
            scrollbar: true,
            content: content,
            end: function(index, layero){
                layui.data('quick_guide',{key:"ts",value: now+86400});
                getActivityInfo();
            }
        });
    }
});
