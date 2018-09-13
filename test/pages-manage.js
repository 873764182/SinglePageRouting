/**
 * 页面初始化执行
 */
$(function () {
    window.pm = {
        // 默认首页ID
        def_page_index_id: '#index',
        // 默认容器ID 更改容器名称可以在这里修改
        pageContainer: $('#page-container'),
        // 所有页面集合 属于 type = text/html 的 script 标签
        pageDomList: $('script[type="text/html"]'),
        // 页面实际信息集合
        pageInfoList: [],
        // 当前页面标记
        currentHash: self.def_page_index_id,
        // 页面生命周期回调
        pageLifeCycleCallbackList: [],
        // 生命周期枚举 create: 创建完成, renew: 重新返回, stop: 被下个页面盖住, destroy: 被移除界面销毁
        PAGE_CREATE: 'create', PAGE_RENEW: 'renew', PAGE_STOP: 'stop', PAGE_DESTROY: 'destroy',
        // 当前对象引用
        self: null,

        // 根据HASH打开页面
        openHashPage: function (hash) {
            var pageHtml = self.findPageHtml(hash);
            self.appendPage(hash, pageHtml);
        },

        // 获取路径上的hash(#部分)
        getHash: function () {
            return window.location.hash.indexOf('#') >= 0 ? window.location.hash : self.def_page_index_id;
        },

        // 根据ID查找页面
        findPageHtml: function (id) {
            for (var p = 0; p < self.pageInfoList.length; p++) {
                if (self.pageInfoList[p].id === id) {
                    return self.pageInfoList[p].html;
                }
            }
            return null;
        },

        // 创建一个动画执行容器
        createAnimateContainer: function (id) {
            return $("<div id='" + id + "' class='animate-ready'></div>");
        },

        // 查找活动的页面
        findActivityPage: function (id, container) {
            var activityPageList = container.children();
            for (var i = 0; i < activityPageList.length; i++) {
                var pid = $(activityPageList[i]).attr("id");
                if (pid === id) {
                    return activityPageList[i];
                }
            }
            return null;
        },

        // 获取当前显示页面的前一个页面(倒数第二个显示页)
        findActivityPageLast: function (container) {
            var activityPageList = container.children();
            if (activityPageList.length > 1) {
                return activityPageList[activityPageList.length - 2];   // 倒数第二页面
            }
            return null;
        },

        // 弹出指定页面之后的所有活动页面
        popUpLastActivityPage: function (id, container) {
            var canDelete = false;
            var deletePageList = [];
            var activityPageList = container.children();
            for (var i = 0; i < activityPageList.length; i++) {
                if (canDelete) {
                    deletePageList.push(activityPageList[i]);
                }
                var pid = $(activityPageList[i]).attr("id");
                if (pid === id) {
                    canDelete = true;
                }
            }

            // 生命周期回调
            self.pageLifeCycleDistribute(id, self.PAGE_RENEW);

            for (var j = 0; j < deletePageList.length; j++) {
                $(deletePageList[j]).remove();

                // 生命周期回调
                self.pageLifeCycleDistribute($(deletePageList[j]).attr("id"), self.PAGE_DESTROY);
            }
        },

        // 添加页面到容器
        appendPage: function (id, html) {
            var pc = self.pageContainer; // 页面容器

            var activityPage = self.findActivityPage(id, pc);
            var activityPageLast = self.findActivityPageLast(pc);
            if (activityPage != null && activityPage !== undefined &&  // 计划打开的页面在历史里面存在 且与倒数第二个一致 认定用户为后退操作
                activityPageLast != null && $(activityPageLast).attr("id") === $(activityPage).attr("id")) {

                var currentPage = $(self.findActivityPage(self.currentHash, pc)); // 找到当前页面
                currentPage.addClass('animate-ready').addClass('page-out');
                currentPage.on('animationend webkitAnimationEnd', function () {
                    currentPage.remove(); // 动画结束后 从容器删除
                });

                // 生命周期回调
                self.pageLifeCycleDistribute($(activityPageLast).attr("id"), self.PAGE_RENEW);
                self.pageLifeCycleDistribute($(currentPage).attr("id"), self.PAGE_DESTROY);

            } else if (activityPage != null && activityPage !== undefined &&    // 计划打开的页面在历史里面存在 但是不是倒数第二个 弹出(关闭)指定页面之后的所有页面
                (activityPageLast == null || $(activityPageLast).attr("id") !== $(activityPage).attr("id"))) {

                self.popUpLastActivityPage(id, pc);  // 弹出(关闭)指定页面之后的所有页面

            } else {    // 历史中不存在 打开新页面

                var animateContainerNew = self.createAnimateContainer(id);
                animateContainerNew.append($(html));
                animateContainerNew.addClass('page-in');
                animateContainerNew.on('animationend webkitAnimationEnd', function () { // 动画结束后删除不必要的属性
                    animateContainerNew.removeClass('page-in').removeClass('animate-ready').addClass('page-style');
                });
                pc.append(animateContainerNew);

                // 生命周期回调
                self.pageLifeCycleDistribute(self.currentHash, self.PAGE_STOP);
                self.pageLifeCycleDistribute(id, self.PAGE_CREATE);
            }
            // 记录当前显示
            self.currentHash = id;
        },

        // 生命周期派发 pageId: 页面ID, lifeCycle: 生命周期 create / renew / destroy
        pageLifeCycleDistribute: function (pageId, lifeCycle) {
            for (var i = 0; i < self.pageLifeCycleCallbackList.length; i++) {
                self.pageLifeCycleCallbackList[i](pageId, lifeCycle);
            }
        },

        // 添加页面生命周期监听器
        addPageLifeCycleCallback: function (callback) {
            var index = self.pageLifeCycleCallbackList.indexOf(callback);
            if (index <= -1) {
                self.pageLifeCycleCallbackList.push(callback);
            }
        },

        // 移除页面生命周期监听器
        removePageLifeCycleCallback: function (callback) {
            var index = self.pageLifeCycleCallbackList.indexOf(callback);
            if (index > -1) {
                self.pageLifeCycleCallbackList.splice(index, 1);
            }
        },

        // 打开默认首页 不需要动画
        openDefPage: function (pc) {
            var animateContainerNew = self.createAnimateContainer(self.def_page_index_id);
            animateContainerNew.append(self.findPageHtml(self.def_page_index_id));
            animateContainerNew.addClass('page-style');
            pc.append(animateContainerNew);

            // 生命周期回调
            self.pageLifeCycleDistribute(self.def_page_index_id, self.PAGE_CREATE);
        },

        // 初始化
        init: function () {
            // 赋值引用
            self = this;
            // 页面生命周期回调
            self.addPageLifeCycleCallback(function (pageId, lifeCycle) {
                console.log("Page Life cycle callback", pageId + " -> " + lifeCycle);
            });
            // 监听页面 hash 改变 e.oldURL, e.newURL, window.addEventListener('hashchange', function (e) {}, false);
            $(window).on('hashchange', function (e) {
                self.openHashPage(self.getHash());
            });

            for (var i = 0; i < self.pageDomList.length; i++) {
                var dom = $(self.pageDomList[i]);
                var id = dom.attr('id');
                var src = dom.attr('src');
                // 获取页面实际信息 (同步GET请求 或者 直接读取便签内内容)
                var html = null;
                if (src == null || src === undefined || src.length <= 0) {
                    html = dom.html();
                } else {
                    html = $.ajax({url: src.toString(), method: 'get', async: false}).responseText;
                }
                // 保存页面信息
                self.pageInfoList.push({
                    'id': '#' + id.toString(),
                    'html': html
                });
                // 删除DOM声明节点
                dom.remove();
            }

            self.pageContainer.empty();
            self.pageContainer.addClass('page-container');

            var hash = self.getHash();
            if (hash === self.def_page_index_id) {
                self.openDefPage(self.pageContainer);
            } else {
                self.openHashPage(hash);
            }
        }
    };
    // 初始化
    window.pm.init();
});
