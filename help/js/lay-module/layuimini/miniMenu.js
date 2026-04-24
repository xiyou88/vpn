/**
 * date:2020/02/27
 * author:Mr.Chung
 * version:2.0
 * description:layuimini 菜单框架扩展
 */
layui.define(["element","laytpl" ,"jquery"], function (exports) {
    var element = layui.element,
        $ = layui.$,
        laytpl = layui.laytpl,
        layer = layui.layer;

    var miniMenu = {

        /**
         * 菜单初始化
         * @param options.menuList   菜单数据信息
         * @param options.multiModule 是否开启多模块
         * @param options.menuChildOpen 是否展开子菜单
         */
        render: function (options) {
            options.menuList = options.menuList || [];
            options.multiModule = options.multiModule || false;
            options.menuChildOpen = options.menuChildOpen || false;

            miniMenu.renderSingleModule(options.menuList, options.menuChildOpen);
            miniMenu.listen();
        },

        /**
         * 单模块
         * @param menuList 菜单数据
         * @param menuChildOpen 是否默认展开
         */
        renderSingleModule: function (menuList, menuChildOpen) {
            menuList = menuList || [];
            var leftMenuHtml = '',
                childOpenClass = '';
            var me = this ;
            if (menuChildOpen) childOpenClass = ' layui-nav-itemed';
            leftMenuHtml = this.renderLeftMenu(menuList,{ childOpenClass:childOpenClass }) ;
            $('.layui-layout-body').addClass('layuimini-single-module'); //单模块标识
            $('.layuimini-header-menu').remove();
            $('.layuimini-header-content').html(leftMenuHtml);

            element.init();
        },

        /**
         * 渲染一级菜单
         */
        compileMenu: function(menu,isSub){
            var menuHtml = '<li {{#if( d.menu){ }}  data-menu="{{d.menu}}" {{#}}} class="layui-nav-item {{d.className}}"  {{#if( d.id){ }}  id="{{d.id}}" {{#}}}> <a {{#if( d.href){ }} layuimini-href="{{d.href}}" href="javascript:;" {{#}}} {{#if( d.target){ }}  target="{{d.target}}" {{#}}} >{{#if( d.icon){ }}  <i class="{{d.icon}}"></i> {{#}}} <span class="layui-left-nav">{{d.title}}</span></a>  {{# if(d.children){}} {{d.children}} {{#}}} </li>' ;

            return laytpl(menuHtml).render(menu);
        },
        compileMenuContainer :function(menu,isSub){
            var wrapperHtml = '<ul class="layui-nav  layui-layout-right">{{d.children}}</ul>' ;
            if(isSub){
                wrapperHtml = '<dl class="layui-nav-child ">{{d.children}}</dl>' ;
            }
            if(!menu.children){
                return "";
            }
            return laytpl(wrapperHtml).render(menu);
        },

        each:function(list,callback){
            var _list = [];
            for(var i = 0 ,length = list.length ; i<length ;i++ ){
                _list[i] = callback(i,list[i]) ;
            }
            return _list ;
        },
        renderChildrenMenu:function(menuList,options){
            var me = this ;
            menuList = menuList || [] ;
            var html = this.each(menuList,function (idx,menu) {
                if(menu.child && menu.child.length){
                    menu.children = me.renderChildrenMenu(menu.child,{ childOpenClass: options.childOpenClass || '' });
                }
                if (menu.select != ""){
                    menu.className = menu.select;
                }else {
                    menu.className = "" ;
                }

                menu.childOpenClass = options.childOpenClass || ''
                return me.compileMenu(menu,true)
            }).join("");
            return me.compileMenuContainer({ children:html },true)
        },
        renderLeftMenu :function(leftMenus,options){
            options = options || {};
            var me = this ;

            var leftMenusHtml =  me.each(leftMenus || [],function (idx,leftMenu) { // 左侧菜单遍历
                var children = me.renderChildrenMenu(leftMenu.child, { childOpenClass:options.childOpenClass });
                var leftMenuHtml = me.compileMenu({
                    href:leftMenu.href,
                    target:leftMenu.target,
                    childOpenClass:options.childOpenClass,
                    // className: leftMenu.select,
                    icon:leftMenu.icon,
                    title:leftMenu.title,
                    children:children
                });
                return leftMenuHtml ;
            }).join("");

            leftMenusHtml = me.compileMenuContainer({ id:options.parentMenuId,className:options.leftMenuCheckDefault,children:leftMenusHtml }) ;
            return leftMenusHtml ;
        },

        /**
         * 监听
         */
        listen: function () {

        },

    };


    exports("miniMenu", miniMenu);
});
