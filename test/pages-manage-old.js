/**
 * 页面初始化执行
 */
$(function () {
    // 默认首页ID
    var def_page_index_id = '#index';
    // 默认容器ID 更改容器名称可以在这里修改
    var pageContainer = $('#page-container');
    // 所有页面集合 属于 type = text/html 的 script 标签
    var pageDomList = $('script[type="text/html"]');
    // 页面实际信息集合
    var pageInfoList = [];
    // 当前页面标记
    var currentHash = def_page_index_id;
    // 页面生命周期回调
    var pageLifeCycleCallbackList = [];
    // 生命周期枚举 create: 创建完成, renew: 重新返回, stop: 被下个页面盖住, destroy: 被移除界面销毁
    var PAGE_CREATE = 'create', PAGE_RENEW = 'renew', PAGE_STOP = 'stop', PAGE_DESTROY = 'destroy';

    // 监听页面 hash 改变 e.oldURL, e.newURL, window.addEventListener('hashchange', function (e) {}, false);
    $(window).on('hashchange', function (e) {
        openHashPage(getHash());
    });

    for (var i = 0; i < pageDomList.length; i++) {
        var dom = $(pageDomList[i]);
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
        pageInfoList.push({
            'id': '#' + id.toString(),
            'html': html
        });
        // 删除DOM声明节点
        dom.remove();
    }

    // 根据HASH打开页面
    function openHashPage(hash) {
        var pageHtml = findPageHtml(hash);
        setTimeout(function () {
            appendPage(hash, pageHtml);
        }, 0);
    }

    // 获取路径上的hash(#部分)
    function getHash() {
        return window.location.hash.indexOf('#') >= 0 ? window.location.hash : def_page_index_id;
    }

    // 根据ID查找页面
    function findPageHtml(id) {
        for (var p = 0; p < pageInfoList.length; p++) {
            if (pageInfoList[p].id === id) {
                return pageInfoList[p].html;
            }
        }
        return null;
    }

    // 创建一个动画执行容器
    function createAnimateContainer(id) {
        return $("<div id='" + id + "' class='animate-ready'></div>");
    }

    // 查找活动的页面
    function findActivityPage(id, container) {
        var activityPageList = container.children();
        for (var i = 0; i < activityPageList.length; i++) {
            var pid = $(activityPageList[i]).attr("id");
            if (pid === id) {
                return activityPageList[i];
            }
        }
        return null;
    }

    // 获取当前显示页面的前一个页面(倒数第二个显示页)
    function findActivityPageLast(container) {
        var activityPageList = container.children();
        if (activityPageList.length > 1) {
            return activityPageList[activityPageList.length - 2];   // 倒数第二页面
        }
        return null;
    }

    // 弹出指定页面之后的所有活动页面
    function popUpLastActivityPage(id, container) {
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
        pageLifeCycleDistribute(id, PAGE_RENEW);

        for (var j = 0; j < deletePageList.length; j++) {
            $(deletePageList[j]).remove();

            // 生命周期回调
            pageLifeCycleDistribute($(deletePageList[j]).attr("id"), PAGE_DESTROY);
        }
    }

    // 添加页面到容器
    function appendPage(id, html) {
        var pc = pageContainer; // 页面容器

        var activityPage = findActivityPage(id, pc);
        var activityPageLast = findActivityPageLast(pc);
        if (activityPage != null && activityPage !== undefined &&  // 计划打开的页面在历史里面存在 且与倒数第二个一致 认定用户为后退操作
            activityPageLast != null && $(activityPageLast).attr("id") === $(activityPage).attr("id")) {

            var currentPage = $(findActivityPage(currentHash, pc)); // 找到当前页面
            currentPage.addClass('animate-ready').addClass('page-out');
            currentPage.on('animationend webkitAnimationEnd', function () {
                currentPage.remove(); // 动画结束后 从容器删除
            });

            // 生命周期回调
            pageLifeCycleDistribute($(activityPageLast).attr("id"), PAGE_RENEW);
            pageLifeCycleDistribute($(currentPage).attr("id"), PAGE_DESTROY);

        } else if (activityPage != null && activityPage !== undefined &&    // 计划打开的页面在历史里面存在 但是不是倒数第二个 弹出(关闭)指定页面之后的所有页面
            (activityPageLast == null || $(activityPageLast).attr("id") !== $(activityPage).attr("id"))) {

            popUpLastActivityPage(id, pc);  // 弹出(关闭)指定页面之后的所有页面

        } else {    // 历史中不存在 打开新页面

            var animateContainerNew = createAnimateContainer(id);
            animateContainerNew.append($(html));
            animateContainerNew.addClass('page-in');
            animateContainerNew.on('animationend webkitAnimationEnd', function () { // 动画结束后删除不必要的属性
                animateContainerNew.removeClass('page-in').removeClass('animate-ready').addClass('page-style');
            });
            pc.append(animateContainerNew);

            // 生命周期回调
            pageLifeCycleDistribute(currentHash, PAGE_STOP);
            pageLifeCycleDistribute(id, PAGE_CREATE);
        }
        // 记录当前显示
        currentHash = id;
    }

    // 生命周期派发 pageId: 页面ID, lifeCycle: 生命周期 create / renew / destroy
    function pageLifeCycleDistribute(pageId, lifeCycle) {
        for (var i = 0; i < pageLifeCycleCallbackList.length; i++) {
            pageLifeCycleCallbackList[i](pageId, lifeCycle);
        }
    }

    // 添加页面生命周期监听器
    function addPageLifeCycleCallback(callback) {
        var index = pageLifeCycleCallbackList.indexOf(callback);
        if (index <= -1) {
            pageLifeCycleCallbackList.push(callback);
        }
    }

    // 移除页面生命周期监听器
    function removePageLifeCycleCallback(callback) {
        var index = pageLifeCycleCallbackList.indexOf(callback);
        if (index > -1) {
            pageLifeCycleCallbackList.splice(index, 1);
        }
    }

    // 打开默认首页 不需要动画
    function openDefPage(pc) {
        var animateContainerNew = createAnimateContainer(def_page_index_id);
        animateContainerNew.append(findPageHtml(def_page_index_id));
        animateContainerNew.addClass('page-style');
        pc.append(animateContainerNew);

        // 生命周期回调
        pageLifeCycleDistribute(def_page_index_id, PAGE_CREATE);
    }

    setTimeout(function () {
        pageContainer.empty();
        pageContainer.addClass('page-container');
        addPageLifeCycleCallback(function (id, lc) {
            console.log("生命周期回调", id + " | " + lc);
        });
        var hash = getHash();
        if (hash === def_page_index_id) {
            openDefPage(pageContainer);
        } else {
            openHashPage(hash);
        }
    }, 0);
});
