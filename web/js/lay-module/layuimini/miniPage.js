/**
 * date:2020/02/27
 * author:Mr.Chung
 * version:2.0
 * description:layuimini 单页框架扩展
 */
layui.define(["element", "jquery"], function (exports) {
    var element = layui.element,
        $ = layui.$,
        layer = layui.layer;

    var miniPage = {

        /**
         * 初始化tab
         * @param options
         */
        render: function (options) {
            options.homeInfo = options.homeInfo || {};
            options.menuList = options.menuList || [];
            options.multiModule = options.multiModule || false;
            options.renderPageVersion = options.renderPageVersion || false;
            options.listenSwichCallback = options.listenSwichCallback || function () {
            };
            var href = location.hash.replace(/^#\//, '');
            // href = href.replace(/^\/h5\/#\//, '');
            // options.lastUrl = href;

            if (href === null || href === undefined || href === '') {
                miniPage.renderHome(options);
            } else {
                miniPage.renderPage(href, options);
                miniPage.listenSwitchSingleModule(href);
            }
            miniPage.listen(options);
            miniPage.listenHash(options);
        },

        /**
         * 初始化主页
         * @param options
         */
        renderHome: function (options) {
            options.homeInfo = options.homeInfo || {};
            options.homeInfo.href = options.homeInfo.href || '';
            options.renderPageVersion = options.renderPageVersion || false;
            $('.layuimini-page-header').addClass('layui-hide');
            miniPage.renderPageContent(options.homeInfo.href, options);
        },

        /**
         * 初始化页面
         * @param href
         * @param options
         */
        renderPage: function (href, options) {
            miniPage.renderPageTitle(href, options);
            miniPage.renderPageContent(href, options);
        },

        /**
         * 初始化页面标题
         * @param href
         * @param options
         */
        renderPageTitle: function (href, options) {
            options.homeInfo = options.homeInfo || {};
            options.homeInfo.title = options.homeInfo.title;
            options.menuList = options.menuList || [];
            $('.layuimini-page-header').removeClass('layui-hide');
            var pageTitleHtml = '<a lay-href="" href="javascript:;" class="layuimini-back-home">' + options.homeInfo.title + '</a><span lay-separator="">/</span>\n';
            var pageTitleArray = miniPage.buildPageTitleArray(href, options.menuList);
            if (pageTitleArray.length > 0) {
                for (var key in pageTitleArray) {
                    key = parseInt(key);
                    if (key !== pageTitleArray.length - 1) {
                        pageTitleHtml += '<a><cite>' + pageTitleArray[key] + '</cite></a><span lay-separator="">/</span>\n';
                    } else {
                        pageTitleHtml += '<a><cite>' + pageTitleArray[key] + '</cite></a>\n';
                    }
                }
            } else {
                var title = sessionStorage.getItem('layuimini_page_title');
                if (title === null || title === undefined || title === '') {
                    $('.layuimini-page-header').addClass('layui-hide');
                } else {
                    pageTitleHtml += '<a><cite>' + title + '</cite></a>\n';
                }
            }
            $('.layuimini-page-header .layuimini-page-title').empty().html(pageTitleHtml);
        },

        /**
         * 初始化页面内容
         * @param options
         * @param href
         */
        renderPageContent: function (href, options) {
            options.renderPageVersion = options.renderPageVersion || false;
            var container = '.layuimini-content-page';
            if ($(".layuimini-page-header").hasClass("layui-hide")) {
                $(container).removeAttr("style");
            } else {
                // $(container).attr("style", "height: calc(100% - 36px)");
            }
            $(container).html('');

            $.ajax({
                url: href,
                type: 'get',
                dataType: 'html',
                success: function (data) {
                    $(container).html(data);
                    element.init();
                },
                error: function (xhr, textstatus, thrown) {
                    return layer.msg('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！');
                }
            });
        },

        /**
         * 刷新页面内容
         * @param href
         * @param options
         */
        refresh: function (href, options) {
            if (href === null || href === undefined || href === '') {
                href = location.hash.replace(/^#\//, '');
            }

            if (href === null || href === undefined || href === '') {
                miniPage.renderHome(options);
            } else {
                miniPage.renderPageContent(href, options);
            }
        },

        /**
         * 构建页面标题数组
         * @param href
         * @param menuList
         */
        buildPageTitleArray: function (href, menuList) {
            var array = [],
                newArray = [];
            for (key in menuList) {
                var item = menuList[key];
                if (item.href === href) {
                    array.push(item.title);
                    break;
                }
                if (item.child) {
                    newArray = miniPage.buildPageTitleArray(href, item.child);
                    if (newArray.length > 0) {
                        newArray.unshift(item.title);
                        array = array.concat(newArray);
                        break;
                    }
                }
            }
            return array;
        },

        /**
         * 获取指定链接内容
         * @param href
         * @returns {string}
         */
        getHrefContent: function (href) {
            var content = '';
            var v = new Date().getTime();
            $.ajax({
                url: href.indexOf("?") > -1 ? href + '&v=' + v : href + '?v=' + v,
                type: 'get',
                dataType: 'html',
                async: false,
                success: function (data) {
                    content = data;
                },
                error: function (xhr, textstatus, thrown) {
                    return layer.msg('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！');
                }
            });
            return content;
        },

        /**
         * 获取弹出层的宽高
         * @returns {jQuery[]}
         */
        getOpenWidthHeight: function () {
            var clienWidth = $(".layuimini-content-page").width();
            var clientHeight = $(".layuimini-content-page").height();
            var offsetLeft = $(".layuimini-content-page").offset().left;
            var offsetTop = $(".layuimini-content-page").offset().top;
            return [clienWidth, clientHeight, offsetTop, offsetLeft];
        },

        /**
         * 单模块切换
         * @param tabId
         */
        listenSwitchSingleModule: function (tabId) {
            $("[layuimini-href]").each(function () {
                if ($(this).attr("layuimini-href") === tabId) {
                    // 自动展开菜单栏
                    var addMenuClass = function ($element, type) {
                        if (type === 1) {
                            $element.addClass('layui-this');
                            if ($element.hasClass('layui-nav-item') && $element.hasClass('layui-this')) {
                                $(".layuimini-header-menu li").attr('class', 'layui-nav-item');
                            } else {
                                addMenuClass($element.parent().parent(), 2);
                            }
                        } else {
                            $element.addClass('layui-nav-itemed');
                            if ($element.hasClass('layui-nav-item') && $element.hasClass('layui-nav-itemed')) {
                                $(".layuimini-header-menu li").attr('class', 'layui-nav-item');
                            } else {
                                addMenuClass($element.parent().parent(), 2);
                            }
                        }
                    };
                    addMenuClass($(this).parent(), 1);
                    return false;
                }
            });
        },

        /**
         * 修改hash地址定位
         * @param href
         */
        hashChange: function (href) {
            window.location.hash = "/" + href;
        },

        /**
         * 监听
         * @param options
         */
        listen: function (options) {

            /**
             * 打开新窗口
             */
            $('body').on('click', '[layuimini-href]', function () {
                var href = $(this).attr('layuimini-href');
                if(!href) return  ;
                var me = this ;

                var el = $("[layuimini-href='"+href+"']",".layuimini-menu-left") ;
                layer.close(window.openTips);
                if(el.length){
                    $(el).closest(".layui-nav").find(".select").removeClass("layui-this");
                    $(el).parent().addClass("layui-this");
                }

                if(href===options.lastUrl){
                    miniPage.refresh(href,options);
                }else{
                    miniPage.hashChange(href);
                }
                options.lastUrl = href;

                $('.layuimini-header-content').attr('layuimini-page-add', 'yes');
            });
        },


        /**
         * 监听hash变化
         * @returns {boolean}
         */
        listenHash: function (options) {
            options.homeInfo = options.homeInfo || {};
            options.multiModule = options.multiModule || false;
            options.listenSwichCallback = options.listenSwichCallback || function () {
            };

            window.onhashchange = function () {
                var href = location.hash.replace(/^#\//, '');
                href = href.replace(/^\/h5\/#\//, '');
                if (typeof options.listenSwichCallback === 'function') {
                    options.listenSwichCallback();
                }

                if (href === null || href === undefined || href === '') {
                    $("[layuimini-href]").parent().removeClass('layui-this');
                    miniPage.renderHome(options);
                } else {
                    miniPage.renderPage(href, options);
                }

                if ($('.layuimini-header-content').attr('layuimini-page-add') === 'yes') {
                    $('.layuimini-header-content').attr('layuimini-page-add', 'no');
                } else {
                    // 从页面中打开的话，浏览器前进后退、需要重新定位菜单焦点
                    $("[layuimini-href]").parent().removeClass('layui-this');
                    miniPage.listenSwitchSingleModule(href);
                }


            };
        },
    };

    exports("miniPage", miniPage);
});