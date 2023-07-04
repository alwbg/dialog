```javascript
/**
 * @autor alwbg@163.com | soei
 * -----------------------------------
 * - https://github.com/alwbg/dialog -
 * -----------------------------------
 * 提供弹窗,提示[左上,上中,右上,右下,下中,左下,中]位置显示,xx秒自动关闭功能
 * 支持全局和 AMD和CMD调用
 * update 2018-03-29
 * - 新增 auto内的配置项 
 * dialog.auto( html, Function, 
 * 'inner:左边距 上边距 右边距 下边距 中间选择器;animate:true|false 开始位置 结束位置;offset: 左 上 右 下;center:true'
 * )
 * 可以通过 dialog.push 添加和重写以上参数方法
 * dialog.push('auto', 'animate', function( current[, use,...]){} )
 * update 2020-04
 * 新增 -dialog.query(selector, context, true|false|[0-9])[css, attr, find, each, ...] @see #query(selector[,context, elements]);
 * 	-dialog.addClass(target, class)
 * 	-dialog.removeClass(target, class)
 * 	-dialog.css(target, class[, val])
 * 	-dialog.attr(target, prop[, val])
 * 	-dialog.html(target[, html])
 * 	-dialog.is(selector, target)
 * 	-dialog.within(selector, target)
 * update 2020-8-13
 * 新增
 * - dialog.query(#Selector, true) === dialog.createElement(tag.class[attr]{inner})
 * - dialog.createElement(tag.class[attr]{inner}|<tag .class [attr] ../>)
 * update 2020-11-20
 * 优化及新增
 * - dialog.tips(show text, time, {
 * 	target: 目标DOM,
 * 	positon: 'left,top,bottom,right' #显示规则, 优先级
 * }, init Function)
 * update 2021-03
 * 新增 
 * -dialog.query(selector, [true|false]|[0-9]+)
 * -dialog.query#parent(selector)
 * -dialog.query#insert(selector, target)
 * update 2021-10
 * 新增 
 * -dialog.render(htmlString, {data, events, components, watch})
 * 
 * Mix-time : 2023-01-07 00:22:22 子时
 */
// 实例1
dialog.auto(
  "Hellow JS!",
  function (id) {
    console.log(id, this);
  },
  "offset:10 10 10 90"
);
// 实例2
dialog.auto(
  "Hellow JS!",
  function (id) {
    console.log(id, this);
  },
  "offset: 0 0 0 0"
);
// 实例3
dialog.tips('show text', 3, {
 	target: '目标DOM',
  	positon: 'left,top,bottom,right' //#显示规则, 优先级
})
//关联窗口, 代码后续更新
dialog.auto({
    mode: '{{ap}}+.confirm-cancel.close[:onclick="close"]{×}',
    data: {
        ap: 1
    },
    events: {
        close() {
            this._dialog.remove();
        }
    }
}, {
    cs: 'offset:2 2 50 2;animate : true -=24 +=24;',
    last() {
        this.addClass('ios simply');
    },
    position: '[left,right,bottom,top]'.on()
}).link = dialog.notice({
    nodeType: 1,
    mode: '(({{ap}}+{-{month}}+.close{x}))',
    data: {
        ap: '10',
        month: 10
    }
}, 7, '[top,bottom,center] [left,right,center]'.on());
```

# dialog

![图片1](https://alwbg.github.io/static/0.jpeg)
![图片2](https://alwbg.github.io/static/1.png)
![图片3](https://alwbg.github.io/static/2.png)
