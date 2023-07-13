# **Dialog**.js

## [线上示例](https://alwbg.github.io) ☟

> #### Online
>
> _[点击这里带你穿越](https://alwbg.github.io)_
>
> - 多个实例应用融合
>   - 时间
>   - 天气
>   - 弹窗
>   - 单选
>   - 多选
>   - 开关
>   - 时钟
>   - ...

---

## **目录**

- [merge](#merge)
- [query](#query)
- [render](#render)
- [auto](#auto)
- [tips](#tips)
- [each](#each)
- [picker](#picker)
- [runer](#runer)
- [confirm](#confirm)
- [destroy](#destroydialog)

---

> **截图**

<!-- <div class="graph" style="background-color: #333333;border-radius: 7px;overflow: hidden">
<img src="https://alwbg.github.io/static/0.jpeg" style="width:calc(100% / 3);margin:0"/><img src="https://alwbg.github.io/static/1.png" style="width:calc(100% / 3);margin:0"/><img src="https://alwbg.github.io/static/2.png" style="width:calc(100% / 3);margin:0"/>
</div> -->

| ![图片1](https://alwbg.github.io/static/0.jpeg) | ![图片2](https://alwbg.github.io/static/1.png) | ![图片3](https://alwbg.github.io/static/2.png) |
| ----------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |

> **注释**

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

## **merge**

> _merge(args1, args2[,..., true, "mix"])_ <br>
> 合并

### 用法一

> 基本用法
>
> _merge(args1, args2)_

```javascript
let a = { name: "Joy" };
let b = { name: "Band", age: 10 };
dialog.merge(a, b);
// a : {name: 'Joy', age: 10}
// b : {name: 'Band', age: 10}
```

### 用法二

> 强制覆盖
>
> _merge(args1, args2, args3, true)_
>
> - _args1_, _args2_ 为接收方<br/>
> - args3 为属性输出方

```javascript
let a = { name: "Joy" };
let b = { name: "Band", age: 10 };
let c = { name: "Juerry" };
// 这里以 c 为模版, 把 c 中的属性强制覆盖到 前面的一个或者多个对象中去
dialog.merge(a, b, c, true);
// a, b为接收方
// a : {name: 'Juerry'}
// b : {name: 'Juerry', age: 10}
// c : {name: 'Juerry'}
```

### 用法三

> 多参数 <br> _merge(args1, args2, args3)_
>
> - _args1_, _args2_ 为接收方
> - args3 为属性输出方

```javascript
let a = { name: "Joy" };
let b = { name: "Band", age: 10 };
dialog.merge(a, b, {
  age: 11,
});
// a, b为接收方
// a : {name: 'Joy', age: 11}
// b : {name: 'Band', age: 10}
```

### 用法四

> _merge(args1, args2[,...], "mix")_
>
> - _末尾参数为 "mix" 时, args1 为接收方, 其他参数均为属性输出方_

```javascript
let a = { name: "Joy" };
let b = { name: "Band" };
let c = { name: "Juerry", age: 10 };
// 参数1, 参数2
dialog.merge(a, b, c, "mix");
// a为接收方 b, c为属性输出方
// a: { name: 'Joy', age: 10 }
// b: { name: 'Band' }
// c: { name: "Juerry", age: 10 }
```

### 用法五

> _merge(args1, args2[,...], true, "mix")_
>
> - true 和 mix 的混合使用 <br>
>   最终属性值取决于最后一次出现的属性

```javascript
let a = { name: "Joy" };
let b = { name: "Band" };
let c = { name: "Juerry", age: 11 };
dialog.merge(a, b, c, true, "mix");
// a为接收方 b, c为属性输出方
// a: {name: 'Juerry', age: 11}
// b: {name: 'Band'}
// c: {name: 'Juerry', age: 11}
```

## **runer**

用法一

> 已知方法

```javascript
var app = {
  fx: function (c) {
    return (this.a + this.b + c) >> 0;
  },
};
var result = dialog.runer(
  app.fx,
  {
    a: 1,
    b: 2,
  },
  6
);
// result: 9
```

用法二

> 调用未知方法
>
> - app.fx 如果存在且为 _Function_ 则执行, 否则返回 undefined
> - dialog.picker [参见这里](#picker)

```javascript
var result = dialog.runer(dialog.picker(window, "app.fx=>exec").exec, {
  a: 1,
  b: 2,
});
// result: undefined
```

## **query**

> 查找 **DOM** 对象并执行相关操作
>
> 以下没有声明 _query_ 的视为 _dialog.query('.windows')_ 的简写

### _**on**('eventName', handle)_

```javascript
// 事件绑定
query.on("click", (e) => {});
```

### _**html**([element|stringHtml]?)_

```javascript
// 设置
query.html("设置内容!");
// 设置
query.html("<span>设置内容!</span>");
// 获取
var html = query.html();
```

### _**next**()_

> _获取所对应的下一个 element_

```javascript
var next = query.next();
```

### _**prev()**_

> _获取所对应的上一个 element_

```javascript
var prev = query.prev();
```

### _**first()**_

> _获取第一个 element_

```javascript
var first = query.first();
```

### _**unbind(handle?)**_

> _解绑事件_ [参见 off](#off)

```javascript
// 清楚全部
query.unbind();
// 清楚click
query.unbind("click");
// 清楚单个
query.unbind(() => {});
```

### _**is(selector?)**_

> _获取所对应的 element_
>
> - 返回值: Boolean

```javascript
var _isSpan = query.is("span");
```

### _**appendTo([Element|selector])**_

> _将目标元素当做子类添加到指定的容器中_

```javascript
var next = query.appendTo("body");
```

### _**append()**_

> _给目标元素增加子类_
>
> append([Element|selector|StringHtml])

- 如果参数不含有"...\<tag>..."则视为在当前 document 下查询相关节点后, 添加到目标元素中<br>
  ```javascript
  query.append(".window");
  ```
  查找.windows 的所有元素,将结果追加到 body 下
- 如果参数为"...\<tag>..."结构
  ```javascript
  query.append("<span>inner</span>");
  ```
  为 body 添加子节点\<span\>inner\</span>

### _**insert(**)_

> 把目标对象添加到指定位置
>
> - query.insert('.windows'[, true|false])
> - true 目标对象后面, false 和默认不填是添加之前

```javascript
let query = dialog.query("<div>new</div>");
query.insert(".windows", true /* 目标对象被添加到第一个参数对应的DOM后面 */);
```

### _**stop()**_

> stop(isStopAll, isToEnd);
>
> - isStopAll 是否停止所有动画
> - isToEnd 是否执行完成设置样式

```javascript
query.stop(true, false);
```

### _**attr()**_

> - attr(attributes);
> - attr(attribute, val);

```javascript
/* 获取 */
query.attr("offsetHeight");
// {offsetHeight: 835}
query.attr("offsetHeight=>h,offsetWidth=>w");
// {h: 835, w: 510}

/* 设置 */
query.attr({
  "data-name": "jerry",
  "data-age": "12",
});
```

### _**css()**_

> - css(attributes);
> - css(attribute, val);
> - css(multistringattribute, 'number');

```javascript
/*** 设置 ***/
// 单个属性
query.css("height", 300);
// 多个属性
query.css({
  height: "+=200",
  width: "-=100",
});
/***获取数值 ***/
query.css("height,width", "number");
// {height: 500, width: 490}
query.css("height=>h,width=>w", "number");
// {h: 500, w: 490}
query.css("height=>h,width=>w");
// {h: '500px', w: '490px'}
query.css("line-height|height=>h,width=>w");
// {h: 'normal', w: '490px'}
query.css("line-height|height=>h,width=>w", "number");
// {w: 490}
```

### _**find()**_

> find(_selectors_);
>
> - selectors: 多个 className 之间用逗号 [,] 分隔

```javascript
var items = query.find(".selector");
```

### _**addClass()**_

> addClass('className1 className2 className...');
>
> - 多个 className 之间用空格分隔

```javascript
query.addClass("className1 className2");
```

### _**removeClass()**_

> removeClass('className1 className2 className...');
>
> - 多个 className 之间用空格分隔

```javascript
query.removeClass("className1 className2");
```

### _**remove()**_

> 删除目标 Dom

```javascript
query.remove();
```

### _**data()**_

```javascript
// 这里设置属性
query.attr({ "e-a": 1, "e-d": 3 });

/* 这里获取的是所有的以 e-开头的所有属性 */
query.data(null, "e");
// {dialog: '20160590', a: '1', d: '3'}

/* 获取 data-* 属性 等价于 query.data(null, "data"); */
query.data();
```

### _**animate()**_

> 执行动画
>
> - 0=>attributes,
> - 1.speed|1=>speed,
> - 1.easing=>easing,
> - callback|2=>callback
>
> [参见 picker](#picker)
>
> 这里的 0, 1, 2 为 animate(args0, args1, args2)参数索引

```javascript
query.stop(true, true).animate({
  height: "+=100",
});
// 执行动画,执行内容:高度增量100,在自有的高度增加100
```

### _**trigger()**_

> 触发事件

```javascript
query.trigger("click");
```

### _**val()**_

> 获取 _input_ 的值

```javascript
/* 设置input|textarea的属性 value值 */
query.val("123");
/* 获取input|textarea的属性 value值 */
query.val();
```

### _**off()**_

> 解绑事件
>
> - query.off(String|Function)

```javascript
query.off("click");
query.off();
```

### _**hide()**_

> 隐藏目标对象

```javascript
query.hide();
```

### _**show()**_

> 显示目标对象

```javascript
query.show();
```

### **事件**

- [events]
  - [resize, click, focus, blur, change, scroll, load, hashchange, error]
  - /_PC 端相关_/
    - [mousedown, mouseenter, mouseleave, mousemove, mouseout, mouseover, mouseup, mousewheel, keydown, keypress, keyup]
  - /_移动端相关_/
    - [touchcancel, touchend, touchmove, touchstart]
  - /_html5 相关_/
    - [animationend, animationiteration, animationstart]

```javascript
query["eventname"](() => {
  // 处理逻辑
});
// 相当于
query.on("eventname", () => {
  // 处理逻辑
});
query.off("eventname");
```

---

#### :: **HTML**相关用例

```html
<div class="windows">
  <div>
    <div class="selector">...</div>
  </div>

  <div class="selector">...</div>
</div>
```

> **实例**

```javascript
var Query = dialog.query(".selector", ".windows");
// stop, animate
Query.stop(true, true).animate({
  height: "+=100",
});
// 查询.windows下的.selector的所有dom 并执行动画,执行内容:高度增量100,在自有的高度增加100
```

> 通过**伪 css**语法生成**Query**实例

```javascript
var Query = dialog.query('div.selector[title="title"]{这里是内容}', true);

// 创建Query对象
Query{
  0: HTMLDivElement{ /* 这里是DOM对象 */
    class: 'selector',
    attributes: {
      title: 'title'
    },
    innerHTML: '这里是内容'
  },
  ...
}

```

## **each**

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

## **picker**

> :: 用法一

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

> :: 用法二

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

> :: 用法三

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

## **tips**

> 提示

```javascript
// 实例
dialog.tips("show text", 3, {
  target: "目标DOM",
  //#显示规则, 优先级,具体显示以显示空间为主,四个方向都显示不了,居中显示
  positon: "left,top,bottom,right",
});
```

## **notice**

> 提示, 色彩区分 [参见 tips](#tips)

```javascript
// 实例
dialog.notice("show text", 3, {
  target: "目标DOM",
  //#显示规则, 优先级,具体显示以显示空间为主,四个方向都显示不了,居中显示
  positon: "left,top,bottom,right",
});
```

## **error**

> 错误, 色彩区分 [参见 tips](#tips)

```javascript
// 实例
dialog.error("show text", 3, {
  target: "目标DOM",
  //#显示规则, 优先级,具体显示以显示空间为主,四个方向都显示不了,居中显示
  positon: "left,top,bottom,right",
});
```

## **auto**

> > _[参见 dialog.render ](#render)_ <pre>已集成 dialog.render </pre>
>
> - ### _last_ {_Function_}
> - ### _cs_ {_String_} 配置
>   - #### offset
>     > #### 控制窗口的四个方向的边距
>     - 书写规则
>        <pre>"offset: 左 上 右 下"</pre>
>     - 取值
>       <pre>offset: [数值|auto] [数值|auto] [数值|auto] [数值|auto]</pre>
>       <pre>auto: 根据自身高度或者宽度控制</pre>
>   - #### inner
>     > #### 控制容器内部边距
>     - 书写规则
>       <pre>"inner: 左 上 右 下 中 整体偏移量"</pre>
>     - 取值
>       <pre>"inner: 10 10 10 10 .center 10"</pre>
>   - #### animate
>     > #### 出场动画 自带满足不了需求时可设置配置或者重写
>     - 覆盖
>       <pre>可以通过 dialog.push 添加和重写以上参数方法</pre>
>     - 替换
>        <pre>dialog.push('auto', 'animate', function( current[, use,...]){} )</pre>
>   - center
> - ### _destroy_
>   - 窗口销毁是执行的动画配置(非必要参数)
>     > <pre>destroy: {css: {top: '+=30px', opacity: 0}, speed: 400}</pre>
> - ### _center_
> - ### _end_
> - ### position
>   ```javascript
>    /**
>    * positon是设置窗口出现的位置
>    * - left right 和 top bottom 和 center两两组合不分顺序
>    * - 但是入场动画和第一个出现的位置相关 center除外
>    **/
>    position: "right center",
>   ```
>   ***

```javascript
dialog.auto(
  {
    mode: '{{count}}+.confirm-cancel.close[:onclick="close"]{×}',
    data: {
      count: 1,
    },
    events: {
      close() {
        this._dialog.remove();
      },
    },
  },
  {
    last() {
      console.log(this);
    },
    cs: "offset:10 10 10 90;inner: 10 10 10 10 .center 10;animate: true +=50 -=50",
  }
);
```

> - 写法一

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

> - 写法二

```javascript
dialog.auto(
  "Hellow JS!",
  function (id) {
    console.log(id, this);
  },
  {
    cs: "offset:10 10 10 90;inner: 10 10 10 10 .center 10;animate: true +=50 -=50",
  }
);
```

> - 写法三

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

## **confirm**

> 模式窗口
>
> ```javascript
> dialog.confirm(title, content, back, position);
> ```
>
> [参见 auto](#auto)

```javascript
dialog.confirm(
  "提示!",
  '(({这里是}+[data-text="内容"]+{~~}))'.buildHtml(),
  () => {
    // 这里写窗口内的所需验证的逻辑
    // ...
    /* 当返回 为 true时窗口关闭 */
    return true;
  },
  {
    /**
     * positon是设置窗口出现的位置
     * - left right 和 top bottom 和 center两两组合不分顺序
     * - 但是入场动画和第一个出现的位置相关
     **/
    position: "right center",
  }
);
```

## **destroy**(Dialog)

> 销毁创建的窗口对象
>
> - 这个参数为 dialog[auto|tips|notice|error|confirm,...]返回值

```javascript
var tips = dialog.tips("ok!", 3);
dialog.destroy(tips);
```

## **String** 新增方法

> on 的基本用法
>
> - _'{attr}'.\[ 'format', 'on' \]( args1 );_
> - _'? ? ? ? '.\[ 'format', 'on' \]( args1, args2, ... );_

```javascript
"name: ? age: ? color: ? from: ?".on("tom", "2", "blue", "小漂亮国");
// 输出: 'name: tom age: 2 color: blue from: 小漂亮国'
```

```javascript
"name: ? age: ? color: ? from: ?".on("未知");
// 输出: 'name: 未知 age: 未知 color: 未知 from: 未知'
```

```javascript
"{name} 是个男孩.".on({ name: "小明" });
// '小明是个男孩.'
```

```javascript
"name: ? age: ? color: ? from: ?".on({
  name: "tom",
  age: "2",
  color: "blue",
  from: "小漂亮国",
});
// 输出: 'name: tom age: 2 color: blue from: 小漂亮国'
```

> **on** 中的随机用法

```javascript
// '...'.['format', 'on'];
"[red,green,blue,yellow]".on();
// 随机输出: 'green'
```

> **on** 中的 _三元运算_ 用法 _{expr,true,false}_

```javascript
"{name,name,age}".on({
  name: "",
  age: 1,
});
// 输出: 1
```

```javascript
"{name>2,+name + 2, +age - 1}".on({
  name: "3",
  age: 1,
});
// '5'
```

```javascript
"{name>2,+name + 2, +age - 1}".on({
  name: "2",
  age: 1,
});
// '0'
```

> **on** 中的 _区间随机_ 用法

```javascript
"{99-999}".on();
// 随机输出: '610'
```

```javascript
"{100-999}-{100-999}-{100-999}-{100-999}".on();
// 输出: '298-768-285-212'
```

> **on** 中的 _属性_ 用法

```javascript
"{now}".on();
// 输出: 当前毫秒值
```

```javascript
"{fx} is in!".on({
  fx: () => {
    return "string";
  },
});
// 'string is in!'
"{fx} is in!".on({
  fx: "string",
});
// 'string is in!'
```

> **_buildHtml_** 的用法

```javascript
`div.selector[title="title"]{内容}>.inner{子节点}`.buildHtml();
```

> ### **输出结果**

```html
<div class="selector" title="title">
  内容
  <span class="inner"> 子节点 </span>
</div>
```

## **Render**

> - 源码待上传 _[参见线上实例 ](#online)_
> - ...

```javascript
dialog.render('{{show}}+.confirm-cancel.close[:onclick="close"]{×}', {
  data: {
    show: 1,
  },
  events: {
    close() {
      this._dialog.remove();
    },
  },
});
```

> 相关截图

| ![render.code.1.jpg](https://alwbg.github.io/static/render.code.1.jpg) | ![render.code.2.jpg](https://alwbg.github.io/static/render.code.2.jpg) |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |

> **待续**
