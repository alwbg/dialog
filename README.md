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

## **Merge**

> _merge(args1, args2[,..., true, "mix"])_ <br>
> 合并

### 用法一

> 基本用法 <br> > _merge(args1, args2)_

```javascript
let a = { name: "Joy" };
let b = { name: "Band", age: 10 };
dialog.merge(a, b);
// a : {name: 'Joy', age: 10}
// b : {name: 'Band', age: 10}
```

### 用法二

> 强制覆盖<br> _merge(args1, args2, args3, true)_
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

## **Runer**

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

## **Query**

> 查找 **DOM** 对象并执行相关操作

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

## **Picker**

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

---

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
