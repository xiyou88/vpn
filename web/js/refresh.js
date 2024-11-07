var $ = layui.$;
$(function(){
    //创建MeScroll对象
    var mescroll = new MeScroll("mescroll", {
        down: {
            auto: false, //是否在初始化完毕之后自动执行下拉回调callback; 默认true
            callback: downCallback //下拉刷新的回调
        },
        // up: {
        //     auto: false, //是否在初始化时以上拉加载的方式自动加载第一页数据; 默认false
        //     isBounce: false, //此处禁止ios回弹,解析(务必认真阅读,特别是最后一点): http://www.mescroll.com/qa.html#q10
        //     callback: upCallback, //上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
        //     toTop:{ //配置回到顶部按钮
        //         src : "../images/mescroll-totop.png", //默认滚动到1000px显示,可配置offset修改
        //         //offset : 1000
        //     }
        // }
    });

    function downCallback(){
        mescroll.endSuccess();
        location.reload();
        // console.log("刷新")

    }

});