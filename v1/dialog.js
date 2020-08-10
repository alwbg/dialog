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
 * 新增 -dialog.query(selector)[css, attr, find, each, ...];
 * 	-dialog.addClass(target, class)
 * 	-dialog.removeClass(target, class)
 * 	-dialog.css(target, class[, val])
 * 	-dialog.attr(target, prop[, val])
 * 	-dialog.html(target[, html])
 * 	-dialog.is(selector, target)
 * 	-dialog.within(selector, target)
 * creation-time : 2020-08-09 14:46:09 PM
 */
; (function (global, factory) {
	global['global'] = global;
	if (typeof exports === 'object') {
		// factory( require, exports, module );
	} else if (typeof define === 'function') {
		//AMD CMD
		define('dialog', factory);
	} else {
		var funcName = 'require';
		if (funcName && !global[funcName]) {
			global[funcName] = function (id) {
				return global[id];
			};
		};
		var Mo = { exports: {} };
		factory(global[funcName] || function (id) {
			alert('需要实现 require(),加载模块:"' + id + '"');
		}, Mo.exports, Mo);
		global['dialog'] = Mo.exports;
	}
}(this, function (require, exports, module) {
	var Nil;
	var ID = 20160516;
	var DialogCount = 0;
	var ddoc = document.documentElement;
	var isNotFixed = /ie\s*(6|5)/ig.test(navigator.userAgent);
	
	var QUERY_ID = ID;

	var r_ANYTHING = /\[object\s(\w+)\]/;
	// 提取属性时, 如果多个属性名 'height;line-height=>h'  'height|line-height=>h'
	// var R_S_MORE = /;|\|/;
	var r_MULIT_SPLIT_SEP = /\s*[;|]\s*/;

	var r_SPLIT_KV = /\s*:\s*/;
	var r_A_Z = /((\d+)\-(\d+))/;

	var r_S_SEL = /(?:\,|\|{2})/;
	var r_S_KV = /\=\>/;

	var r_CSS2JS = /-([a-z])/g;
	var r_JS2CSS = /([A-Z])/g;
	var r_NUMBER_VALUE = /(height|width|top|left|bottom|right|size|radius|padding|margin)(?:\=|$)/i/*数值属性*/

	var r_SET_VALUE_OFFSET = /^\s*([\+\-\*\/])=(\d+)\w*/;
	var r_IsNotCenter = /(?:^|;\s*)center\s*:\s*false/;
	var r_IsNumber = /^\d+(?:\.\d+)?$/;

	var SPACE = '';
	var DOT = '.';
	var S_PX = 'px';
	var S_$1 = '-$1';
	var $1 = '$1';
	
	var EVENT_KEY = 'e-dialog';
	var s_DATA = 'data';
	var s_AUTO = 'auto';
	var TAG_NAME = 'div';
	var s_AUTO_KEY = 'auto';
	var s_NUMBER = 'number';
	var s_HOVER_HAND = 'hover-show-hand';

	var s_OFFSETWIDTH = 'offsetWidth';
	var s_OFFSETHEIGHT = 'offsetHeight';
	var s_SCROLLHEIGHT = 'scrollHeight'

	var s_AUTOATTRS = 'inner: 0 0 0 0 .confirm-content 60;';

	var s_NODELIST = '[object NodeList]';
	/* 兼容IE事件属性 */
	var ePickLine = 'target;srcElement=>target';

	var ALL = '*';

	var PICK_PADDING_4_CSS = 'paddingLeft|padding-left=>l,paddingTop|padding-top=>t,paddingRight|padding-right=>r,paddingBottom|padding-bottom=>b';

	var F_List = ["getAttribute", "setAttribute"];
	var aQuerySimplyOrMulti = ['querySelector', 'querySelectorAll'];
	var aIOrV = ['innerHTML', 'value'];

	//var isBlur      	= /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*(?:7|8|9|10)|webkit)/i.test( navigator.userAgent );

	var isIE  = /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*)/i.test( navigator.userAgent );
	var fixed = isNotFixed ? 'absolute' : 'fixed';

	// 配置
	var iUserEventMap = {};
	var Dialogs = {};
	var OBJECT_EMPTY = {};
	var DialogsRanks = [];
	//对象原型
	var EMPTY_ARRAY = [];

	var EMPTY_ARRAY_SLICE = EMPTY_ARRAY.slice;
	// 不含有bind的扩展
	if (!Function.prototype.bind) {
		Function.prototype.bind = function() {
			var bindFx = this;
			// fun.bind.call(!Func)
			if (!(bindFx instanceof Function)) throw 'This is not a Function!';
			var args = iList2Array(arguments);
			var host = args.shift();
			return function() {
				var argument = iList2Array(arguments);
				Array.prototype.unshift.apply(argument, args);
				return bindFx.apply(host, argument);
			}
		};
	}
	/**
	 * 获取字符串类型
	 * @param  {object}   object 
	 * @return {String}          
	 */
	function iTypeTo(object) {
		return OBJECT_EMPTY.toString.call(object);
	}
	var sObject = iTypeTo(OBJECT_EMPTY); //'[object Object]';
	var sString = iTypeTo(SPACE); //'[object String]';
	var sWindow = iTypeTo(window);

	function iCreateElement(tagName) {
		return document.createElement(tagName || TAG_NAME);
	}

	var isString = function (o) {
		return iTypeTo(o) == sString;
	}

	var isNodeList = function (nl) {
		return iTypeTo(nl) == s_NODELIST || (nl instanceof Array);
	}
	/* 判断是否 */
	function iContent4Element(tagName) {
		return aIOrV[+/input/i.test(tagName)]
	}
	/**
	 * 转换数组
	 * @param {Object} args 
	 */
	function iList2Array(args) {
		return Array.apply(Nil, args);
	}
	// 处理数值
	var pickTypeFxs = {
		number: function (v) {
			return parseFloat(v);
		},
		float: function (v) {
			return parseFloat(v);
		},
		int: function (v) {
			return parseInt(v);
		}
	}
	// 计算显示位置
	var iPosition = {
		CENTER: 'center',
		rWidth: /top|bottom/,
		// 计算方向
		aLT: ['left', 'top'],
		// 获取计算属性
		aWH: ['width', 'height'],
		// 获取配置方向所需
		rPosition: /(?:(center)|(left|top|right|bottom))/g,
		css: function (css, room, own, isWidth, position) {
			position = this.aWH[isWidth];
			css[this.aLT[isWidth]] = (room[position] - own[position]) / 2;
		},
		trigger: function (position, own, room) {
			var center = this.CENTER;
			position || (position = center);
			room || (room = {});
			var css = {},
				isWidth, other,
				rWidth = this.rWidth, sim;
			var positions = position.match(this.rPosition);

			for (var i = 0, length = positions.length; i < length; i++) {
				sim = positions[i];
				if (sim != center) {
					css[sim] = 0;
				} else {
					// 获取另一个位置position
					other = positions[(i + 1) % length];
					isWidth = +!rWidth.test(other);
					this.css(css, room, own, isWidth);
					// 如果为center时 计算相对值
					if (other == sim) {
						this.css(css, room, own, +!isWidth);
					}
				}
			}
			return css;
		}
	};
	// 选择器转换HTML
	var iSelector2Html = {
		WHITE: ' ',
		ID: '#',
		QUTO: '"',
		ATTR: '[',
		INNER: '{',
		CHILD: '>',
		CLAZZ: '.',
		SIBLING: '+',
		BLOCK: '(',
		BLOCKEND: ')',
		INNEREND: '}',
		ESCAPE: '\\',
		aMode: ['<tag#.[>#*i*#</tag>', '<tag#.[/>'],
		rVal: /^\s*(.*)$/,
		// ((text|selector)) ((|selector)) ((selector))
		rPar: /\({2}(?:((?:(?!\({2}|\|).)+)\|)?((?:(?!\({2}).)+)\){2}/g,
		rSimply: /^(?:img|link|input|meta|br|hr|area)$/,
		_default: {
			'#': [/#/, SPACE, ' id="$1"'],
			'.': [/\./, SPACE, ' class="$1"'],
			'[': [/\[/, SPACE, ' $1'],
			'tag': [/tag/g, 'span', $1],
			'{': [/#\*i\*#/g, SPACE, $1]
		},
		INDEXS: ['tag', '.', '#', '[', '{'],
		factory: function () {
			return {
				'tag': [],
				'.': [],
				'#': [],
				'[': [],
				'{': []
			}
		},
		toHtml: function (str, inner) {
			return this.build(this.xcode(str, 0, inner).parent);
		},
		build: function (Keys) {
			var val, sdefault;
			var hMode = this.aMode[+this.rSimply.test(Keys.tag.join(SPACE))];
			var key, _default = this._default;
			var ins = this.INDEXS,
				mark = 0;
			for (var index = 0, length = ins.length; index < length; index++) {
				key = ins[index];
				val = Keys[key].join(SPACE);
				if (!mark && length - index == 1) {
					hMode = val;
				} else {
					sdefault = _default[key];
					hMode = hMode.replace(sdefault[0], val ? val.replace(this.rVal, sdefault[2]) : sdefault[1]);
				}
				mark += +!!val;
			}
			return hMode;
		},
		xcode: function (source, start, inner, parent) {
			var sim, key, isClz;
			var data = this.factory();
			var quto = 0,
				_break;

			var ID = this.ID;
			var ATTR = this.ATTR;
			var INNER = this.INNER;
			var CLAZZ = this.CLAZZ;
			var CHILD = this.CHILD;
			var SIBLING = this.SIBLING;
			var INNEREND = this.INNEREND;

			var BEND = this.BLOCKEND;
			var BLOCK = this.BLOCK;

			var QUTO = this.QUTO;

			var inInnerMark = 0;
			var isInnerText = false;

			var _inner = data[INNER];

			var picker, index = start,
				length = source.length;
			for (; index < length; index++) {
				if (_break) {
					// Jump This Layer(我去我都开始写英文注释了)
					index--;
					_break = false;
					break
				}
				sim = source[index];

				inInnerMark += (+(INNEREND == sim) * -1 || +(INNER == sim));
				key = key || 'tag';
				picker = data[key];
				// iExecSimply "{}"之前的是的含有转义字符
				if (source[index - 1] == this.ESCAPE) {
					picker.pop();
					picker.push(sim);
					continue;
				}
				if (sim == QUTO && !inInnerMark) {
					quto++;
					picker.push(sim);
					continue;
				}
				isInnerText && (inInnerMark == 0) && (isInnerText = false);
				// 判断是否字符串内
				if (quto % 2 || isInnerText) {
					picker.push(sim);
					continue;
				}
				if (isClz === false) picker.push(this.WHITE);
				switch (sim) {
					case INNEREND:
					// inInnerMark--;
					case ']':
						break;
					case CLAZZ /*.*/:
						isClz = false;
					case ID /*#*/:
					case ATTR /*[*/:
					case INNER /*{*/:
						sim == INNER && (isInnerText = true);
						key = sim;
						break;
					case CHILD:
					case SIBLING:
					case BLOCK:
					case BEND:
						// 判断跳出条件
						if (_break = (sim != CHILD && CHILD == parent) || (sim == BEND && index++) /*Is Block End, Index Plus*/) {
							break;
						}
						start = index + 1;
						var da = this.xcode(source, start, Nil, CHILD /*标记当前为子类*/);
						_inner.push(this.build(da.parent));
						// 判断当前是否为 > 
						if (sim == CHILD && CHILD == parent) {
							parent = Nil;
						}
						index = da.index - 1;
						break;
					default:
						isClz = true;
						picker.push(sim);
				}
			}
			if (inner != Nil) {
				_inner.push(inner);
			}
			return {
				index: index,
				parent: data
			}
		}
	}

	function selector2Html(selector) {
		return iSelector2Html.toHtml(selector)
	}

	var rMapKey = {};
	/**
	* 获取指定前缀的属性值
	* @param  {Object} target    DOM或者JSON
	* @param  {String} prefix    字符串或者字符串正则
	* @param  {Boolean} hasprefix true|false
	* @return {JSON}           按需输出
	*/
	function iAttrs(target, key, prefix, hasprefix) {
		var attrs;
		prefix || (prefix = s_DATA);
		var execz = hasprefix != true ? function (x) {
			return prefixReg.test(x), css2js(RegExp.$1);
		} : function (x) {
			return x;
		}
		if (prefix == s_DATA && target.dataset) {
			attrs = target.dataset;
		} else {
			var prefixReg = rMapKey[prefix] || (rMapKey[prefix] = prefix ? new RegExp('^' + prefix + '-(.+)', 'i') : /.*/);
			attrs = target.attributes;
			var json = {}, v;
			for (var index in attrs) {
				if (Object.hasOwnProperty.call(attrs, index)) {
					v = attrs[index];
					if (prefixReg.test(v.name)) {
						json[execz(v.name)] = v.value;
					}
				}
			}
			attrs = json;
		}
		return picker(attrs, css2js(key || ALL));
	}
	/**
	 * 设置 和 获取 Node 属性
	 * @param {Node} target 
	 * @param {String} key 
	 * @param {Object} val 
	 */
	function iSetGetAttr(target, key, val) {
		var isGet = isNil(val);
		var fname = F_List[+!isGet];
		var isNode = target[fname];
		if (isGet) {
			var data = (isNode && target[fname](key)) || target[key];
			return isNil(data) ? null : data;
		};
		isNode && isNil(target[key]) ? target[fname](key, val) : (target[key] = val);
	}
	// 获取对象属性值
	function iAttr(target, key, val) {
		var ranks;
		if (isString(key)) {
			if (isNil(val)) return iSetGetAttr(target, key);
			ranks = {};
			ranks[key] = val;
		} else {
			ranks = key;
		}
		each(ranks, function (k, v, target, attr) {
			attr(target, k, v);
		}, target, iSetGetAttr);
	}
	/**
	 * @see css2js
	 * @see r_CSS2JS
	 * @param {String} source 源
	 * @param {String} $1 匹配的正则内的(xx)
	 * @param {Int} index 开始索引
	 */
	function iFxInnerReplace(source, $1, index) {
		return $1.toUpperCase();
	}
	/**
	 * css格式输出JS格式
	 * @param  {String} css data-name-show
	 * @return {String} js dataNameShow
	 */
	function css2js(css) {
		return css.replace(r_CSS2JS, iFxInnerReplace);
	}

	function js2css(css) {
		return css.replace(r_JS2CSS, S_$1).toLowerCase();
	}
	/* 单个对象设置 */
	function iSetStyle(target, key, value, suffix) {
		if (target.nodeType == 1) {
			if (r_CSS2JS.test(key)) key = css2js(key);
			if (r_NUMBER_VALUE.test(key)) {
				if (r_SET_VALUE_OFFSET.test(value)) {
					value = iRuner(mOffsetFuncMap[RegExp.$1], Nil, RegExp.$2, _style(target, key, s_NUMBER)[key] >> 0);
				}
				if (r_IsNumber.test(value)) value = value + (suffix || S_PX);
			}
			target.style[key] = value;
		}
	}
	/* 设置 获取 指定样式 */
	function iCssGetSet(styleName, v, target) {
		if (isString(styleName)) {
			return isNil(v) || (r_NUMBER_VALUE.test(styleName) && v == s_NUMBER)
				?
				/* 获取 */
				(
					v = isSimplyData(_style(target, styleName, v), styleName), 
					isNil(v) ? null : v
				)
				:
				/* 设置属性 */
				iSetStyle(target, styleName, v);
		} else {
			each(styleName, function (styleName, v, target, suffix) {
				iSetStyle(target, styleName, v, suffix);
			}, target, v)
		}
	}
	function iCss(target, keys, valueOrSuffix) {
		return iCssGetSet(keys, valueOrSuffix, target);
	}
	/**
	 * 实现继承扩展 merge( O1, O2, O3[,...], data# 要扩展数据 #, cover# 是否覆盖添加 # )
	 */
	function merge(s, o, e, i) {
		var key, cover, data, source, args;
		/* 格式化参数 */
		args = EMPTY_ARRAY_SLICE.call(arguments);
		/*获取最后一位*/
		cover = args.pop();
		/* 归位 */
		args.push(cover);
		/*是否是boolean类型*/
		if (!/false|true/ig.test(cover)) {
			//默认不替换
			args.push(false);
		}
		cover = args.pop();
		data = args.pop();
		while (source = args.shift()) {
			for (key in data) {
				if (cover || !(source.hasOwnProperty && source.hasOwnProperty(key))) {
					source[key] = data[key];
				}
			}
		}
	};
	/**
	 * 执行方法列队(走私)
	 * @param  {Array} rank    要执行的列表
	 * @param  {Object} context 执行上下文
	 */
	function iRuner(rank, context) {
		if (isNil(rank)) return Nil;
		var args = iList2Array(arguments);
		rank = args.shift();
		context = args.shift();
		var isArray = rank instanceof Array,
			msg;
		if (!isArray) {
			rank = [rank];
		}
		for (var r = 0, rl = rank.length; r < rl; r++) {
			if (rank[r] instanceof Function) {
				msg = rank[r].apply(context, args);
				if (msg !== Nil) return msg;
			}
		}
	}
	// 获取指定对象的值
	function pickVarLine(varline, local) {
		var data = local[varline];
		var vs, box, head = varline;
		if (!data) {
			var rank = varline.split(DOT);
			var first = head = rank[0];
			if (first in local) box = local; // 先确认入口, 是模板对象还是全局对象
			else box = global;
			var i = 0,
				l = rank.length;
			for (; i < l; i++) {
				if (vs = box[rank[i]]) {
					if (i != l - 1) box = vs; // 存储链式对象上线文
					continue;
				}
			}
		} else {
			vs = data;
			box = null;
		}
		data = {
			head: head,
			data: vs,
			parent: box // 获取上层对象
		}; // 缓存数据关联
		return data;
	}
	function between(a, z, callback) {
		if (isString(a)) {
			if (a.search(r_A_Z) >= 0) {
				a = RegExp.$2;
				z = RegExp.$3;
			}
		}
		var min, max;
		if (+a < +z) {
			min = +a;
			max = +z;
		} else {
			min = +z;
			max = +a;
		}
		var lof = (max - min) + 1;

		while (lof--) {
			iRuner(callback, null, min + lof, max, min);
		}
		// return val;
	}
	function giveUHtmlBySelector(selector) {
		return selector.replace(iSelector2Html.rPar, function (source, inner, selector) {
			return iSelector2Html.toHtml(selector, inner);
		})
	}
	/**
	 * 循环
	 * @Time   2019-11-07
	 * @param  {Number}   key    索引
	 * @param  {Object}   simply 对象
	 * @param  {Array}   rule   规则
	 * @param  {Array}   picker 携带筛选后的对象列表
	 * @param  {Function}   _    @see each        
	 */
	function pickByRule(key, simply, rule, picker, _, type, filter) {
		var rain = {};
		// 遍历规则
		_(rule, function (keys, value, data, val, _, type, filter) {
			// 获取输出key (key1;key2)=>key
			value = value.split(r_S_KV);
			// [key1,key2]
			keys = value[0].split(r_MULIT_SPLIT_SEP);
			// 遍历keys列表
			_(keys, function (k, v, val, pi, data, type, filter) {
				k = val[v];
				// 按照顺序获取直到找到存在的对应key
				if (!isNil(k)) {
					var fc, rData;
					if (type && (fc = pickTypeFxs[type])) {
						k = fc(k);
					}
					rData = iRuner(filter, Nil, pi || v, k);
					data[pi || v] = isNil(rData) ? k : rData;
					return true;
				}
			}, val, value[1], data, type, filter);

		}, rain, simply, _, type, filter);
		// 添加
		picker.push(rain);
	}

	function picktype(O) {
		return iTypeTo(O).replace(r_ANYTHING, $1);
	}
	// 
	var OBJECT = picktype(OBJECT_EMPTY);

	/**
	 * 判断是否为空
	 * @Time   2019-07-17
	 * @param  {Object}   val 要鉴别的对象
	 * @return {Boolean}      返回
	 */
	function isNil(val) {
		return val === Nil;
	}
	function isFunction(fn) {
		return fn instanceof Function;
	}
	// 遍历Set Map
	function MS(source, fn, args) {
		isFunction(fn) || (fn = function () { });
		source.forEach(function (v, k) {
			fn.call(this, k, v);
		}, this);
	}
	var EACH = {
		'changeWay': function (key, args, source, cb) {
			args[0] = key; /*设置KEY*/
			args[1] = source[key]; /*设置对应的*/
			return !isNil(this.ret = cb.apply(this.context, args));
		},
		'Array': function (source, fn, args) {
			for (var key = 0, length = source.length >> 0; key < length; key++) {
				if (EACH.changeWay.call(this, key, args, source, fn)) return this.ret;
			}
		},
		'Object': function (source, fn, args) {
			for (var key in source) {
				if (source.hasOwnProperty && source.hasOwnProperty(key) && EACH.changeWay.call(this, key, args, source, fn)) return this.ret;
			}
		},
		'Set': MS,
		'Map': MS
	}
	// 支持NodeList
	EACH.NodeList = EACH.Array;
	/**
	 * 循环
	 * @Time   2018-11-14
	 */
	function each(source, func, context) {
		if (!isFunction(func)) return;
		//挑选处理方方法
		return (EACH[picktype(source)] || EACH[OBJECT]).call({
			context: context
		}, source, func, iList2Array(arguments));
	}

	var RuleSort = {};
	var RuleSortLength = 0;
	each('offset,inner'.split(r_S_SEL), function (k, v, map) {
		map[v] = k;
		RuleSortLength++;
	}, RuleSort)
	function dialogAutoRules(list, rules) {
		!rules && (rules = []);
		each(list, function (k, val, list, RuleSort,/* 临时变量 */ kv, v, vs, vk) {
			kv = val.split(r_SPLIT_KV);
			vk = kv[0];
			if (!vk) {
				return;
			}
			v = kv[1] || SPACE;
			if ((vs = v.split(/\s+/)).length >= 1) {
				list[k] = {
					name: vk,
					value: vs,
					sort: RuleSort[vk] == Nil ? RuleSortLength : RuleSort[vk]
				}
			}
		}, rules, RuleSort);
		return rules;
	}
	/**
	 * 提取指定属性名称的值
	 * @Time  2018-11-15
	 * @param {Object}   source 源数据
	 * @param {String}   rule   要提取的列表
	 * @param {String}   type   number|int|float
	 * @param {Function}   filter   过滤函数
	 */
	function picker(source, rule, type, filter) {
		if (rule == ALL) return source;
		if (!isString(rule) || isNil(source)) return {};
		var rainbox = [],
			isArray = true;
		source instanceof Array || (source = [source], isArray = false);
		// 遍历队列
		each(source, pickByRule, rule.split(r_S_SEL), rainbox, each, type, filter);
		return isArray ? rainbox : rainbox.pop();
	}
	// 获取样式列表
	var _style = document.defaultView ?
		/**
		 * @param {Node} dom DOM对象
		 * @param {String|Undefined} attr 属性 'height;line-height=>h'
		 **/
		function (dom, attr, type) {
			return picker(dom.nodeType == 1 ? document.defaultView.getComputedStyle(dom, SPACE) : {}, attr || ALL, type);
		} : function (dom, attr, type) {
			return picker(dom.currentStyle, attr || ALL, type);
		}

	function Query(sel, context) {
		if (sel instanceof Query) return sel;
		if (!isNaN(+sel)) return this;
		var selector = new Selector(sel, context, true);
		this.result = selector.result;
		this.length = this.result.length;
		this.animateTasks = [];
		/* 设置观察者 */
		iDefineProperty(this, 0, {
			get: function () {
				return this.result[0];
			}
		}, this);
	}

	/**
	 * 
	 * @param {String} sel 选择器
	 * @param {String|Node} context 上下文
	 * @param {Boolean} multi 是否多选
	 */
	function Selector(sel, context, multi) {
		context || (context = this.result);
		var selType;
		if (sel.nodeType == 1 || sel.nodeType == 9 || (selType = iTypeTo(sel), selType == sWindow)) {
			this.result = [sel];
		} else {
			var ischars = isString(sel);
			var result;
			if (ischars && /<\w[^<\>]*>/i.test(sel)) {
				var house = iCreateElement();
				house.innerHTML = sel;
				this.result = iList2Array(house.childNodes);
				return this;
			}
			if (isString(context) && context != SPACE) {
				context = Selector.call(this, context, Nil, multi);
			}
			if (context && (isNodeList(result = context.result || context))) {
				var _ = [];
				each(result, function (_, v, self, items, sel) {
					v = Selector.call(self, sel, v, multi);
					v = iList2Array(v.result);
					items.push.apply(items, v);
				}, this, _, sel);
				this.result = _;
			} else {
				context || (context = document);
				var queryName = aQuerySimplyOrMulti[+!!multi];
				if (/^[^.\[#]/.test(sel)) {
					sel = sel.replace(/^((?:>|\+|~))/g, '*$1');
				}
				this.result = context[queryName] ? context[queryName](sel) : [];
			}
		}
		return this;
	}

	function iExecSimply(query, key, value, filter, _/* each */) {
		return query.each(function (i, target, value, _, query, isstring) {
			return isstring ?
				iRuner(filter, Nil, key, value, target, query, isstring, value)
				:
				_(key, filter, target, query, isstring, value);
		}, value, _, query, isString(key))
	}
	var mOffsetFuncMap = {};
	each(['+', '-', '*', '/'], function (k, v, map) {
		map[v] = new Function('to', 'cur', 'return +cur' + v + ' +to;');
	}, mOffsetFuncMap);

	var CLASSMAP = {};
	function rClassInElement (clazz, gl) {
		gl || (gl = SPACE);
		var cName = clazz + gl;
		return CLASSMAP[cName] || (CLASSMAP[cName] = new RegExp('(?:(?:^|\\s+)' + clazz + '(?:\s*$|(\\s)+))', gl || 'g'));
	}
	function iClass(clazz, target, isadd) {
		if (!target || target.nodeType != 1) return;
		var sim = {
			clazz: target.className
		};
		each(clazz.split(/\s+/), function (k, v, target, r) {
			if (v == SPACE) return;
			r = rClassInElement(v);
			var cls = target.clazz;
			if (isadd != Nil) {
				if (cls.search(r) < 0) {
					target.clazz = cls + ' ' + v;
				}
			} else target.clazz = cls.replace(r, $1);
		}, sim);
		target.className = sim.clazz;
	}

	function iHtmlOrAppend(list, element, execFunc, append, isSimply) {
		each(list, function (k, v, element, ef, _) {
			var items;
			element.nodeType == 1 && (element = [element]);
			if (
				isSimply && (items = [element])
				||
				isNodeList(items = element)
				||
				(
					element instanceof Query &&
					(
						items = element.result
					)
				)
				||
				(
					isString(element) && (items = iQuery(element).result)
				)
			) {
				if (append != true) {
					v[iContent4Element(v.tagName)] = SPACE;
				}
				_(items, function (k, v, room, execFunc) {
					execFunc(room, v);
				}, v, ef);
			}
		}, element, execFunc || new Function(), each);
	}
	var s_QueryEventKey = '[' + EVENT_KEY + ']';
	function iRemoveEvent(house, fx) {
		var child
		if (fx === true) {
			child = house;
			fx = Nil;
		} else {
			child = house.find(s_QueryEventKey);
			// 添加上下文到查询列表
			Array.prototype.unshift.apply(child.result, house.result);
		}
		child.each(function (k, v, ia, house, _) {
			var key = ia(v), es = house.events[key];
			_(es, function (k, v, target, _, e) {
				delete e[k];
				_(v, function (k, v, target, name) {
					iEvents.removeEventListener(target, name, v);
				}, target, k)
			}, v, _, es);
			delete house.events[key];
		}, iGetEventMark, house, each);

		house.each(fx);
	}
	var _KeysMap = {};
	function isSimplyData(data, key) {
		var ks;
		return _KeysMap[key] != Nil || !r_S_SEL.test(key) ? (
			ks = (_KeysMap[key] ||
				(
					ks = key.split(r_S_KV),
					_KeysMap[key] = ks[1] || ks[0]
				)
			), data[ks]
		) : data
	}
	var mElementTagClassId = {
		'.': function (k, target) {
			return rClassInElement(k, 'i').test(target.className);
		},
		'[': function (k, target) {
			return iAttr(target, k) != null;
		},
		'#': function (k, target) {
			return target.id == k;
		},
		tag: function (k, target) {
			return k.toUpperCase() == target.tagName
		},
		'{': function () { return false }
	}
	/*  */
	function iElementsIs(targets, sel) {
		var elements;
		if (!/\s+/.test(sel)) {
			elements = [];
			var checkrank = [];
			var code = iSelector2Html.xcode(sel, 0);
			each(code.parent, function (k, v, checkrank) {
				if (v.length) {
					checkrank.push(function (k, v) {
						/* 判断选择器, 如果匹配返回 undefined, 否则返回相应的的数据 @see iRuner([Fcuns,...]) */
						return v = iRuner(this, Nil, k, v), v === true ? Nil : v;
					}.bind(mElementTagClassId[k], (k == DOT && v.shift(), v.join(SPACE))));
				}
			}, checkrank);
			each(targets instanceof Array ? targets : [targets], function (k, target, checkrank, elements) {
				if (isNil(iRuner(checkrank, Nil, target))) {
					elements.push(target);
				}
			}, checkrank, elements);
		}
		return elements
	}
	// Node是否是选择其描述的
	function iElementIs (sel, target) {
		return iElementsIs(target, sel).length ? target : Nil;
	}
	Query.prototype = {
		events: {},
		attr: function (key, val) {
			return iExecSimply(this, key, val, function (k, v, target) {
				return iSetGetAttr(target, k, v);
			}, each);
		},
		/**
		 * @param {JSON|String} key 
		 * @param {*} val 
		 */
		css: function (key, val) {
			return iExecSimply(this, key, val, iCssGetSet, each);
		},
		is: function (sel) {
			return iElementsIs(this.result, sel).length > 0;
		},
		find: function (sel/* , context, multi */) {
			var child = new Query(sel, this.result);
			child.length = Array.prototype.unshift.apply(child.result, iElementsIs(this.result, sel));
			return child;
		},
		addClass: function (clazz) {
			return this.each(function (k, target, clazz, _) {
				_(clazz, target, true);
			}, clazz, iClass)
		},
		removeClass: function (clazz) {
			return this.each(function (k, target, clazz, _) {
				_(clazz, target);
			}, clazz, iClass)
		},
		remove: function () {
			return iRemoveEvent(this, function (k, target) {
				target.parentNode && target.parentNode.removeChild(target)
			}), this;
		},
		append: function (element) {
			return iHtmlOrAppend(this.result, element, function (target, v) {
				target.appendChild(v);
			}, true), this;
		},
		appendTo: function (element) {
			return new Query(element).append(this.result), this;
		},
		html: function (html) {
			var tag, source = this.result;
			return isNil(html)
				?
				(
					tag = source[0],
					tag && tag[iContent4Element(tag.tagName)]
				)
				:
				(iHtmlOrAppend(source, html, function (target, v) {
					var fx = iContent4Element(target.tagName);
					v.nodeType && target.appendChild(v) || (target[fx] = v);
				}, false, isString(html)/* 字符串 */ || !isNaN(+html) /* Number or Boolean */), this);
		},
		data: function (key, prefix) {
			return this.length ? this.each(function (_, target, attrs, keys, prefix, iSDate, rJsonSring) {
				var rData = iSDate(attrs(target, keys, prefix), key);
				return !isNil(key) && rJsonSring.test(rData) ? JSON.parse(rData) : rData
			}, iAttrs, key, prefix, isSimplyData, /^(?:\[.*\]|{.*})$/) : Nil;
		},
		stop: function () {
			return /* this.clearanimate = true, */ this;
		},
		unbind: function () { return iRemoveEvent(this, true), this },
		animate: function (attributes, speed, callback) {
			speed || (speed = 600);
			var tasks = this.animateTasks;
			tasks.push(new AnimateTask(this.result, [this, attributes, speed, callback]));
			if (tasks.length == 1) {
				tasks[0].run();
			}
			return this;
		},
		on: function (name) {
			return iEvent(name)
		},
		trigger: function (name) {
			return this.each(function (_, v, name) {
				try {
					var event = document.createEvent("Events");
					event.initEvent(name, true, true);
					v.dispatchEvent(event);
				} catch (e) {
					document.all && v.fireEvent('on' + name);
				}
			}, name);
		},
		/**
		 * @param {Function} 0 处理方法
		 */
		each: function () {
			var props = iList2Array(arguments), ret;
			props.unshift(this.result);
			return isNil((ret = each.apply(this, props))) ? this : ret;
		}
	}

	Query.prototype.val = Query.prototype.html;
	Query.prototype.off = Query.prototype.unbind;

	function AnimateTask(rank, args) {
		this.rank = rank;
		this.args = args;
	}
	/**
	 * 内部循环
	 * @param {Int} k 索引
	 * @param {Object} v 索引对应的值
	 * @param {AnimateTask} task @see AnimateTask
	 * @param {Query} house @see Query
	 * @param {JSON} attributes @see Query#animate.0
	 * @param {Int} speed @see Query#animate.1
	 * @param {Function} callback @see Query#animate.2
	 * @param {JSON} M 计数
	 */
	function iRanks(k, v, task, house, attributes, speed, callback, config) {
		each(attributes, function (k, v, target, house, callback, date, config) {
			++config.count;
			var to, from = _style(target, k, s_NUMBER)[k] >> 0;
			if (r_SET_VALUE_OFFSET.test(v)) {
				to = iRuner(mOffsetFuncMap[RegExp.$1], Nil, RegExp.$2, from);
			} else {
				to = v;
			}
			var dis = to - from;

			if (dis == 0 || isNaN(dis)) {
				iSetStyle(target, k, to);
				return config.count--;
			}
			var currentDate;

			var times = setInterval(function () {
				if ((currentDate = Date.now() - date) >= speed /* || (house.clearanimate && (currentDate = speed)) */) {
					clearInterval(times);
					currentDate = speed;
					// house.clearanimate = false;
					config.count--;
					if (config.count == 0) {
						iRuner(callback);
						house.animateTasks.shift();
						var aTask;
						if ((aTask = house.animateTasks).length > 0) return aTask[0].run();
					}
				}
				iSetStyle(target, k, from + (dis * currentDate / speed))
			}, 13)
		}, v, house, callback, Date.now(), config);
	}
	AnimateTask.prototype.run = function () {
		var args = this.args;
		args.unshift.call(args, this.rank, iRanks, this);
		args.push({
			count: 0
		})
		each.apply(this, args);
	}

	each(['hide', 'show'], function (k, v, pro) {
		pro[v] || (pro[v] = function () {
			return this.each(function (k, v, hideshow) {
				var isHide = hideshow == 'hide';
				var display = isHide ? iCss(v, 'display') : iAttr(v, 'o-display');
				isHide && (iAttr(v, 'o-display', display), display = 'none');
				iCss(v, {
					'display': display || SPACE
				})
			}, v)
		});
	}, Query.prototype);

	/**
	 * 获取链式调用的末端数据
	 * @param {String} line 链式 a.b.c.v
	 * @param {Object} context 上下文
	 * @param {Object} def 默认值
	 */
	function iGetDataByLine(line, context, def) {
		var l = context, ls = line.split(DOT), llast = ls.pop();;
		each(ls, function (k, v) {
			(l[v] || (l[v] = {})) && (l = l[v]);
		})
		return def == Nil ? l[llast] : (l[llast] || (l[llast] = def));
	}
	/**
	 * 获取事件队列索引
	 * @param {NodeElement} v 
	 */
	function iGetEventMark(v) {
		var ek = iAttr(v, EVENT_KEY);
		if (!ek) iAttr(v, EVENT_KEY, ek = ++QUERY_ID);
		return ek;
	}
	/* ie事件代理 */
	function iEEventTrigger (fc, e) {
		var ev = picker(e, ePickLine);
		merge(ev, e);
		iRuner(fc, this, ev);
	}
	function iEvent(name) {
		return function (fc) {
			each(this.result, function (_k, v, ename, fc, root, _, _class) {
				if (isIE) fc = iEEventTrigger.bind(v, fc);
				var es = root.events;
				var el = iGetDataByLine(_(v) + '.' + ename, es, []);
				el.push(fc);
				// v.addEventListener(ename, fc);
				iEvents.addEventListener(v, ename, fc);
				_class(s_HOVER_HAND, v, true);
			}, name, fc, this, iGetEventMark, iClass);
			return this;
		}
	}
	function iDefineProperty(item, prop, descriptor, context){
		try {
			Object.defineProperty(item, prop, descriptor)
		} catch (e) {
			item[prop] = iRuner(descriptor.get, context);
		}
	}
	var iEvents = {};
	each({
		addEventListener: ['addEventListener', 'attachEvent'],
		removeEventListener: ['removeEventListener', 'detachEvent']
	}, function (k, v, g, kit, prefix) {
		var index = +!g[k];
		kit[k] = function(item, type, listener, useCapture) {
			item[v[index]](prefix[index] + type, listener, useCapture);
		}
	}, global, iEvents, ['', 'on'])
	each([
		'resize', 'click', 'focus', 'blur', 'change', 'scroll', 'load', 'hashchange', 'error',
		/* PC端 */
		'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel',
		'keydown', 'keypress', 'keyup',
		/* 移动端 */
		'touchcancel', 'touchend', 'touchmove', 'touchstart',
		/* html5 */
		'animationend', 'animationiteration', 'animationstart'
	], function (k, v, pro) {
		iDefineProperty(pro, v, {
			get: function () {
				return iEvent(v)
			}
		})
	}, Query.prototype);
	// 
	var iHtmlElement = iQuery(ddoc);
	iHtmlElement.css({
		height: '100%'
	})
	/**
	 * 获取宽高
	 * @param {Node} box 
	 */
	function $pickWidthHeight(box) {
		if (!box) box = iHtmlElement;
		return {
			width: box.attr(s_OFFSETWIDTH),
			height: box.attr(s_OFFSETHEIGHT)
		};
	}
	// 获取屏幕宽高
	var SCREEN = $pickWidthHeight();

	var overflow = iHtmlElement.css('overflow');
	/**
	 * 窗口类, tips提示,模式窗口的基类
	 * @param {JSON} args 配置信息
	 */
	function Dialog(args) {
		this.id = ID++;
		//窗口关联, 当主窗口关闭时,先调用link对应的窗口remove方法后在执行当前remove
		this.link = Nil;
		this.offset = {};
		this._close_ = [];
		this._resize_ = [];
		Dialogs[this.id] = this;

		merge(this, args);

		DialogsRanks.push(this);

		args.root.attr({
			id: this.id
		});
		this.bind();
		this.events = { click: {} };
		this.isOwnSetting = iRuner(this.callback, Dialogs, this.id, this);
	}
	Dialog.prototype = {
		tips: module.exports.tips,
		onresize: function (fx) {
			return this._resize_.push(fx), this;
		},
		onclose: function (fx) {
			return this._close_.push(fx), this;
		},
		remove: function (di) {
			if (this.link instanceof Dialog) this.link.remove();
			return iCurrent(di || this), this;
		},
		resize: function (time) {
			var self = this;
			return iLazyRun(function () {
				$resize(self);
			}, time), self;
		},
		glass: function (show) {
			this.root.attr('is-blur', +show);
			iHtmlElement[show ? 'addClass' : 'removeClass']('blur');
		},
		addClass: function (clazz) {
			return this.root.addClass(clazz), this;
		},
		removeClass: function (clazz) {
			return this.root.removeClass(clazz), this;
		},
		timer: function () {
			if (+this.timeout) {
				var self = this;
				self.times = setTimeout(function () {
					self.remove();
				}, this.timeout * 1000);
			}
		},
		push: function (event, key, factory) {
			return iGetDataByLine(event + DOT + key, this.events, []).push(factory), this;
		},
		click: function (key, factory) {
			return this.push('click', key, factory), this;
		},
		proxy: function (target, fx) {
			var eventid = QUERY_ID++;
			target instanceof Query ?
				target.attr(EVENT_HANDLE, eventid)
				:
				iAttr(target, EVENT_HANDLE, eventid);
			this.onclose(function(id){
				this.events.click[id] = null;
			}.bind(this, eventid))
			return this.click(eventid, fx);
		},
		destroy: function () {
			var self = this;
			self.cleartime();
			self.bg.stop(true, true).animate({
				opacity: .1
			}, 10);
			var config = {
				css: {
					top: '-=25px',
					opacity: .5
				},
				speed: 400
			}
			merge(config, self.destroyConfig, true);
			self.room.stop(true, true).animate(config.css, config.speed, function () {
				iRuner(self._close_, self);
				DialogCount--;
				self.root.remove();
				delete Dialogs[self.id];
				if (DialogCount <= 0)
					iHtmlElement.css({
						'overflow': overflow
					});
				if (+self.root.attr('is-blur')) self.glass();
				each(self, function (k) {
					this[k] = null;
				}, self);
			});
		},
		cleartime: function () {
			clearTimeout(this.times);
		},
		bind: function () {
			this.room.find('[data-bind]').each(function (_, v, dia) {
				var dbind = iAttr(v, 'data-bind');
				iDefineProperty(dia, dbind, {
					get: function () {
						return iQuery(v, this.root);
					}
				}, dia)
			}, this);
		},
		runer: iRuner
	};
	/**
	 * 设置居中
	 */
	function $center(id, position, dia, user) {
		var dialog = iQuery(id);
		var css = !user && dia.isOwnSetting
			? {} :
			iPosition.trigger(
				position,
				$pickWidthHeight(dialog.room || dialog),
				SCREEN
			);
		css.zIndex = 10;
		css.position = fixed;
		dialog.css(css);
		return SCREEN;
	}
	// 当windows变化后执行
	function $resize(dia) {
		if (!iRuner(dia._resize_, dia))
			iRepainting(dia);
	};
	// 重新绘制
	function iRepainting(dia, user) {
		var css = $center(dia.room, dia.position, dia, user);
		css.left = css.top = 0;
		dia.bg.css(css);
	}
	// 创建基础DOM
	var HTMLS = selector2Html('div.windows>div.content+div.bg');
	// 创建确认对话框DOM结构
	var CONFIRM_HTML = selector2Html('div.confirm>div.confirm-title{标题}+div.confirm-content{内容}+span.confirm-cancel{取消}+span.confirm-submit{确定}+span.confirm-cancel.close{×}');

	var CLOSE_HTML = selector2Html('span.close{×}');

	String.prototype.buildHtml = function (isSelector) {
		return isSelector ? selector2Html(this) : giveUHtmlBySelector(this);
	}

	var EVENT_HANDLE = 'e-dialog-handle';
	function iFindEventParent(target) {
		var ret = {};
		while (target) {
			if (handle = iAttr(target, EVENT_HANDLE)) {
				ret.name = handle;
				ret.target = target;
				break;
			}
			target = target.parentNode;
		}
		return ret;
	}
	/**
	 * 显示Dialog
	 * @param  {String} mode 要显示的窗体内容
	 * @param  {Function} fx 回调
	 * @param  {Number} time x秒后自动消失
	 * @return {Dialog}       
	 */
	function iDialog(mode, fx, time, position, show) {
		var args = iList2Array(arguments);
		var callback = args.shift();
		var Md;
		if (!isFunction(callback)) {
			Md = callback;
			callback = args.shift();
			if (!callback) callback = new Function;
		}
		var root = iQuery(HTMLS);

		var room = root.find('>.content');
		var bg = root.find('>.bg');

		room.html(Md);
		iHtmlElement.css({
			'overflow': 'hidden'
		});
		var css = {
			position: fixed,
			top: 0,
			left: 0,
			zIndex: 100000
		};
		root.css(css);
		iHtmlElement.append(root);
		DialogCount++;
		/* if position is Query , take the frist */
		position instanceof Query && (position = position[0]);
		var positionIsDom = !isString(position) && position && position.nodeType == 1;

		var dialog = new Dialog({
			bg: bg,
			room: room,
			root: root,
			callback: callback,
			position: positionIsDom ? Nil : position,
			timeout: time
		});
		/* 追加点击事件 */
		root.click(function (e) {
			var target = picker(e, ePickLine).target;
			var ev = iFindEventParent(target);
			iRuner(dialog.events.click[ev.name], ev.target, e);
		}).removeClass(s_HOVER_HAND);

		if (positionIsDom) {
			var slow, _position;
			if (show && iTypeTo(show) == sObject) {
				slow = show.slow;
				_position = show.position;
			}
			(+slow) && room.hide();
			room.addClass('windows-freely');
			room.append(iSelector2Html.toHtml('.i-mark'));
			var callRoot = {
				index: 1,
				offset: 10,
				room: room,
				target: position,
				position: _position,
				iMark: room.find('.i-mark')
			}
			dialog.onresize(function () {
				dialog.bg.css(SCREEN);
				return iResize.call(callRoot), true;
			})
			/* 是否延迟加载 */
			iLazyRun(function () {
				room.show();
				dialog.resize();
			}, slow);
		} else {
			iUserEventMap.auto.mix.animate(dialog, !dialog.isOwnSetting);
		}
		dialog.timer();
		if (isIE) {
			iQuery('body').append(root);
		}
		return dialog;
	};

	var aPosition = ['i-s-left', SPACE, 'i-s-right', 'i-s-bottom'];
	var iDialogMinHeight = 50;
	/**
	 * 重置位置
	 * #this{
	 * 		target: 目标,
	 * 		room: 当前提示窗
	 * 		index: 上次位置
	 * 		offset: 偏移量
	 * 		position: 是否
	 * }
	 */
	function iResize() {
		var top, left;
		var tRect = this.target.getBoundingClientRect();
		var room = this.room;
		var index = this.index;
		var iMOffset = this.offset;
		/* 指向目标三角箭头 */
		var iM = this.iMark;
		var rHeight = room.attr(s_OFFSETHEIGHT);
		var rWidth = room.attr(s_OFFSETWIDTH) + iMOffset;
		/* ie低版本不含有 height, width */
		var tHeight = tRect.height;
		tHeight = (tHeight == Nil ? tRect.bottom - tRect.top : tHeight) >> 0;
		var tWidth = tRect.width;
		tWidth = (tWidth == Nil ? tRect.right - tRect.left : tWidth) >> 0;

		var rStyle = {}, mStyle = {},
			rectTH = tRect.top + tHeight,
			rectLW = tRect.left + tWidth;
		/* 取消上次位置 */
		room.removeClass(aPosition[index]);
		/* 判断目标右侧是否可正常显示 ###优先右边显示### */
		var isRight = SCREEN.width - rectLW - iMOffset > rWidth;
		var isBottom = /* 下偏移量 */SCREEN.height - rectTH > rHeight;
		var imHeight = this.iMarkHieght || (this.iMarkHieght = iM.attr(s_OFFSETHEIGHT));
		mStyle.top = SPACE;
		/* 下方显示 且 提示窗口高度 大于 iDialogMinHeight */
		if (!this.position && isBottom && rHeight > iDialogMinHeight) {
			index = 3;
			top = rectTH + imHeight / 2;
			rStyle.left = tRect.left;
		} else {
			top = tRect.top - rHeight - imHeight / 2;
			left = isRight ? rectLW + iMOffset : tRect.left - rWidth;
			if (top < 0 && (isRight || left > 0)) {
				/* 左右方显示 */
				index = isRight ? 2 : 0;
				var targetTop = tRect.top - 10;
				var roomTop = SCREEN.height - rHeight;
				top = Math.min(targetTop, roomTop)
				top < 0 && (top = 0);
				mStyle.top = Math.abs(tRect.top - top) + tHeight / 2;
			} else {
				/* 上方显示 */
				index = 1;
				left = tRect.left;
			}
			rStyle.left = left;
		}
		this.index = index;
		room.addClass(aPosition[index]);
		rStyle.top = Math.max(top, 0);
		/* 设置相关样式 */
		iM.css(mStyle);
		room.css(rStyle);
	}
	/**
	 * 是否延迟运行
	 * @param {Function} run 
	 * @param {Number} slow 
	 */
	function iLazyRun(run, slow) {
		return +slow ? setTimeout(run, slow) : iRuner(run);
	}
	//移除当前窗口
	function iCurrent(dialog) {
		var curr;
		if (dialog) {
			var count = DialogCount;
			while (count--) {
				if (DialogsRanks[count] === dialog) {
					DialogsRanks.splice(count, 1);
					curr = dialog;
					break;
				}
			}
		} else {
			curr = DialogsRanks.pop();
		}
		if (curr) {
			curr.destroy();
		};
	};

	function iUserWindowResize() {
		SCREEN = $pickWidthHeight();
		for (var i in Dialogs) {
			$resize(Dialogs[i]);
		}
	}
	/**
	 * 获取DOM对象
	 * @param {String|Query|Node} sel 
	 * @param {String|Query|Node} context 
	 */
	function iQuery(sel, context) {
		return sel instanceof Query ? sel : new Query(sel, context);
	}
	// 新增事件监听
	iQuery(window).resize(iUserWindowResize).keydown(function (e) {
		if (e.keyCode === 27) iCurrent();
	});

	function iHtml(target, element) {
		var unQuery = {};
		unQuery.result = target instanceof Array ? target : [target];
		return Query.prototype.html.call(unQuery, element);
	}
	var rExport = {
		'is': iElementIs,
		'css': iCss,
		'each': each,
		'attr': iAttr,
		'html': iHtml,
		'merge': merge,
		'attrs': iAttrs,
		'query': iQuery,
		'Query': iQuery,
		'show': iDialog,
		'list': Dialogs,
		'runer': iRuner,
		'picker': picker,
		'showBox': iDialog,
		'between': between,
		'isString': isString,
		'getline': pickVarLine,
		'resize': iUserWindowResize,
		'selector2Html': selector2Html,
		'giveUHtmlBySelector': giveUHtmlBySelector,
		'confirm': function (title, content, callback, position) {
			return this.auto(CONFIRM_HTML, function (id, dialog) {
				dialog.glass(true);
				var room = dialog.room;
				room.find('.confirm-title').html(title);
				room.addClass('dialog-confirm').find('.confirm-content').html(content);
				dialog.proxy(room.find('.confirm-cancel'), function () {
					dialog.remove();
					return false;
				});
				dialog.proxy(room.find('.confirm-submit'), function (e) {
					if (iRuner(callback, dialog.root, rExport, dialog, e)) {
						dialog.remove();
					}
					return false;
				})
			}, position);
		},
		'notice': function (msg, time, position, init, clazz) {
			var notice = this.tips(msg, time, position, init);
			return notice.addClass(clazz || 'notice'), notice;
		},
		'error': function (msg, time, position, init) {
			return this.notice(msg, time, position, init, 'error');
		},
		'tips': function (msg, time, position, init) {
			if (time > 7) msg += CLOSE_HTML;
			return iDialog(giveUHtmlBySelector(msg), function (id, dialog) {
				dialog.root.addClass('dialog-tips');
				iRuner(init, dialog);
				dialog.proxy(dialog.root.find('.content .close' + (time > 7 ? SPACE : ',.bg')), function () {
					dialog.remove();
				});
			}, time, position || rExport.tips_position);
		},
		/**
		 * 自动适应
		 * @param  {String}   mode     内容
		 * @param  {Function} callback 回调函数
		 * @param  {String}   args       布局 offset : 左 上 右 下..等;
		 */
		'auto': function (mode, callback, args) {
			var cs;
			if (!isFunction(callback) && isNil(args)) {
				args = callback;
				callback = args && args.callback;
			}
			if (isString(args)) {
				cs = args;
				args = {};
			} else {
				args || (args = {});
				cs = args.cs;
			}
			cs || (cs = s_AUTOATTRS);
			var rainbox = iDialog(mode, function (id, dia) {
				// 初始化
				dia.runer(args.init, dia, id);
				dia.runer(callback, this, id, dia);
				/* 绑定数据关联 */
				dia.bind();
				// end
				dia.runer([args.last, args.end], dia, id);
				dia.onresize(resize);
				return true;
			}, Nil, args.position);
			
			rainbox.destroyConfig = args.destroy;

			var rules = dialogAutoRules(cs.split(r_MULIT_SPLIT_SEP));
			rules instanceof Array && rules.sort(function (a, b) {
				return a.sort - b.sort
			});
			/*  */
			args.destroy && isNil(args.center) && (args.center = false);
			// 是否自由定位,非居中
			rainbox.isFree = args.center === false || r_IsNotCenter.test(cs);
			var room = rainbox.room.hide();
			iLazyRun(function () {
				room.show();
				// 结束
				resize.call(rainbox, true);
				iRuner(args.end || function () {
					iUserEventMap.auto.mix.animate(this, true);
				}, rainbox);
			}, args.slow);

			function resize(is1st) {
				this.is1st = !!is1st;
				var css4 = {};
				each(rules, function (k, v, rMap, css4, house) {
					if (!(v.value[0] instanceof Dialog)) {
						v.value.unshift(house);
					}
					rMap[v.name] && rMap[v.name].apply(css4, v.value);
				}, iUserEventMap.auto.mix, css4, this);
				iRepainting(this, !this.isFree);
			}
			return rainbox;
		},
		'push': function (key, attr, val) {
			(iUserEventMap[key] || (iUserEventMap[key] = {
				mix: {}
			})).mix[attr] = val;
			return this;
		},
		'remove': function (sel, listener) {
			if (isString(sel)) {
				iQuery(sel).each(function (_, v) {
					var id = iAttr(v, 'id');
					var sim = Dialogs[id];
					sim && sim.remove();
				}).remove();
			} else iCurrent(sel);
		},
		'screen': function () {
			return SCREEN;
		},
		'clazz': function (target, clazz, add) {
			iClass(clazz, target, add === true ? add : Nil);
		},
		'addClass': function (target, clazz) {
			iClass(clazz, target, true);
		},
		'removeClass': function (target, clazz) {
			iClass(clazz, target);
		},
		'within': function (sel, target) {
			var sim = target;
			while (sim && iElementIs(sel, sim) == Nil) sim = sim.parentNode;
			return sim;
		}
	};
	// 窗口距容器的边距
	rExport.push(s_AUTO_KEY, 'offset', function (D, l, t, r, b) {
		var room = D.room;
		var css = iPaddings(room);
		if (l != r || t != b) {
			D.isFree = true;
		}
		isNumber(t) && (this.top = t >> 0);
		isNumber(l) && (this.left = l >> 0);
		this.width = SCREEN.width - (this.left >> 0) - (r >> 0) - css.l - css.r;
		this.height = SCREEN.height - (this.top >> 0) - (b >> 0) - css.t - css.b;
		D.room.css(this);
	});
	function isNumber(value) {
		return !isNaN(+value)
	}
	function iPaddings(house) {
		return house.paddings || (house.paddings = house.css(PICK_PADDING_4_CSS, s_NUMBER))
	}
	function iMargins(house) {
		return house.margins || (house.margins = house.css(PICK_PADDING_4_CSS.replace(/padding/g, 'margin'), s_NUMBER))
	}
	var aOffsetList = [s_OFFSETWIDTH, s_OFFSETHEIGHT, s_OFFSETWIDTH, s_OFFSETHEIGHT];
	// 计算内部布局
	rExport.push(s_AUTO_KEY, 'inner', function (D, l, t, r, b, center, offset, isrezsize) {
		var
			room = D.room,
			offsets;
		if (/^(?:true|false)$/.test(offset)) {
			isrezsize = offset;
			offset = Nil;
		}
		var isUnRe = isrezsize != 'true';
		if (!(offsets = room.inneroffset)) {
			room.iDefaultPadding = {l: 0, t: 0, r: 0, b: 0};
			offsets = room.inneroffset = {};
			each([l, t, r, b], function (k, v, map, offsets, mk) {
				if (isNumber(v)) {
					offsets[mk[k]] = v >> 0;
				} else {
					var Q = room.find(v);
					var padding = iPaddings(Q);
					var margin = iMargins(Q);
					offsets[mk[k]] = Q.length ? (margin.t + margin.b + padding.t + padding.b + (Q.attr(map[k]) >> 0)) >> 0 : 0;
				}
			}, aOffsetList, offsets, 'l,t,r,b'.split(','));
		}
		
		var
			css = {},
			paddings = iPaddings(room),
			BODY = room.iINNER || (room.iINNER = room.find(center)),
			paings = room.is(center) ? room.iDefaultPadding : iPaddings(BODY),
			/* inner 滚动高度 */
			cScrollHeight = BODY.attr(s_SCROLLHEIGHT) >> 0,
			screenHeight = SCREEN.height - (offset >> 0),
			screenWidth = SCREEN.width - (offset >> 0),
			minWidth = /* room.minWidth ||  (room.minWidth = */room.attr('scrollWidth') >> 0/* ) */,
			offsetY = offsets.t + offsets.b + paddings.t + paddings.b+ paings.t + paings.b,
			iW = screenWidth - (paddings.l + paddings.r + offsets.l + offsets.r + paings.l + paings.r),
			iH = (this.height || screenHeight) - offsetY;
		css.width = screenWidth >= minWidth && isUnRe ? s_AUTO : iW;
		css.height = cScrollHeight + offsetY > screenHeight ? Math.min(cScrollHeight, iH) : isUnRe ? s_AUTO : iH;
		BODY.css(css);
	});
	// 设置居中
	rExport.push(s_AUTO_KEY, 'center', function (D, center) {
		if (!/^true$/.test(center)) return;
		iRepainting(D, true);
	});
	// 第一次打开时的动画 可以被覆盖 @see dialog.push('auto', 'animate', Function)
	rExport.push(s_AUTO_KEY, 'animate', function (D, use, start, end) {
		if (/^true$/.test(use)) {
			iRepainting(D, D.isFree != Nil ? !D.isFree : true);
			if (D.is1st != Nil && !D.is1st) return;
			D.room.stop(true, true).css({
				top: start || '+=10'
			}).stop(true, true).animate({
				top: end || '-=10',
				opacity: 1
			});
		}
	});
	module.exports = rExport;
}));
