# SinglePageRouting
前端做成单页应用用户体验能得到明显提升,所以尝试研究和自己写一个单页应用管理器

### 参考了微信的WEUI实现

### 使用请直接引入test目录下的 pages-manage.css 与 pages-manage.js (注意: 需要依赖JQuery库)

### 示例DEMO请参考test.html

建议不要使用浏览器的 history.back() 而是自己控制跳转

目前已发现有一个BUG是在打开新页面时有可能会出现URL地址修改了但是打不开新页面的情况,目前定位不到问题,调试发现代码已经执行,有可能为JQuery append失效.详细参见 pages-manage.js 里的 appendPage 方法.BUG不是每次都出现,而是偶发性的出现.所以暂时没找到解决方案.
