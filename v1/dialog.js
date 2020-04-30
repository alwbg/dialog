/**
 * @autor alwbg@163.com | soei
 * -----------------------------------
 * - https://github.com/alwbg/dialog -
 * -----------------------------------
 * creation-time : 2020-04-30 11:20:12 AM
 * 提供弹窗,提示[左上,上中,右上,右下,下中,左下,中]位置显示,xx秒自动关闭功能
 * 支持全局和 AMD和CMD调用
 * update 2018-03-29
 * - 新增 auto内的配置项 
 * dialog.auto( html, Function, 
 * 'inner:左边距 上边距 右边距 下边距 中间选择器;animate:true|false 开始位置 结束位置;offset: 左 上 右 下;center:true'
 * )
 * 可以通过 dialog.push 添加和重写以上参数方法
 * dialog.push( 'auto', 'animate', function( current[, use,...]){} )
 * 
 */
;(function( global, factory ){
	global[ 'global' ] = global;
	if( typeof exports === 'object' ) {
		// factory( require, exports, module );
	} else if (typeof define === 'function') {
		//AMD CMD
		define( 'dialog', factory );
	} else {
		var funcName = 'require';
		if( funcName && !global[ funcName ] ) {
			global[ funcName ] = function( id ) {
				return global[ id ];
			};
		};
		var MODULE = { exports : {} };
		factory( global[ funcName ] || function( id ) {
			alert( '需要实现 require(),加载模块:"' + id + '"' );
		}, MODULE.exports, MODULE );
		global[ 'dialog' ] = MODULE.exports;
	}
}( this, function( require, exports, module ) {

	var Count = 0;
	var ddoc = document.documentElement;
	var isNotFixed = /ie\s*(6|5)/ig.test(navigator.userAgent);

	var ID = 20160516;

	var EVENT_KEY = 'query-event-index';
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
	var r_HasIDSel = /^#(\d[^\s]*)\s*/;
	var r_IsNotCenter = /(?:^|;\s*)center\s*:\s*false/;

	var Nil;
	var SPACE = '';
	var DOT = '.';
	var S_PX = 'px';
	var S_$1 = '-$1';

	var s_DATA = 'data';
	var s_AUTO = 'auto';
	var TAG_NAME = 'div';
	var s_AUTO_KEY = 'auto';
	var s_NUMBER = 'number';
	var s_HOVER_HAND = 'hover-show-hand';

	var s_OFFSETWIDTH = 'offsetWidth';
	var s_OFFSETHEIGHT = 'offsetHeight';
	var s_SCROLLHEIGHT = 'scrollHeight'

	var s_NODELIST = '[object NodeList]';

	var ALL = '*';

	var PICK_PADDING_4_CSS = 'paddingLeft|padding-left=>l,paddingTop|padding-top=>t,paddingRight|padding-right=>r,paddingBottom|padding-bottom=>b';

	var F_List = ["getAttribute", "setAttribute"];
	var aQuerySimplyOrMulti = ['querySelector', 'querySelectorAll'];
	var aVH = ['innerHTML', 'value'];

	//var isBlur      	= /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*(?:7|8|9|10)|webkit)/i.test( navigator.userAgent );
	var fixed = isNotFixed ? 'absolute' : 'fixed';

	// 配置
	var iUserEventMap = {};
	var Dialogs = {};
	var OBJECT_EMPTY = {};
	var DialogsRanks = [];
	//对象原型
	var EMPTY_ARRAY = [];

	var EMPTY_ARRAY_SLICE = EMPTY_ARRAY.slice;

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

	function nodeViewAttr(tagName) {
		return aVH[+/input/i.test(tagName)]
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
				rWidth = this.rWidth;
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
			'tag': [/tag/g, 'span', '$1'],
			'{': [/#\*i\*#/g, SPACE, '$1']
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
					// console.log(inInnerMark, sim)
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
			return prefixReg.test(x), $css2js(RegExp.$1);
		} : function (x) {
			return x;
		}
		if (prefix == s_DATA) {
			attrs = target.dataset;
		} else {
			var prefixReg = rMapKey[prefix] || (rMapKey[prefix] = prefix ? new RegExp('^' + prefix + '-(.+)', 'i') : /.*/);
			attrs = target.attributes;
			var json = {};
			each(attrs, function (k, v, json, prefixReg, execz) {
				if (prefixReg.test(v.name)) {
					json[execz(v.name)] = v.value
				}
			}, json, prefixReg, execz);
			attrs = json;
		}
		return picker(attrs, $css2js(key || ALL));
	}
	// 获取对象属性值
	function iAttr(target, key, val) {
		var isGet = val === Nil;
		if (isString(key)) {
			var fun = F_List[+!isGet];
			// 获取操作方法
			if (target[fun] instanceof Function) {
				if (isGet) return target[fun](key);
				else target[fun](key, val);
			} else {
				return iAttr.attr.call(target, key, val);
			}
		} else {
			each(key, function (k, v, target) {
				target[F_List[1]](k, v);
			}, target);
		}
	}
	iAttr.attr = function (key, val) {
		if (val === Nil) return this[key];
		else this[key] = val;
	}

	/**
	 * css格式输出JS格式
	 * @param  {String} css data-name-show
	 * @return {String} js dataNameShow
	 */
	function $css2js(css) {
		return css.replace(r_CSS2JS, function (source, $1, index) {
			return $1.toUpperCase();
		})
	}

	function $js2css(css) {
		return css.replace(r_JS2CSS, S_$1).toLowerCase();
	}
	function iSetStyle(target, key, value, suffix) {
		if (target.nodeType == 1) {
			if (r_CSS2JS.test(key)) key = $css2js(key);
			if (r_NUMBER_VALUE.test(key)) {
				if (r_SET_VALUE_OFFSET.test(value)) {
					value = iRuner(mOffsetFuncMap[RegExp.$1], Nil, RegExp.$2, _style(target, key, s_NUMBER)[key] >> 0);
				}
				if (!isNaN(+value)) value = value + (suffix || S_PX);
			}
			target.style[key] = value;
		}
	}
	function iCss(target, keys, valueOrSuffix) {
		if (isString(keys)) {
			return _style(target, keys, valueOrSuffix);
		} else {
			each(keys, function (k, v, target, suffix) {
				iSetStyle(target, k, v, suffix);
			}, target, valueOrSuffix)
		}
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
					data[pi || v] = rData === Nil ? k : rData;
					return true;
				}
			}, val, value[1], data, type, filter);

		}, rain, simply, _, type, filter);
		// 添加
		picker.push(rain);
	}

	function picktype(O) {
		return iTypeTo(O).replace(r_ANYTHING, '$1');
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
	// 遍历Set Map
	function MS(source, fn, args) {
		fn instanceof Function || (fn = function () { });
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
				if (source.hasOwnProperty(key) && EACH.changeWay.call(this, key, args, source, fn)) return this.ret;
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
		if (func instanceof Function);
		else return;
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
		each(list, function (k, val, list, RuleSort,/* 临时变量 */ kv, v, vs) {
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
		if (!isString(rule)) return {};
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
			return picker(document.defaultView.getComputedStyle(dom, SPACE), attr || ALL, type);
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
		Object.defineProperty && Object.defineProperty(this, '0', {
			// set: set,
			get: function () {
				return this.result[0];
			}
		});
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
			if (ischars && /<\w[^<\>]*>/i.test(sel)) {
				var house = iCreateElement();
				house.innerHTML = sel;
				this.result = iList2Array(house.childNodes);
				return this;
			}
			if (ischars && r_HasIDSel.test(sel)) {
				context = document.getElementById(RegExp.$1);
				sel = sel.replace(r_HasIDSel, SPACE);
				if (sel == SPACE) return sel;
			}
			if (isString(context) && context != SPACE) {
				context = Selector.call(this, context, Nil, multi);
			}
			var result;
			if (context && (isNodeList(result = context.result || context))) {
				var _ = [];
				each(result, function (k, v, self, items, sel) {
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
			if (isstring) {
				return iRuner(filter, Nil, key, value, target, query, isstring, value);
			} else {
				return _(key, filter, target, query, isstring, value);
			}
		}, value, _, query, isString(key))
	}
	var mOffsetFuncMap = {};
	each(['+', '-', '*', '/'], function (k, v, map) {
		map[v] = new Function('to', 'cur', 'return +cur' + v + ' +to;');
	}, mOffsetFuncMap);

	var CLASSMAP = {};
	function iClass(clazz, target, isadd) {
		if (!target || target.nodeType != 1) return;
		var sim = {
			clazz: target.className
		};
		each(clazz.split(/\s+/), function (k, v, cMap, target, r) {
			if (v == SPACE) return;
			if (v in cMap) {
				r = cMap[v];
			} else {
				r = cMap[v] = new RegExp('(?:(?:^|\\s+)' + v + '(?:\s*$|(\\s)+))', 'g');
			}
			var cls = target.clazz;
			if (isadd != Nil) {
				if (cls.search(r) < 0) {
					target.clazz = cls + ' ' + v;
				}
			} else target.clazz = cls.replace(r, '$1');
		}, CLASSMAP, sim);
		target.className = sim.clazz;
	}

	function iHtmlOrAppend(list, element, execFunc, append, isChars) {
		each(list, function (k, v, element, ef, _) {
			var items;
			element.nodeType == 1 && (element = [element]);
			if (
				isChars && (items = [element])
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
					v[nodeViewAttr(v.tagName)] = SPACE;
				}
				_(items, function (k, v, room, execFunc) {
					execFunc(room, v);
				}, v, ef);
			}
		}, element, execFunc || new Function(), each);
	}
	var s_QueryEventKey = '[' + EVENT_KEY + ']';
	function iRemoveEvent(house, fx) {
		house.find(s_QueryEventKey).each(function (k, v, ia, house, _) {
			var key = ia(v);
			_(house.events[key], function (k, v, target, _) {
				_(v, function (k, v, target, name) {
					target.removeEventListener(name, v);
				}, target, k)
			}, v, _);
			delete house.events[key];
		}, iGetEventMark, house, each);

		house.each(fx);
	}
	function isSimplyData(data, key){
		var kMap, ks;
		kMap = this._KeysMap || (this._KeysMap = {});
		return kMap[key] != Nil || !r_S_SEL.test(key) ? (
			ks = (kMap[key] || 
				(
					ks = key.split(r_S_KV),
					kMap[key] = ks[1] || ks[0]
				)
			), data[ks]
		) : data
	}
	Query.prototype = {
		events: {},
		attr: function (key, val) {
			return iExecSimply(this, key, val, function (k, v, target) {
				var isGet = v == Nil;
				var fname = F_List[+!isGet];
				var isNode = target[fname]
				if (isGet) {
					return (isNode && target[fname](k)) || target[k];
				};
				(isNode && target[fname](k, v)) || (target[k] = v);
			}, each);
		},
		/**
		 * 
		 * @param {JSON|String} key 
		 * @param {*} val 
		 */
		css: function (key, val) {
			// console.log('css:::',...arguments)
			// var isSimply = !r_S_SEL.test(key);
			return iExecSimply(this, key, val, function (k, v, target) {
				if (v == Nil || (r_NUMBER_VALUE.test(k) && v == s_NUMBER)) {
					return isSimplyData(_style(target, k, v), k);
				}
				iSetStyle(target, k, v, Nil);
			}, each);
		},
		find: function (sel, context, multi) {
			return new Query(sel, this.result);
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
		html: function (html) {
			var tag, source = this.result;
			return html === Nil
				?
				(
					tag = source[0],
					tag && tag[nodeViewAttr(tag.tagName)]
				)
				:
				(iHtmlOrAppend(source, html, function (target, v) {
					var fx = nodeViewAttr(target.tagName);
					v.nodeType && target.appendChild(v) || (target[fx] = v);
				}, false, isString(html)/* 字符串 */), this);
		},
		data: function (key, prefix) {
			return this.each(function (k, target, _, keys, prefix, iSDate, rJsonSring) {
				var rData = iSDate(_(target, keys, prefix), key);
				return !isNil(key) && rJsonSring.test(rData) ? JSON.parse(rData) : rData
			}, iAttrs, key, prefix, isSimplyData, /^(?:\[.*\]|{.*})$/);
		},
		stop: function () {
			return /* this.clearanimate = true, */ this;
		},
		animate: function (attributes, speed, callback) {
			speed || (speed = 600);
			var tasks = this.animateTasks;
			tasks.push(new AnimateTask(this.result, [this, attributes, speed, callback]));
			if (tasks.length == 1) {
				tasks[0].run();
			}
			return this;

		},
		on: function () {
			return this.each();
		},
		trigger: function (name) {
			return this.each(function (k, v, name) {
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
			var props = iList2Array(arguments);
			props.unshift(this.result);
			return each.apply(this, props) || this;
		}
	}
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

	Query.prototype.val = Query.prototype.html;

	each(['hide', 'show'], function (k, v, pro) {
		pro[v] || (pro[v] = function () {
			return this.each(function (k, v, hideshow) {
				var isHide = hideshow == 'hide';
				var display = isHide ? iCss(v, 'display').display : iAttr(v, 'old-display');
				isHide && (iAttr(v, 'old-display', display), display = 'none');
				iCss(v, {
					'display': display
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
	function iEvent(name) {
		return function (fc) {
			each(this.result, function (k, v, ename, fc, root, _, _class) {
				var es = root.events;
				var el = iGetDataByLine(_(v) + '.' + ename, es, []);
				el.push(fc);
				v.addEventListener(ename, fc);
				_class(s_HOVER_HAND, v, true);
			}, name, fc, this, iGetEventMark, iClass);
			return this;
		}
	}
	each(['resize', 'click', 'keydown', 'keyup', 'focus', 'change'], function (k, v, pro) {
		pro[v] = iEvent(v);
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
		merge(this, args);
		this.id = ID++;
		this._resize_ = [];
		this._close_ = [];
		this.offset = {};
		//窗口关联, 当主窗口关闭时,先调用link对应的窗口remove方法后在执行当前remove
		this.link = null;
		Dialogs[this.id] = this;
		DialogsRanks.push(this);

		args.root.attr({
			id: this.id
		});
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
			return time ? setTimeout(function () {
				$resize(self)
			}, time) : $resize(self), self;
		},
		glass: function (show) {
			this.root.attr('is-blur', +show);
			iHtmlElement[show ? 'addClass' : 'removeClass']('blur');
		},
		addClass: function (clazz) {
			return this.root.addClass(clazz), this;
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
		destroy: function () {
			iRuner(this._close_);
			Count--;
			this.root.remove();
			delete Dialogs[this.id];
			if (Count <= 0)
				iHtmlElement.css({
					'overflow': overflow
				});
			if (+this.root.attr('is-blur')) this.glass();
		},
		cleartime: function () {
			clearTimeout(this.times);
		},
		runer: iRuner
	};
	/**
	 * 设置居中
	 */
	function $center(id, position, dia, user) {
		var dialog = iQuery(id);
		var css = !user && dia.isOwnSetting ? {} : iPosition.trigger(position, $pickWidthHeight(dialog.room || dialog), SCREEN);
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
	var CONFIRM_HTML = selector2Html('div.confirm>div.confirm-title{标题}+div.confirm-content{内容}+span.confirm-cancel[handle="close"]{取消}+span.confirm-submit[handle="submit"]{确定}+span.confirm-cancel.close[handle="close"]{×}');

	var CLOSE_HTML = selector2Html('span.close{×}');

	String.prototype.buildHtml = function (isSelector) {
		return isSelector ? selector2Html(this) : giveUHtmlBySelector(this);
	}
	/**
	 * 显示Dialog
	 * @param  {String} mode 要显示的窗体内容
	 * @param  {Function} fx 回调
	 * @param  {Number} time x秒后自动消失
	 * @return {Query}       
	 */
	function iDialog(mode, fx, time, position, show) {
		var args = iList2Array(arguments);
		var callback = args.shift();
		var Md;
		if (!(callback instanceof Function)) {
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
		Count++;

		var positionIsDom = !isString(position) && position && position.nodeType == 1;

		var dialog = new Dialog({
			root: root,
			room: room,
			bg: bg,
			position: positionIsDom ? Nil : position,
			callback: callback,
			timeout: time
		});

		/* 追加点击事件 */
		root.click(function (e) {
			var handle = iAttr(e.target, 'handle');
			iRuner(dialog.events.click[handle], e.target, e);
		}).removeClass(s_HOVER_HAND);

		if (positionIsDom) {
			var slow, _position;
			if (show && iTypeTo(show) == sObject) {
				slow = show.slow;
				_position = show.position;
			}
			// iRepainting(dialog, true);
			(+slow) && room.hide();
			var _target = position;
			var top, height;

			room.addClass('windows-freely');
			room.append(iSelector2Html.toHtml('.link-mark'));

			function _resize() {
				var css = _target.getBoundingClientRect();
				height = SCREEN.height;
				var vosh = room.attr(s_OFFSETHEIGHT);
				if (!_position || height - css.top - css.height < vosh) {
					top = css.top - 2 - vosh - 7
				} else {
					top = css.top + css.height + 2
				}
				room.css({
					top: Math.max(top, 0),
					left: css.left
				})
				return true;
			}
			dialog.onresize(_resize);

			if (+slow) {
				setTimeout(function () {
					room.show();
					_resize()
				}, slow);
			} else {
				_resize();
			}

		} else {
			iUserEventMap.auto.mix.animate(dialog, !dialog.isOwnSetting);
		}
		dialog.timer();
		return dialog;
	};
	//移除当前窗口
	function iCurrent(dialog) {
		var curr;
		if (dialog) {
			var count = Count;
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
			curr.cleartime();
			curr.bg.stop(true, true).animate({
				opacity: .1
			}, 10);
			curr.room.stop(true, true).animate({
				top: '-=30px',
				opacity: .5
			}, 400, function () {
				curr.destroy();
			});
		};
	};

	function iUserWindowResize() {
		SCREEN = $pickWidthHeight();
		for (var i in Dialogs) {
			$resize(Dialogs[i]);
		}
	}
	/**
	 * 
	 * @param {*} sel 
	 * @param {*} context 
	 */
	function iQuery(sel, context) {
		return new Query(sel, context)
	}
	// 新增事件监听
	iQuery(window).resize(iUserWindowResize).keydown(function (e) {
		if (e.keyCode === 27) iCurrent();
	});

	var rExport = {
		'attrs': iAttrs,
		'css': iCss,
		'attr': iAttr,
		'Query': iQuery,
		'showBox': iDialog,
		'show': iDialog,
		'list': Dialogs,
		'runer': iRuner,
		'merge': merge,
		'between': between,
		'each': each,
		'isString': isString,
		'resize': iUserWindowResize,
		'picker': picker,
		'getline': pickVarLine,
		'giveUHtmlBySelector': giveUHtmlBySelector,
		'selector2Html': selector2Html,
		'screen': function () {
			return SCREEN;
		},
		'remove': function (di) {
			iCurrent(di);
		},
		'confirm': function (title, content, callback, position) {
			return this.auto(CONFIRM_HTML, function (id, dialog) {
				// dialog.glass(true);
				var room = dialog.room;
				room.find('.confirm-title').html(title);
				room.addClass('dialog-confirm').find('.confirm-content').html(content);
				dialog.click('close', function (e) {
					dialog.remove();
					return false;
				});
				dialog.click('submit', function (e) {
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
				dialog.root.find('.content .close' + (time > 7 ? SPACE : ',.bg')).click(function () {
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
			if (isString(args)) {
				cs = args;
				args = {};
			} else {
				args || (args = {});
				cs = args.cs || SPACE;
			}
			var rainbox = iDialog(mode, function (id, dia) {
				// 初始化
				dia.runer(args.init, dia, id);
				dia.runer(callback, this, id, dia);
				// end
				dia.runer(args.last, dia, id);
				dia.onresize(resize);
				return true;
			});
			var rules = dialogAutoRules(cs.split(r_MULIT_SPLIT_SEP));
			rules instanceof Array && rules.sort(function (a, b) {
				return a.sort - b.sort
			});
			// 是否自由定位,非居中
			rainbox.isFree = args.center === false || r_IsNotCenter.test(cs);
			// 结束
			resize.call(rainbox, true);

			iRuner(args.end || function () {
				iUserEventMap.auto.mix.animate(this, true);
			}, rainbox);

			function resize(is1st) {
				this.is1st = !!is1st;
				var css4 = {}
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
	rExport.push(s_AUTO_KEY, 'inner', function (D, l, t, r, b, center, offset) {
		var room = D.room;
		var offsets;
		if (!(offsets = room.inneroffset)) {
			offsets = room.inneroffset = {};
			each([l, t, r, b], function (k, v, map, offsets, mk) {
				if (isNumber(v)) {
					offsets[mk[k]] = v >> 0;
				} else {
					var Q = room.find(v);
					var padding = iPaddings(Q);
					var margin = iMargins(Q);
					offsets[mk[k]] = Q.length ? margin.t + margin.b + padding.t + padding.b + (Q.attr(map[k]) >> 0) : 0;
				}
			}, aOffsetList, offsets, 'l,t,r,b'.split(','));
		}
		var css = {};
		var paddings = iPaddings(room);
		var BODY = room.iINNER || (room.iINNER = room.find(center)),
			cHeight = BODY.attr(s_OFFSETHEIGHT) >> 0,
			/* inner 滚动高度 */
			cScrollHeight = BODY.attr(s_SCROLLHEIGHT) >> 0,
			/* 窗口高度 */
			rHeight = room.attr(s_OFFSETHEIGHT) >> 0,
			rWidth = room.attr('scrollWidth') >> 0,
			wh = SCREEN.height - (offset >> 0),
			ww = SCREEN.width - (offset >> 0);
		var offsetY = offsets.t + offsets.b + paddings.t + paddings.b;

		css.width = ww >= rWidth ? s_AUTO : ww - paddings.l - paddings.r;
		css.height = cScrollHeight - offsetY > rHeight /* inner的实际高度 - 窗口偏移量 > 窗口高度 */
			|| cHeight > wh /* 窗口高度 > 可视范围 */
			? Math.min(cScrollHeight, (this.height || wh) - (offsetY)) : s_AUTO;
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
