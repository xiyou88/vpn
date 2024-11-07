/**
 * date:2020/02/27
 * author:Mr.Chung
 * version:2.0
 * description:layuimini 主体框架扩展
 */

layui.define(["jquery", "miniMenu", "element","miniPage"], function (exports) {
    var $ = layui.$,
        element = layui.element,
        layer = layui.layer,
        miniMenu = layui.miniMenu,
        miniPage = layui.miniPage;

    if (!/http(s*):\/\//.test(location.href)) {
        var tips = "请先将项目部署至web容器（Apache/Tomcat/Nginx/IIS/等），否则部分数据将无法显示";
        return layer.alert(tips);
    }

    var homeInfo = {
        "title": "",
        "href": "user.html",
    }

    var menuHead = "";//"/h5/index.html#/";
    var menuInfo = [
        {
            "id":1,
            "title":"用户中心",
            "href":menuHead+"user.html",
            "select":"",
            "target":"",
            "child": null,
        },
        {
            "id":2,
            "title":"购买",
            "href":menuHead+"buy.html",
            "select":"",
            "target":"",
            "child": null,
        },
        {
            "id":3,
            "title":"线路列表",
            "href":menuHead+"route.html",
            "select":"",
            "target":"",
            "child": null,
        }
    ];

    var miniAdmin = {

        /**
         * 后台框架初始化
         * @param options.iniUrl   后台初始化接口地址
         * @param options.clearUrl   后台清理缓存接口
         * @param options.renderPageVersion 初始化页面是否加版本号
         * @param options.bgColorDefault 默认皮肤
         * @param options.multiModule 是否开启多模块
         * @param options.menuChildOpen 是否展开子菜单
         * @param options.loadingTime 初始化加载时间
         * @param options.pageAnim 切换菜单动画
         * @param options.token 凭证
         */
        render: function (options) {
            options.iniUrl = options.iniUrl || null;
            options.clearUrl = options.clearUrl || null;
            options.renderPageVersion = options.renderPageVersion || false;
            options.bgColorDefault = options.bgColorDefault || 0;
            options.multiModule = options.multiModule || false;
            options.menuChildOpen = options.menuChildOpen || false;
            options.loadingTime = options.loadingTime || 1;
            options.pageAnim = options.pageAnim || false;

            if(options.channel!="" && options.channel != undefined){
                layui.data('channel',{key:"info",value: options.channel});
            }

            let nowHref = layui.router().href;
            let isSelect = false;
            for(let i=0;i<menuInfo.length;i++){
                if(menuInfo[i].href.indexOf(nowHref)>-1){
                    isSelect = true;
                    menuInfo[i].select = "layui-this";
                }else {
                    menuInfo[i].select ="";
                }
            }

            if (!isSelect){
                menuInfo[0].select = "layui-this";
            }

            miniAdmin.renderClear(options.clearUrl);
            miniAdmin.renderAnim(options.pageAnim);
            miniAdmin.listen({
                homeInfo:homeInfo,
                multiModule: options.multiModule,
            });
            miniMenu.render({
                menuList: menuInfo,
                multiModule: options.multiModule,
                menuChildOpen: options.menuChildOpen
            });

            miniPage.render({
                homeInfo:homeInfo,
                menuList: menuInfo,
                multiModule: options.multiModule,
                renderPageVersion: options.renderPageVersion,
                menuChildOpen: options.menuChildOpen,
                listenSwichCallback: function () {
                    miniAdmin.renderDevice();
                }
            });

            miniAdmin.deleteLoader(options.loadingTime);
        },

        /**
         * 初始化缓存地址
         * @param clearUrl
         */
        renderClear: function (clearUrl) {
            $('.layuimini-clear').attr('data-href',clearUrl);
        },

        /**
         * 切换菜单动画
         * @param anim
         */
        renderAnim: function (anim) {
            if (anim) {
                $('#layuimini-bg-color').after('<style id="layuimini-page-anim">' +
                    '.layuimini-page-anim {-webkit-animation-name:layuimini-upbit;-webkit-animation-duration:.3s;-webkit-animation-fill-mode:both;}\n' +
                    '@keyframes layuimini-upbit {0% {transform:translate3d(0,30px,0);opacity:.3;}\n' +
                    '100% {transform:translate3d(0,0,0);opacity:1;}\n' +
                    '}\n' +
                    '</style>');
            }
        },

        /**
         * 初始化设备端
         */
        renderDevice: function () {
            if (miniAdmin.checkMobile()) {
                $('.layuimini-tool i').attr('data-side-fold', 1);
                $('.layuimini-tool i').attr('class', 'fa fa-outdent');
                $('.layui-layout-body').removeClass('layuimini-mini');
                $('.layui-layout-body').addClass('layuimini-all');
            }
        },


        /**
         * 初始化加载时间
         * @param loadingTime
         */
        deleteLoader: function (loadingTime) {

            setTimeout(function () {
                $('.layuimini-loader').fadeOut();
            }, loadingTime * 1000)
        },

        /**
         * 成功
         * @param title
         * @returns {*}
         */
        success: function (title) {
            return layer.msg(title, {icon: 1, shade: this.shade, scrollbar: false, time: 2000, shadeClose: true});
        },

        /**
         * 失败
         * @param title
         * @returns {*}
         */
        error: function (title) {
            return layer.msg(title, {icon: 2, shade: this.shade, scrollbar: false, time: 3000, shadeClose: true});
        },

        /**
         * 判断是否为手机
         * @returns {boolean}
         */
        checkMobile: function () {
            var ua = navigator.userAgent.toLocaleLowerCase();
            var pf = navigator.platform.toLocaleLowerCase();
            var isAndroid = (/android/i).test(ua) || ((/iPhone|iPod|iPad/i).test(ua) && (/linux/i).test(pf))
                || (/ucweb.*linux/i.test(ua));
            var isIOS = (/iPhone|iPod|iPad/i).test(ua) && !isAndroid;
            var isWinPhone = (/Windows Phone|ZuneWP7/i).test(ua);
            var clientWidth = document.documentElement.clientWidth;
            if (!isAndroid && !isIOS && !isWinPhone && clientWidth > 1024) {
                return false;
            } else {
                return true;
            }
        },

        listen: function (options) {
            options.homeInfo = options.homeInfo || {};

            /**
             * 监听提示信息
             */
            $("body").on("mouseenter", ".layui-nav-tree .menu-li", function () {
                if (miniAdmin.checkMobile()) {
                    return false;
                }
                var classInfo = $(this).attr('class'),
                    tips = $(this).prop("innerHTML"),
                    isShow = $('.layuimini-tool i').attr('data-side-fold');
                if (isShow == 0 && tips) {
                    tips = "<ul class='layuimini-menu-left-zoom layui-nav layui-nav-tree layui-this'><li class='layui-nav-item layui-nav-itemed'>"+tips+"</li></ul>" ;
                    window.openTips = layer.tips(tips, $(this), {
                        tips: [2, '#2f4056'],
                        time: 300000,
                        skin:"popup-tips",
                        success:function (el) {
                            var left = $(el).position().left - 10 ;
                            $(el).css({ left:left });
                            element.render();
                        }
                    });
                }
            });

        }
    };

    exports("miniAdmin", miniAdmin);
});
