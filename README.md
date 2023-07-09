# **Dialog**.js

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
```

## **Query**

### 查找 **DOM** 对象并执行相关操作
#### :: **HTML**相关用例
```html
<div class="windows">
  <div>
    <div class="selector">...</div>
  </div>

  <div class="selector">...</div>
</div>
```
### **实例**
```javascript
var Query = dialog.query(".selector", ".windows");
// stop, animate
Query.stop(true, true).animate({
  height: "+=100",
});
// 查询.windows下的.selector的所有dom 并执行动画,执行内容:高度增量100,在自有的高度增加100
```

### 通过**伪css**语法生成**Query**实例
```javascript
var Query = dialog.query('div.selector[title="title"]{这里是内容}', true);

// 创建Query对象
Query{
  0: HTMLDivElement{ /* 这里是DOM对象 */
    class: '.selector',
    attributes: {
      title: 'title'
    },
    innerHTML: '这里是内容'
  },
  ...
}

```

---

## **Each** 的用法

```javascript
dialog.each({ a: 1, b: 2 }, (k, v) => {
  console.log(k, v);
});
// 输出:
// a 1
// b 2
dialog.each([1, 2], (k, v) => {
  console.log(k, v);
});
// 输出:
// 0 1
// 1 2
```

---

## **Picker** 的用法

### :: 用法一

```javascript
// 别名输出
var data = dialog.picker(
  {
    a: {
      b: {
        c: "d",
      },
    },
  },
  "a.b.c=>abc,e"
);
// data输出 {abc: 'd'} data.e = undefined 不包含e
```

### :: 用法二

```javascript
// 模糊输出 *=>*
var data = dialog.picker(
  {
    a: {
      b: {
        c: "d",
        e: "e",
      },
    },
  },
  "a.b.*=>*"
);
// data输出 {c: 'd', e: 'e'}
```

### :: 用法三

```javascript
// 多查询"|", 优先级和顺序相关[1|2|3]
var data = dialog.picker(
  {
    a: {
      b: {
        c: "d",
        e: "e",
      },
    },
    c: 3,
  },
  "a.b.c|c=>c"
);
// data输出 {c: 'd'}
```

---

## **Tips**

```javascript
// 实例
dialog.tips("show text", 3, {
  target: "目标DOM",
  //#显示规则, 优先级,具体显示以显示空间为主,四个方向都显示不了,居中显示
  positon: "left,top,bottom,right", 
});
```

## **Auto** 的用法

### - 写法一

```javascript
dialog.auto(
  "Hellow JS!",
  function (id) {
    console.log(id, this);
  },
  // offset 左 上 右 下
  "offset:10 10 10 90"
);
```

### - 写法二

```javascript
dialog.auto(
  "Hellow JS!",
  function (id) {
    console.log(id, this);
  },
  {
    /* 
    offset
      控制窗口的四个方向的边距
      "offset: 左 上 右 下" 
        取值: 数值|auto
        auto: 根据自身高度或者宽度控制
    inner
      控制容器内部边距
      "inner: 左 上 右 下 中 整体偏移量"
      "inner: 10 10 10 10 .center 10"
    animate
      出场动画 自带满足不了需求时可设置配置或者重写
      可以通过 dialog.push 添加和重写以上参数方法
      dialog.push('auto', 'animate', function( current[, use,...]){} )
    */
    cs: "offset:10 10 10 90;inner: 10 10 10 10 .center 10;animate: true +=50 -=50",
  }
);
```

### - 写法三

```javascript
//关联窗口, 代码后续更新
dialog.auto(
  {
    mode: '{{ap}}+.confirm-cancel.close[:onclick="close"]{×}',
    data: {
      ap: 1,
    },
    events: {
      close() {
        this._dialog.remove();
      },
    },
  },
  {
    cs: "offset:2 2 50 2;animate : true -=24 +=24;",
    last() {
      this.addClass("ios simply");
    },
    position: "[left,right,bottom,top]".on(),
  }
).link = dialog.notice(
  {
    nodeType: 1,
    mode: "(({{ap}}+{-{month}}+.close{x}))",
    data: {
      ap: "10",
      month: 10,
    },
  },
  7,
  "[top,bottom,center] [left,right,center]".on()
);
```

---
## **String**新增方法

```javascript
// '...'.['format', 'on'];
'name: ? age: ? color: ? from: ?'.on('tom', '2', 'blue', 'USA');
// 输出: 'name: tom age: 2 color: blue from: USA'
'name: ? age: ? color: ? from: ?'.on({
  name: 'tom',
  age: '2',
  color: 'blue',
  from: 'USA'
});
// 输出: 'name: tom age: 2 color: blue from: USA'
```

## **截图**

<style>
  .graph{
    /* display: flex */
    background-color: #333333;
    border-radius: 7px;
    overflow: hidden
  }
  img{
    width:calc(100% / 3);
    /* height:apple; */
    margin:0;

  }
</style>
<div class="graph">
<img src="https://alwbg.github.io/static/0.jpeg"/><img src="https://alwbg.github.io/static/1.png"/><img src="https://alwbg.github.io/static/2.png"/>
</div>
<!-- ![图片1](https://alwbg.github.io/static/0.jpeg) -->
<!-- ![图片2](https://alwbg.github.io/static/1.png) -->
<!-- ![图片3](https://alwbg.github.io/static/2.png) -->
