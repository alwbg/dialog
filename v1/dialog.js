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
 * Mix-time : 2023-07-07 16:31:01 申时
 */
; (function (global, factory, nil) {
	global['global'] = global;
	if (typeof exports === 'object');
	else if (typeof define === 'function') define(/* AMD CMD */'dialog', factory);
	else {
		var Mo = { exports: {} };
		factory(nil, Mo.exports, Mo);
		global['dialog'] = Mo.exports;
	}
}(this, function (require, exports, module) {
	var Nil;
	var ID = 20160516;
	var QUERY_ID = ID;
	var n_DIALOGCOUNT = 0;
	// 模糊加载计数
	var n_BLUR_COUNT = 0;

	var eNode = document;
	var ddoc = eNode.documentElement;
	var isNotSupportFixed = /ie\s*(6|5)/ig.test(navigator.userAgent);
	//var isBlur      	= /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*(?:7|8|9|10)|webkit)/i.test( navigator.userAgent );
	var isIE = /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*)/i.test(navigator.userAgent);

	var r_ANYTHING = /\[object\s(\w+)\]/;
	// 提取属性时, 如果多个属性名 'height;line-height=>h'  'height|line-height=>h'
	var r_MULTI_SPLIT_SEP = /\s*[;|]\s*/;

	var r_SPLIT_KV = /\s*:\s*/;
	var r_A_Z = /((\d+)\-(\d+))/;

	var r_MULTI_SEL = /(?:\,|\|{2})/;
	var r_RE_KEY = /=>/;
	var r_MULTI_OR_RE_KEY = /(?:=>|,)/;

	var r_CSS2JS = /-([a-z])/g;

	var r_HasNumber = /^-?\d+(?:\.\d+)?/;
	var r_IsNumber = /^[-+]?\d+(?:\.\d+)?$/;
	var r_IsNotCenter = /(?:^|;\s*)center\s*:\s*false/;
	var r_SET_VALUE_OFFSET = /^\s*([\+\-\*\/])=(\d+)\w*/;
	/*数值属性*/
	var r_NUMBER_VALUE = /(height|width|top|left|bottom|right|size|radius|padding|margin|border)(?:\=|$)/i;
	var rSimplyBlock = /^(?:area|base|br|col|colgroup|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

	var fixed = isNotSupportFixed ? 'absolute' : 'fixed';

	var TAG_NAME = 'div';
	var EVENT_KEY = 'e-dialog';
	var SPACE = '';
	var DOT = '.';
	var ALL = '*';
	var $1 = '$1';
	var QUTO = ':';

	var sMIX = 'mix';
	/* 兼容IE事件属性 */
	var ePickLine = 'target;srcElement=>target';

	var s_PX = 'px';
	var s_DATA = 'data';
	var s_AUTO = 'auto';
	var s_NUMBER = 'number';
	var s_AUTO_KEY = 'auto';
	var s_NODELIST = '[object NodeList]';
	var s_HOVER_HAND = 'hover-show-hand';
	var s_SCROLLWIDTH = 'scrollWidth';
	var s_OFFSETWIDTH = 'offsetWidth';
	var s_OFFSETHEIGHT = 'offsetHeight';
	var s_SCROLLHEIGHT = 'scrollHeight';
	/* rExports.auto{cs: ...} 设置内边距*/
	var s_AUTOATTRS = 'inner: 0 0 0 0 .confirm-content 60;';
	var sLENGTH = 'length';

	var s_PICK_PADDING_4_CSS = 'paddingLeft|padding-left=>l,paddingTop|padding-top=>t,paddingRight|padding-right=>r,paddingBottom|padding-bottom=>b';

	var aIOrV = ['innerHTML', 'value'];
	var aFunNames = ["getAttribute", "setAttribute"];
	var aQuerySimplyOrMulti = ['querySelector', 'querySelectorAll'];

	// 配置
	var iUserEventMap = {};
	var Dialogs = {};
	var OBJECT_EMPTY = {};
	var DialogsRanks = [];

	/* 判断对象是否为空 */
	function isEmpty(O) {
		for (var _ in O) return false;
		return true;
	}
	/**
	 * 获取字符串类型
	 * @param  {object}   object 
	 * @return {String}          
	 */
	function iTypeTo(object) {
		return OBJECT_EMPTY.toString.call(object);
	}
	var sString = iTypeTo(SPACE); //'[object String]';
	var sWindow = iTypeTo(window);

	function iCreateElement(tagName) {
		return eNode.createElement(tagName || TAG_NAME);
	}

	function isSimplyType(data) {
		return /\[object (?:string|number|boolean|null|undefined|Symbol)\]/i.test(iTypeTo(data))
	}
	function isArray(data) {
		return data instanceof Array;
	}
	function isType(data, type) {
		return iTypeTo(data) == type;
	}

	function isString(data) {
		return isType(data, sString);
	}

	var isNodeList = function (nl) {
		return isType(nl, s_NODELIST) || isArray(nl);
	}
	/* 判断是否 */
	function iContent4Element(tagName) {
		return aIOrV[+/input|textarea/i.test(tagName)];
	}
	/**
	 * 转换数组
	 * @param {Object} args 
	 */
	function iList2Array(args) {
		return args && args.length === 1/*  && isDigital(args[0])  */
			? [
				/* 
					当args[0] == number 且 args.lenth == 1
					Array.apply(null, [0]) => 相当于 new Array(0) => [].length == number 
				*/
				args[0]
			]
			: Array.apply(Nil, args)/*= Array(args[0][, args[1], ..., args[n]]) */;
	}
	// 处理数值
	var iPickNumber = {
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
		TAG: 'tag',
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
		/* 
			((text|selector)) ((|selector)) ((selector))
			or
			((
				selector...
			))
		*/
		rPar: /\({2}\s*(?:((?:\(\+|\+\)|(?![\(\)]{2}|\|)[\w\W])+)\|)?((?:\(\+|\+\)|(?![\(\)]{2})[\w\W])+\s*)\){2}/g,
		/* (+tagName.class[attr]{inner}+) + => (+tagName.class[attr]{inner}+>)*/
		rSimplySelector: /\((\+?\s*(?:[#\.]?\w+|\[[^\[\]]*\]|\{[^\{\}]*\})+\+?)\)(?=\s*\+)/g,
		rIsForbid: /(?:[^\w-:~]+|^[\s]+)$/,
		rSimply: rSimplyBlock,
		/* 匹配换行 */
		rNL: /[\r\n]/,
		/* 匹配空格 */
		rWhite: /[\s]/,
		_default: {
			'#': [/#/, SPACE, ' id="$1"'],
			'.': [/\./, SPACE, ' class="$1"'],
			'[': [/\[/, SPACE, ' $1'],
			'tag': [/tag/g, 'span', function (tag, name, index) {
				return index - 1 && tag.indexOf(QUTO) >= 1 ? (
					name = tag.split(QUTO), name[0]
				) : tag
			}, $1],
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
			var htmls = this.xcode(str.replace(this.rSimplySelector, '($1>)'), 0, inner).parent;
			return htmls == -1 ? str : this.build(htmls);
		},
		build: function (Keys) {
			var val, sdefault;
			var hMode = this.aMode[+this.rSimply.test(Keys.tag.join(SPACE))];
			var key, _default = this._default;
			var ins = this.INDEXS,
				mark = 0, ks;
			for (var index = 0, length = ins.length; index < length; index++) {
				key = ins[index];
				val = Keys[key].join(SPACE);
				if (!mark && length - index == 1) {
					hMode = val;
				} else {
					sdefault = _default[key];
					ks = val ? val.replace(this.rVal, sdefault[index ? 2 : 3]) : sdefault[1];
					hMode = hMode.replace(sdefault[0],
						/* index == 0 <===> tag */
						index
							?
							val
								?
								ks
								:
								sdefault[1]
							:
							sdefault[2].bind(Nil, ks)
					);
				}
				mark += +!!val;
			}
			return hMode;
		},
		xcode: function (source, start, inner, parent) {
			var sim, key, isClz;
			var data = this.factory();
			var quto = 0,
				_break, isBlockStart;

			var ID = this.ID,
				ATTR = this.ATTR,
				INNER = this.INNER,
				CLAZZ = this.CLAZZ,
				CHILD = this.CHILD,
				SIBLING = this.SIBLING,
				INNEREND = this.INNEREND,
				BEND = this.BLOCKEND,
				BLOCK = this.BLOCK,
				QUTO = this.QUTO,

				rNewLine = this.rNL,
				rWhite = this.rWhite;

			var inInnerMark = 0;
			var isInnerText = false,
				isNewLine = false;

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
				if ((
					/* 换行 */
					rNewLine.test(sim) && (isNewLine = true)
				) || (
						/* 判断是否为换行后的空格(s) */
						isNewLine && rWhite.test(sim)
					)
				) {
					continue;
				} else {
					isNewLine = false;
				}
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
						isBlockStart = false;
						break;
					case ATTR /*[*/:
						key = sim;
						isBlockStart = true;
						break;
					case CLAZZ /*.*/:
						isClz = false;
					case ID /*#*/:
					case INNER /*{*/:
						if (!isBlockStart) {
							sim == INNER && (isInnerText = true);
							key = sim;
						} else {
							picker.push(sim);
							isClz = !false;
						}
						break;
					case CHILD:
					case SIBLING:
					case BLOCK:
					case BEND:
						// 判断跳出条件
						if (_break = inner /* 判断是否为起始, 开启时 inner === undefined */
							&& ( /*Is Block End, Index Plus*/
								(sim != CHILD && CHILD == parent) || (sim == BEND && index++)
							)) {
							break;
						}
						start = index + 1;
						var da = this.xcode(source, start, this.rPar, CHILD /*标记当前为子类*/);
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
				// 核验TAG有效性
				if (key == this.TAG && this.rIsForbid.test(data.tag.join(SPACE))) return { parent: -1 };
			}
			if (inner !== this.rPar) {
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
	var iGetCss = [
		/**
		 * 获取匹配name的输出格式
		 * @param {String} x 匹配的字符串
		 * @param {RegExp} regexp 匹配 xxx-name-key => name-key
		 * @returns nameKey
		 */
		function (x, regexp) {
			return regexp._test(x), css2js(_RegExp.$1);
		}, function (x) {
			return x;
		}
	];
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
		target || (target = {});
		var execz = iGetCss[+(hasprefix === true)];
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
						json[execz(v.name, prefixReg)] = v.value;
					}
				}
			}
			attrs = json;
		}
		return iPicker(attrs, css2js(key || ALL));
	}
	/**
	 * 设置 和 获取 Node 属性
	 * 'data-index|index=>index,tx'  --- {index: xx, tx:xx}
	 * @param {Node} target 
	 * @param {String} key 
	 * @param {Object} val 
	 */
	function iSetGetAttr(target, key, val) {
		isFunction(val) && (val = val.call(target, key, target));
		/* 删除属性 */
		if (val === null) return target.nodeType == 1 && target.removeAttribute(key);
		var isGet = isNil(val);
		var fname = aFunNames[+!isGet];
		var isNode = target[fname],
			value;
		if (isGet) {
			/* 指定属性名返回处理 和 多属性返回 */
			if (r_MULTI_OR_RE_KEY.test(key)) {
				return iMultiOrReKeys(key.split(r_MULTI_SEL), function (v, i, name, data) {
					i = iSetGetAttr(target, v);
					if (i) return data[name] = i, true;
				})
			}
			var data = (isNode && target[fname](key)) || target[key];
			return isNil(data) ? null : data;
		};
		isNode &&
			(
				/* SVG element[width, height,viewBox] != Undefined  = [string SVGAnimated...] */
				isNil(value = target[key])
				||
				/* 判断属性是否为基本数据类型, 如果为非基本数据类型, 调用setAttitude */
				!isSimplyType(value)
			) ?
			target[fname](key, val) : (target[key] = val);
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
	 * @param {String} _ 源
	 * @param {String} $1 匹配的正则内的(xx)
	 */
	function iFxInnerReplace(_, $1) {
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

	// function js2css(css) {return css.replace(/([A-Z])/g, '-$1').toLowerCase();}
	/* 单个对象设置 */
	function iSetStyle(target, key, value, suffix) {
		if (target.nodeType == 1) {
			if (r_CSS2JS.test(key)) key = css2js(key);
			if (r_NUMBER_VALUE.test(key)) {
				if (r_SET_VALUE_OFFSET._test(value)) {
					value = iRuner(mOffsetFuncMap[_RegExp.$1], Nil, _RegExp.$2, _style(target, key, s_NUMBER)[key] >> 0);
				}
				if (r_IsNumber.test(value)) value = value + (suffix || s_PX);
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
	var ArrayFunxName = ['shift', 'pop', 'unshift', 'push'];
	/**
	 * 实现继承扩展 merge( O1, O2, O3[,...], data# 要扩展数据 #, cover# 是否覆盖添加 # )
	 * [宿主]或[目标]至少有一个长度为1 [1,2,3,4] <= [5] | [1] <= [2,3,4,5] = 末尾参数为 [mix|one|first] 字符串
	 */
	function merge(s, o, e, i) {
		var cover, args;
		/* 格式化参数 */
		args = iList2Array(arguments);
		/*获取最后一位*/
		cover = args.pop();
		var revers = false;
		if (/^mix|one|first$/i.test(cover)) {
			revers = true;
			cover = args.pop();
		}
		/*是否是boolean类型*/
		if (!/^false|true$/ig.test(cover)) {
			/* 归位 */
			args.push(cover);
			//默认不替换
			cover = false;
		}
		// 导流
		var source = [[args[ArrayFunxName[+!revers]]()]];
		// 添加 [宿主] 或者 [来源]
		source[ArrayFunxName[+revers + 2]](args);
		// 第一层遍历宿主 一对多, 或者多对一
		each(source[0], function (k, v) {
			// 遍历来源, 当来源为多个时
			each(source[1], function (key, v, host) {
				// 遍历[宿主]是否含有[目标]属性
				for (key in v) {
					if (cover || !(host.hasOwnProperty && host.hasOwnProperty(key))) {
						host[key] = v[key];
					}
				}
			}, v)
		})
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
		var msg;
		if (!isArray(rank)) {
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
			var rank = iToCutByDot(varline);
			var first = head = rank[0];
			if (first in local) box = local; // 先确认入口, 是模板对象还是全局对象
			else box = global;
			var i = 0,
				l = rank.length;
			for (; i < l; i++) {
				if (vs = box[rank[i]]) {
					if (vs instanceof Function) vs = vs.call(box);
					if (i != l - 1) box = vs; // 存储链式对象上线文
					continue;
				}
			}
		} else {
			vs = data;
			box = local;
		}
		data = {
			head: head,
			data: vs,
			parent: box // 获取上层对象
		}; // 缓存数据关联
		return data;
	}
	/* @see iReplace(...) {\d-\d}匹配提前 $1 $2, 和{prop}部分匹配冲突, 当prop内含有 - 号时*/
	var rFormat = /(?:{(\d+)\-(\d+)}|\[([\w-]+)\]|\{([^,{}\[\]]+)\}|\[([^\[\]\{\}'"]+)\]|([\w$]+)((?:=|:\s*))\?)|{([^,\}\{]+),([^,}]*),([^,}]*)}/g;
	var rFormatSp = /(?:,)/;
	var iInnerFunx = {
		now: function () { return +new Date; }
	}
	// 关键词
	var KEYWORD = /(?:\W|^)(?:var|let|const|in|while|for|of|this|true|false)\W+/ig;
	/* (expr[+-!] | name [expr] | name ? [true] : [false]) name2*/
	var rEXPR = /(?:[\+\-\!]+|[_$\w]+\s*[><=%\+\-\*/|&!^]|\?\s*[_$]*\w+\s*\:)\s*[_$\w]+/;
	// 获取表达式对应的值
	function _GetExp2funcValue(exp, data, propertys) {
		var ex, invalid;
		if (rEXPR.test(exp)) {
			var afunArgs = exp.replace(KEYWORD, SPACE).match(/([a-z_$]+\w*)/ig) || [], picker = [];
			each(afunArgs, function (_, k, picker, data) {
				picker.push(data[k]);
			}, picker, data);
			ex = new Function(
				// 参数
				afunArgs.join(','),
				// 返回值
				'return ' + exp
			)/* 调用 */.apply(Nil, picker);
		} else {
			ex = (invalid = isNil(ex = data[exp])) && propertys && /^[_$]*[\w]+$/.test(exp) ? propertys : (!invalid ? ex : propertys || exp);
			if (isFunction(ex)) {
				ex = ex.apply(data, isArray(propertys) ? propertys : isNil(propertys) ? Nil : [propertys])
			}
		};
		return ex;
	}
	/**
	 * @see rFormat
	 * @returns String
	 */
	function iReplace(source /*正则匹配的字符串*/, a /*开始取值范围*/, z /*结束*/,
		arg /*属性 [arg]*/, prpo/* {arg1}, {expr...} */,
		list /*数组 [a, b, c]*/,
		attr /*属性名称 attr=? 替换?为attr对应的属性值 配合后面 eq*/, eq /*等号*/,
		_if, _true, _false
	) {
		var args = this, _G = args._groups__;
		if (_G && source in _G) return _G[source];
		// 判断是否为数值
		if (/^\d+$/.test(a + z)) {
			return between(a, z);
		}
		/* 处理类似三目运算  exp(?)true(:)fasle `{true|false|props, value1, value2}` */
		if (_if) {
			return _GetExp2funcValue(
				_GetExp2funcValue(_if, args)
					? _true
					: _false,
				args
			);
		}
		var val;
		/*是否为数组 处理 `[first, ...]`*/
		if (list) {
			list = list.split(rFormatSp);
			/* [first, 2, 3, ...] first instanceof Function ? first(2, 3, 4,...) */
			val = isFunction(args[list[0]])
				?
				args[list.shift()].apply(args, list)
				:
				list[between(0, list.length - 1)];
			return val;
		}
		var key = prpo || arg || attr;
		attr || (attr = SPACE, eq || (eq = SPACE));
		if (args && key) {
			var r = Math.random();
			val = _GetExp2funcValue(key, args, r);
			return val == r ? source : attr + eq + val;
		}
		_G[source] = source;
		return source;
	}
	/**
	 * 字符串格式化 
	 * 'key=?|[val]|{1-19}|[1,2,3]'.format({key:1,val:2})
	 * key=1|2|3(1-19随机)|2(1,2,3)随机一个
	 * @Time   2018-11-13
	 */
	function iStringFormat(args) {
		var host = this, k2 = arguments.length,
			/* 判断宿主是否依附在 String.prototype 下 */
			notInString = !isString(host) && isString(args);
		if (
			/* 2022-11-07 判断参数是否为format(String, {key: value} | [...] | 1, 2, 3, 4, 'a') */
			k2 > 1
			|| isSimplyType(args)
		) {
			args = iList2Array(arguments);
			if (notInString) {
				// 获取处理对象字符串
				host = args.shift();
				if (args.length == 1 && !isSimplyType(args[0]) /* 非基本类型 */) args = args.shift();
			}
			/* 功能分流 处理 caller('?............? ?', 1, 2, 3) */
			if (/[?]/.test(host) && isArray(args))
				return TextFormat(host, args);
		}
		args || (args = {});
		var has = !!args.now;
		merge(args, iInnerFunx);
		args._groups__ = {};
		// 替换字符串内参数,区间等
		var ret = (host + SPACE).replace(rFormat, iReplace.bind(args));
		delete args._groups__;
		has || (delete args.now);
		return ret;
	}
	/**
	 * 字符串格式化输出
	 */
	String.prototype.exec = String.prototype.format = iStringFormat;
	function between(a, z, callback, brimless/* 无边缘 */) {
		if (isString(a)) {
			if (r_A_Z._test(a)) {
				a = _RegExp.$2;
				z = _RegExp.$3;
			}
		}
		var min, max, edge = +!!brimless;
		if (+a < +z) {
			min = +a;
			max = +z;
		} else {
			min = +z;
			max = +a;
		}
		var lof = (max - min) + 1 - 2 * edge;

		if (isFunction(callback)) {
			while (lof-- > 0) {
				if (iRuner(callback, null, min + lof + edge, max, min)) break;
			}
		} else {
			return (Math.random() * 1e6 >> 0) % lof + min;
		}
	}
	function giveUHtmlBySelector(selector) {
		return selector.replace(iSelector2Html.rPar, function (_source, inner, selector) {
			return iSelector2Html.toHtml(selector, inner);
		})
	}
	function iMultiOrReKeys(rule, filter) {
		var rain = {};
		// 遍历规则
		each(rule, function (keys, value, picker, filter, _) {
			// 获取输出key (key1;key2)=>key
			value = value.split(r_RE_KEY);
			// [key1,key2]
			keys = value[0].split(r_MULTI_SPLIT_SEP);
			// 遍历keys列表
			_(keys, function (i, v, value, filter, data, length) {
				return iRuner(filter, Nil, v, i, isNil(value) ? v : value, data, i + 1 == length /* if is last element */);
			}, value[1], filter, picker, keys.length);

		}, rain, filter, each);
		return isEmpty(rain) ? Nil : rain;
	}
	/**
	 * 循环
	 * @Time   2019-11-07
	 * @param  {Number}   _    索引
	 * @param  {Object}   simply 对象
	 * @param  {Array}   rule   规则
	 * @param  {Array}   picker 携带筛选后的对象列表   
	 */
	function iPickByRule(_, simply, rule, picker, type, filter) {
		var source = iMultiOrReKeys(rule, function (v, i, name, data) {
			var iChange, isAllPick = /(?:(?:(.*).|)\*$|\*\.)/._test(name);
			// 处理 data.*=>own.* 其中*是被复制
			isAllPick && (iChange = _RegExp.$1) && (data = iGetDataByLine(iChange, data, {}));
			i = iGetDataByLine(v, simply, false);
			if (isAllPick) return merge(data, i || simply), Nil;
			// if (i === SPACE) i = Nil;
			// 按照顺序获取直到找到存在的对应key
			if (!isNil(i)) {
				var fi = iRuner(iPickNumber[type && type[name] || type], Nil, i), rData, iFiDate;
				i = isNumber(fi) ? fi : isNil(fi) ? i : Nil;
				iFiDate = isNil(rData = iRuner(filter, data, name, i));
				if (!(isNil(i) && iFiDate)) data[name] = iFiDate ? i : rData;
				return true;
			}
		});
		isNil(source) || picker.push(source);
	}

	function picktype(O) {
		return iTypeTo(O).replace(r_ANYTHING, $1);
	}

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
			context: context || source /* || source 2022-11-02 */
		}, source, func, iList2Array(arguments));
	}
	var _RegExp;
	/**
	 * RegExp.$1....弃用的备用方法
	 * 在字符串this中, 提取RegExp定义的(xx)中获取的xx $1, $2
	 * @param {String} string 
	 * @returns true|false
	 */
	RegExp.prototype._test = function (string) {
		this.global && (this.lastIndex = 0);
		var pick = string != Nil ? this.exec(string) : Nil;
		_RegExp = {};
		return pick && pick.length ? (
			each(pick, function (_, v) {
				_ != 0 && (this['$' + _] = v || SPACE);
			}, _RegExp),
			true
		) : false;
	}

	var RuleSort = {};
	var RuleSortLength = 0;
	each('margin,offset,inner'.split(r_MULTI_SEL), function (k, v, map) {
		map[v] = k;
		RuleSortLength++;
	}, RuleSort)
	function iDialogAutoRules(list, rules) {
		!rules && (rules = []);
		each(list, function (k, val, list, RuleSort,/* 临时变量 ->> */ kv, v, vs, vk) {
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
	function formatPickerRule(picker) {
		return picker.replace(/((?:^|,)(?:(?!\=\>|,).)*(\*)(?=,|$))/g, '$1=>$2');
	}
	/**
	 * 提取指定属性名称的值
	 * @Time  2018-11-15
	 * @param {Object}   source 源数据
	 * @param {String}   rule   要提取的列表
	 * @param {String|Boolean}   type   number|int|float  true? 遍历数组索引
	 * @param {Function}   filter   过滤函数
	 */
	function iPicker(source, rule, type, filter) {
		if (rule == ALL) return source;
		var trigger;
		if (isArray(rule)) {
			rule = rule.join(DOT);
			trigger = rule;
		} else if (!isString(rule) || isEmpty(source)) return {};
		var rainbox = [],
			isArr = !(type === true || filter === true) && isArray(source), data;
		isArr || (source = [source]);
		// 遍历队列
		each(source, iPickByRule, formatPickerRule(rule).split(r_MULTI_SEL), rainbox, type, filter);
		data = isArr ? rainbox : rainbox.pop() || {};
		return trigger ? data[trigger] : data;
	}
	// 获取样式列表
	var _style = eNode.defaultView ?
		/**
		 * @param {Node} dom DOM对象
		 * @param {String|Undefined} attr 属性 'height;line-height=>h'
		 **/
		function (dom, attr, type) {
			return iPicker(
				dom.nodeType == 1 ?
					r_HasNumber.test(dom.style[attr]) ?
						dom.style
						:
						eNode.defaultView.getComputedStyle(dom, SPACE)
					:
					{},
				attr || ALL, type);
		} : function (dom, attr, type) {
			return iPicker(dom.currentStyle, attr || ALL, type);
		}

	function Query(sel, context, multi) {
		/* 设置个体(单一返回, 数据为1)结果集 */
		if (context === false && (multi = false, context = Nil, true));
		else {
			multi = multi === Nil ? true : multi
		}
		if (sel instanceof Query) return multi === false ? sel.first() : sel;
		if (!isNaN(+sel)) return this;

		Selector.call(this, sel, context, multi);

		this.length = this.result.length;
		this.animateTasks = [];
		each(this.result, function (i, v, host) {
			/* 设置观察者 */
			iListener(host, i, {
				first: i,
				context: host,
				get: function (first) {
					return this.result[first];
				}
			}, host);
		}, this);
	}
	var rSimplyStringHtml = /^<(\w+)\s*([^>]*)(?:\/|>((?:(?!\<\/\1)[\w\W])*)<\/\1|)>$/;
	var rStringHtml = /<\w[^<\>]*>/i;
	/**
	 * @param {String} sel 选择器
	 * @param {String|Node|Boolean} context 上下文  if context === true sel.buildHtml(true) 转换为html字符串
	 * @param {Boolean} multi 是否多选
	 */
	function Selector(sel, context, multi) {
		if (!sel) return this.result = [], this;
		var _;
		/* 创建Elements */
		if (isString(sel) && (
			(
				context === true && (
					/* 选择器类型的HTML字符串 转换为html字符串*/
					sel = sel.buildHtml(true)
				)
			)
			||
			rStringHtml.test(sel)
		)) {
			_ = iSelectorOrHtmlstring2Element(sel);
		} else {
			/* 查找Elements */
			context || (context = this.result);
			var selType;
			if (isArray(sel)) {
				_ = sel;
			} else if (
				sel.nodeType == 1/* element */
				||
				sel.nodeType == 9/* document */
				||
				(
					selType = iTypeTo(sel),
					selType == sWindow
				)
			) {
				_ = [sel];
			} else {
				_ = iQuerySelectorByString(this, sel, context, multi);
			}
		}
		this.result = _.nodeType ? [_] : iList2Array(_);
		return this;
	}
	var rHasDigitalId = /#(\d+)\w*\s*/;
	/* >.child .childs */
	var rNoHostSelector = /^(?:>)\s*(?:([^\s]+))(?:\s+(.*))?/;
	/**
	 * #see new Selector(sel [, context, multi]);
	 * @param {Query} host 宿主
	 * @param {String} sel 选择器
	 * @param {String|Node} context 上下文
	 * @param {Boolean} multi 是否多选
	 */
	function iQuerySelectorByString(host, sel, context, multi) {
		var source, _, idElement;
		if (context != SPACE && isString(context)) {
			context = Selector.call(host, context, Nil, multi);
		}
		if (context && (isNodeList(source = context.result || context))) {
			each(source, function (_, v, self, items, sel) {
				v = Selector.call(self, sel, v, multi);
				v = iList2Array(v.result);
				items.push.apply(items, v);
			}, host, _ = [], sel);
		} else {
			if (!isString(sel)) return [sel];
			context || (context = eNode);
			var queryName = aQuerySimplyOrMulti[+!!multi];
			/* querySelector[All]不支持数字id */
			if (rHasDigitalId._test(sel) && (idElement = eNode.getElementById(_RegExp.$1))) {
				sel = sel.replace(rHasDigitalId, SPACE);
				context = idElement;
			}
			// 简写first-child, last-child, nth-child(2n), nth-last-child(2n), only-child
			sel = sel.replace(/(\:(?:first|last|only|nth|nth-last))(?:\s|$|(\([^\)]+\)))/g, '$1-child$2')
				/* [attr=text] => [attr="text"] */
				.replace(/(\[[^=]+=)([^"']+)(\])/g, '$1"$2"$3');
			var childSel;
			/* querySelector* 不支持无主子类查询   [>~+].class 只处理子类 */
			if (childSel = sel.match(rNoHostSelector)) {
				if (childSel[2]) {
					/* 2. 后,在上层结果集中查找剩余[`>div span`]后的span */
					return iQuerySelectorByString(host, childSel[2],
						/*1. `>div span` 查找子类div的集合 */
						iQuerySelectorByString(host, childSel[1], context, multi),
						multi);
				}
				_ = iElementsIs(iList2Array(context.childNodes), childSel[1]) || [];
			}
			/* + ~ 如想支持, 分支处理 */
			_ = _ || (context[queryName] && context[queryName](sel)) || [];
		}
		return _;
	}
	/**
	 * 选择器或者HTML字符串转Elements
	 * @param {String} selector 
	 */
	function iSelectorOrHtmlstring2Element(selector) {
		var isSimply = rSimplyStringHtml._test(selector);
		var target = iCreateElement(isSimply ? _RegExp.$1 : 0);
		if (isSimply) {
			var attr = _RegExp.$2;
			var html = _RegExp.$3;
			iString2KeyValue(attr, function (k, v) {
				this[k] ? this[k](this._, v, true) : this.$(this._, k, v);
			}, { 'class': iClass, $: iAttr, _: target });

			return iHtml(target, html).result;
		} else {
			target.innerHTML = selector;
			return iList2Array(target.childNodes);
		}
	}

	function iExecSimply(query, key, value, filter, _/* each */) {
		return query.each(function (i, target, value, _, query, isstring) {
			return isstring ?
				iRuner(filter, Nil, key, value, target, query, isstring/* , value */)
				:
				_(key, filter, target, query, isstring, value);
		}, value, _, query, isString(key))
	}
	var mOffsetFuncMap = {};
	each(['+', '-', '*', '/'], function (_, v) {
		this[v] = new Function('to, cur', 'return +cur' + v + ' +to;');
	}, mOffsetFuncMap);

	var CLASSMAP = {};
	function rClassInElement(clazz, gl) {
		gl || (gl = SPACE);
		var cName = clazz + gl;
		return CLASSMAP[cName] || (CLASSMAP[cName] = new RegExp('(?:(?:^|\\s+)' + clazz + '(?:\s*$|(\\s)+))', gl || 'g'));
	}
	function iClass(target, clazz, isadd) {
		if (!target || target.nodeType != 1) return;
		var sim = {
			clazz: target.className
		};
		if (!isString(sim.clazz)) return;
		each(clazz.split(/\s+/), function (_, v, target, r) {
			if (v == SPACE) return;
			r = rClassInElement(v);
			var cls = target.clazz;
			if (/undefined|false|null/.test(isadd)) target.clazz = cls.replace(r, $1); else {
				if (cls.search(r) < 0) {
					target.clazz = (cls == SPACE ? SPACE : cls + ' ') + v;
				}
			};
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
				if (append !== true) {
					v[iContent4Element(v.tagName)] = SPACE;
				}
				_(items, function (_, v, room, execFunc) {
					execFunc(room, v);
				}, v, ef);
			}
		}, element, execFunc || new Function(), each);
	}
	var s_QueryEventKey = '[' + EVENT_KEY + ']';

	function string2map(str, split, def) {
		var ret = {};
		each(str.split(split || '&'), function (k, v, ret) {
			var kv = v.split('=');
			k = kv[0];
			if (k !== SPACE) ret[k] = kv[1] || def;
		}, ret);
		return isEmpty(ret) ? SPACE : ret;
	}
	/**
	 * 删除事件 
	 * @param {Query} house 
	 * @param {String|Function|Boolean} _EOrCaller 回调, 删除的事件名称 当为TRUE时删除自身
	 */
	function iRemoveEvent(house, _EOrCaller) {
		var child;
		// 检查是否为指定删除事件
		var eMap = isString(_EOrCaller) ? string2map(_EOrCaller, /\s+/g, true) : _EOrCaller === Nil ? true : SPACE;
		if (eMap) {
			child = house;
		} else {
			child = house.find(s_QueryEventKey);
			// 添加上下文到查询列表
			Array.prototype.unshift.apply(child.result, house.result);
		}
		var _delE = eMap !== true && eMap;
		child.each(function (k, element,
			events/* 全局事件 */,
			ownevents/* 自身事件Map */,
			iGetEventMark, eMap, _) {
			// 获取事件key
			var key = iGetEventMark(element), event = events[key];
			_(event, function (k, v, target, event, own, eMap, _) {
				if (eMap && !(k in eMap)) {
				} else {
					delete event[k];
					delete own[k];
					_(v, function (k, v, target, name) {
						iEvents.removeEventListener(target, name, v);
					}, target, k)
				}
			}, element, event, ownevents, eMap, _);
			eMap || delete house[key];
		}, house.events || {}, house.E || {}, iGetEventMark, _delE ? eMap : SPACE, each);

		house.each(_EOrCaller);
	}
	var _KeysMap = {};
	function isSimplyData(data, key) {
		var ks;
		return key && (_KeysMap[key] != Nil || !r_MULTI_SEL.test(key)) ? (
			ks = (_KeysMap[key] ||
				(
					ks = key.split(r_RE_KEY),
					_KeysMap[key] = ks[1] || ks[0]
				)
			), data[ks]
		) : data
	}
	var rProperty = /([@*\w-.]+)=(?:("|')((?:(?!\2).)*)\2|([^=&\s]*))/;
	var mElementTagClassId = {
		'.': function (k, target) {
			return rClassInElement(k, 'i').test(target.className);
		},
		'[': function (k, target, result, _) {
			if (rProperty._test(k)) k = _RegExp.$1, _ = _RegExp.$3 || _RegExp.$4;
			else _ = null;
			result = iAttr(target, k);
			return _ != null ? result === _ : null != result;
		},
		'#': function (k, target) {
			return target.id == k;
		},
		tag: function (k, target) {
			return k.toUpperCase() == target.tagName
		},
		'{': function () { return false }
	}
	/**
	 * 规则查询, 是否含有规则内的数据
	 * @param {Array|Node} elements 检索的列表或对象
	 * @param {String} selector 检查的规则
	 * @param {Boolean} multi 是否上游查找
	 */
	function iElementsIs(elements, selector, multi) {
		var ranks;
		if (selector != Nil && !/\s+/.test(selector)) {
			ranks = [];
			var
				sim, index = 0, checkrank = [],
				tasks = isArray(elements) ? elements : [elements],
				code = iSelector2Html.xcode(selector, 0);
			each(code.parent, function (k, sel, checkrank) {
				if (sel.length) {
					var last = sel.pop();
					r_MULTI_SEL.test(last) || sel.push(last);
					checkrank.push(function (k, target) {
						/* 判断选择器, 如果匹配返回 undefined, 否则返回相应的的数据 @see iRuner([Fcuns,...]) */
						return iRuner(this, Nil, k, target) === true ? true : Nil;
					}.bind(mElementTagClassId[k], (k == DOT && sel.shift(), sel.join(SPACE))));
				}
			}, checkrank);
			// 多对象队列处理
			while (sim || (sim = tasks[index++]/* 当sim == Nil? 取一下条数据 */)) {
				if (iRuner(checkrank, Nil, sim)) {
					ranks.push(sim);
					sim = Nil;
					continue;
				}
				sim = multi /* within 溯源 */ ? sim.parentNode : Nil;
			}
		}
		return ranks;
	}
	// Node是否是选择其描述的
	function iElementIs(sel, target) {
		return iElementsIs(target, sel).length ? target : Nil;
	}
	/* 设置或获取填充 */
	function iPackHtml(html) {
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
	}
	/**
	 * 判断触发事件是否应该触发自带方法
	 * @param {Node} v 
	 * @param {String} name 事件名称
	 * @returns 
	 */
	function isTriggerOwnEvent(v, name) {
		return /input|textarea|bottom/i.test(v.tagName) || /focus/.test(name);
	}
	// 切换兄弟节点
	function changeyourbrother(v, next) {
		return iPicker(v, next ? 'nextElementSibling|nextSibling=>node' : 'previousElementSibling|previousSibling=>node');
	}
	// 兄弟节点查询
	function brother(next) {
		var result = [];
		this.each(function (_, v, result, node) {
			node = changeyourbrother(v, next).node;
			if (node) result.push(node);
		}, result);
		return iQuery(result);
	}
	// Element替换为指定对象
	var iNodeReplaceWith = [/* polyfill 补充不足 */function (node, element) {
		var parent = node.parentNode;
		parent && (parent.insertBefore(element/* new element */, node), parent.removeChild(node));
	}, function (node, element) {
		node.replaceWith(element);
	}][+('replaceWith' in ddoc)];

	Query.prototype = {
		events: {},
		html: iPackHtml,
		on: function (name, selector, fc) {
			var trigger = selector instanceof Function ? selector : function (e) {
				var target;
				if (target = iWithIn(selector, e.target)) {
					fc.call(target || this, e);
				}
			}
			each(name.split(r_MULTI_SPLIT_SEP), function (k, v) {
				iEvent(v).call(this, trigger);
			}, this)
			return this;
		},
		next: function () {
			return brother.call(this, true);
		},
		prev: function () {
			return brother.call(this);
		},
		first: function () { return iQuery(this.result[0]); },
		unbind: function (funx) { return iRemoveEvent(this, funx), this; },
		is: function (sel) {
			if (/^\:visible$/.test(sel)) {
				return this.each(function (_, v) {
					if (v.offsetHeight == 0 && v.offsetWidth == 0) return false;
					else return true;
				})
			} else
				return iElementsIs(this.result, sel).length > 0;
		},
		appendTo: function (element) { return iQuery(element).append(this.result), this; },
		append: function (element) {
			return iHtmlOrAppend(this.result, element, function (target, v) {
				target.appendChild(v);
			}, true), this;
		},
		parent: function (sel, index) {
			var result = [];
			this.each(function (_, element, picker, isStr, sel, pare) {
				pare = isStr ? iWithIn(sel, element) : element.parentNode;
				pare && picker.push(pare);
			}, result, isString(sel), sel);
			return iQuery(result, Nil, index);
		},
		insert: function (element, isAfter) {
			var child = iQuery(element, Nil, 0);/* 获取第一个元素 */
			var parent = child.parentNode;
			if (parent && this.length) {
				this.each(function (_, element, child) {
					/* 插队 */
					parent.insertBefore(element, child);
				}, child)
			}
			if (isAfter) {
				var move = this[this.length - 1], next = move.nextSibling;
				/* 不服,反插 */
				parent.insertBefore(child, /* next ||  */move || next);
				next || parent.insertBefore(move, child);
			}
			return this;
		},
		/**
		 * 停止动画
		 * @param  {Boolean} isStopAll  是否停止所有动画
		 * @param  {Boolean} isToEnd  是否执行完成设置样式
		 */
		stop: function (isStopAll, isToEnd) {
			var tasks = this.animateTasks;
			var task;
			while (task = tasks.shift()) {
				task.run(0, isToEnd ? 'true' /* 执行完成 */ : 'false' /* 立刻停止 */);
				if (!isStopAll) break;
			}
			return this;
		},
		attr: function (key, val) {
			return iExecSimply(this, key, val, function (k, v, target) {
				return iSetGetAttr(target, k, v);
			}, each);
		},
		/**
		 * @param {JSON|String} key 
		 * @param {String|Number|Boolean|Undefined} val 
		 */
		css: function (key, val) {
			return iExecSimply(this, key, val, iCssGetSet, each);
		},
		find: function (sel/* , context, multi */) {
			var child = iQuery(sel, this.result);
			child.length = Array.prototype.unshift.apply(child.result, iElementsIs(this.result, sel));
			return child;
		},
		addClass: function (clazz) {
			return this.each(function (k, target, clazz, _) {
				_(target, clazz, true);
			}, clazz, iClass)
		},
		removeClass: function (clazz) {
			return this.each(function (k, target, clazz, _) {
				_(target, clazz);
			}, clazz, iClass)
		},
		remove: function () {
			return iRemoveEvent(this, function (k, target) {
				target.parentNode && target.parentNode.removeChild(target)
			}), this;
		},
		data: function (key, prefix) {
			var data = this.each(function (_, target, attrs, keys, prefix, rJsonSring) {
				/* 获取相应属性, data-set */
				var rData = isSimplyData(attrs(target, keys, /* Nil,  */prefix), keys);
				return rData === Nil || isString(rData) ?
					(
						rJsonSring.test(rData) ? JSON.parse(rData) : rData
					) :
					(
						each(rData, function (k, v, so) {
							so[k] = rJsonSring.test(v) ? JSON.parse(v) : v;
						}, rData = {}),
						rData
					);
			}, iAttrs, key, prefix, /^(?:\[.*\]|{.*})$/);
			return this == data ? Nil : data;
		},
		animate: function () {
			var tasks = this.animateTasks;
			var task = new AnimateTask({
				host: this,
				rank: this.result,
				config: iPicker(arguments, '0=>attributes,1.speed|1=>speed,1.easing=>easing,1.callback|2=>callback', { speed: s_NUMBER }, true)
			})
			task.run(tasks.push(task) - 1);
			return this;
		},
		trigger: function (name) {
			return this.each(function (_, v, name) {
				try {
					var execFx = iPicker(v, name)[name];
					if (isTriggerOwnEvent(v, name) && execFx) iRuner(execFx, v);
					else {
						var event = eNode.createEvent("Events");
						event.initEvent(name, true, true);
						v.dispatchEvent(event);
					}
				} catch (e) {
					eNode.all && v.fireEvent('on' + name);
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

	function AnimateTask(config) {
		each(config, function (k, v) {
			this[k] = v;
		}, this)
	}
	function iFlash(key, from, to, target, host, iMap) {
		var current, distance = to - from, speed = this.speed;
		if ((current = Date.now() - this.ms) >= speed) {
			clearInterval(iMap[key]);
			current = speed;
			this.count--;
			if (this.count == 0) {
				host.animating = false;
				iRuner(host.step, host, to);
				iSetStyle(target, key, to);
				iRuner(this.callback);
				var aTask = host.animateTasks;
				aTask.shift();
				if (aTask.length > 0) {
					return aTask[0].run(0);
				}
				else return;
			}
		}
		var di = distance * current / speed;
		var valueOfEasing = iRuner(this.easing, host, di / distance, key);
		if (valueOfEasing != Nil) di = valueOfEasing * distance;
		iRuner(host.step, host, from + di, key);
		iSetStyle(target, key, from + di);
	}
	/**
	 * 内部循环
	 * @param {Int} k 索引
	 * @param {Object} v 索引对应的值
	 * @param {JSON} config  {
	 * 		host:	{Query}  @see Query
	 * 		attributes:	{JSON}  设置的阐述
	 * 		speed:	{Int} 
	 * 		easing: {Function} 执行动画的函数
	 * 		callback:	{Function} 
	 * 		count:	{JSON}  计数
	 * }
	 */
	function iRanks(_, v, task, immediately) {
		var host = task.host, config = task.config;
		config.ms = Date.now();
		if (immediately) {
			host.animating = false;
			each(config.times, function (k, v) {
				clearInterval(v);
			})
			if (immediately == 'true') host.css(config.to);
			iRuner(config.callback);
		} else {
			if (host.animating) return task.immediately = true;
			host.animating = true;
			config.times = {};
			config.to = {};
			each(config.attributes, function (k, v, target, host, config) {
				++config.count;
				var to, from = _style(target, k, s_NUMBER)[k];
				+from || (from = 0);
				to = r_SET_VALUE_OFFSET._test(v) ? iRuner(mOffsetFuncMap[_RegExp.$1], Nil, _RegExp.$2, from) : v;
				var distance = to - from;
				config.to[k] = to;

				if (distance == 0 || isNaN(distance)) {
					iSetStyle(target, k, to);
					config.count--;
					return;
				}
				config.times[k] = setInterval(iFlash.bind(config, k, from, to, target, host, config.times), 13);
			}, v, host, config);
		}
	}
	var n1 = 7.5625;
	var d1 = 2.75;
	// https://github.com/ai/easings.net
	var iEasing = {
		easeInBack: function (x) {
			var c1 = 1.70158;
			var c3 = c1 + 1;

			return c3 * x * x * x - c1 * x * x;
		},
		easeOutBounce: function (x) {
			if (x < 1 / d1) {
				return n1 * x * x;
			} else if (x < 2 / d1) {
				return n1 * (x -= 1.5 / d1) * x + 0.75;
			} else if (x < 2.5 / d1) {
				return n1 * (x -= 2.25 / d1) * x + 0.9375;
			} else {
				return n1 * (x -= 2.625 / d1) * x + 0.984375;
			}
		},
		easeOutElastic: function (x) {
			var c4 = (2 * Math.PI) / 3;
			return x === 0
				? 0
				: x === 1
					? 1
					: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
		},
		easeOutBack: function (x) {
			var c1 = 1.70158;
			var c3 = c1 + 1;
			return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
		},
		easeOutCirc: function easeOutCirc(x) {
			return Math.sqrt(1 - Math.pow(x - 1, 2));
		}
	}
	AnimateTask.prototype.run = function (total, immediately) {
		if (total > 0) return;
		var setting = this.config, easing;
		merge(setting, {
			count: 0,
			speed: 600,
			easing: iEasing.easeOutBack
		});
		easing = setting.easing;
		if (isString(easing)) setting.easing = iEasing[easing];
		each(this.rank, iRanks, this, immediately || this.immediately);
	}
	each(['hide', 'show'], function (k, v, pro) {
		var s_DISPALY_NONE = 'none';
		var s_SUBDISPLAY = 'o-display';
		pro[v] || (pro[v] = function () {
			return this.each(function (_, v, hideshow) {
				var isHide = hideshow == 'hide',
					/* 实际样式 */
					_real = iCss(v, 'display'), prev = iAttr(v, s_SUBDISPLAY);
				// if (prev == _real) prev = SPACE;
				iCss(v, {
					'display': isHide ? (
						!prev && iAttr(v, s_SUBDISPLAY, _real || SPACE),
						s_DISPALY_NONE
					) :
						prev || 'block'
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
		var l = context || {}, ls = iToCutByDot(line), end = ls.pop();
		end == ALL && (ls.push(end), end = Nil);
		return each(ls, function (_, v, create, end) {
			_ = l[v];
			if (v == ALL) {
				var data = {};
				return l, each(l, function (k, v, data, key) {
					(key && v[key] == Nil) || (data[k] = key ? v[key] : v);
				}, data[end] = {}, end), l = data;
			}
			if (!create && isNil(_)) {
				return true;
			} else if (isNil(_)) {
				l = (l[v] = {});
			} else {
				l = l[v];
			}
		}, def === false ? (def = Nil, false) : true, end) === true ?
			Nil
			:
			def == Nil ? l[end] : (l[end] || (l[end] = def));
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
	function iEEventTrigger(fc, e) {
		var ev = iPicker(e, ePickLine);
		merge(ev, e);
		iRuner(fc, this, ev);
	}
	function iEvent(name) {
		return function (fc) {
			each(this.result, function (_k, v, ename, fc, root, _, _class) {
				if (isIE) fc = iEEventTrigger.bind(v, fc);

				var es = root.events;
				iGetDataByLine(_(v) + DOT + ename, es, []).push(fc);
				/* 当前对象添加的事件 */
				iGetDataByLine('E.' + ename, root, []).push(fc);

				iEvents.addEventListener(v, ename, fc);
				_class(v, s_HOVER_HAND, true);
			}, name, fc, this, iGetEventMark, iClass);
			return this;
		}
	}
	var iProxy = iPicker(global, 'Reflect.defineProperty|Object.defineProperty=>Proxy').Proxy;
	function iListener(item, prop, descriptor, context) {
		try {
			if (descriptor.context) {
				each(iPicker(descriptor, 'get,set'), function (k, v) {
					this[k] = this.first != Nil ? v.bind(this.context, this.first) : v.bind(this.context);
				}, descriptor)
			}
			iProxy(item, prop, descriptor);
		} catch (e) {
			item[prop] = iRuner([descriptor.get, function () {
				return this.value
			}.bind(descriptor)], context);
		}
	}
	var iEvents = {};
	each({
		addEventListener: ['addEventListener', 'attachEvent'],
		removeEventListener: ['removeEventListener', 'detachEvent']
	}, function (k, v, g, kit, prefix) {
		var index = +!g[k];
		kit[k] = function (item, type, listener, useCapture) {
			item[v[index]](prefix[index] + type, listener, useCapture);
		}
	}, global, iEvents, [SPACE, 'on'])
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
		iListener(pro, v, {
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
	var rKV = /\s*([^=&#?]+)=(?:("|')((?:(?!\2).)*)\2|([^=&]*))/g
	/**
	 * 字符串转map url: &|?|#, 字符串: k="v" k2="v2"
	 * @Time   2019-06-19
	 */
	function iString2KeyValue(str, step, context) {
		var kvbox = {};
		each(str.match(rKV), function (k, v, box, regexp, step) {
			if (regexp._test(v)) {
				k = _RegExp.$1;
				v = _RegExp.$3 || _RegExp.$4;
				isNil(v) || (box[k] = v, iRuner(step, context, k, v));;
			};
		}, kvbox, rKV, step);
		return kvbox;
	}
	function iMap2Url(kv) {
		var umap;
		each(kv, function (i, v) {
			this.push(i + '=' + encodeURIComponent(v));
		}, umap = []);
		return umap.join('&');
	}
	/**
	 * 获取宽高
	 * @param {Node} box 
	 */
	function $pickWidthHeight(box) {
		return (box || iHtmlElement).attr('offsetHeight=>height,offsetWidth=>width');
	}
	// 获取屏幕宽高
	var SCREEN = $pickWidthHeight();

	var overflow = iHtmlElement.css('overflow');
	/**
	 * 窗口类, tips提示,模式窗口的基类
	 * @param {JSON} args 配置信息
	 */
	function Dialog(args) {
		merge(this, args, {
			id: ID++,
			// 窗口关联, 当主窗口关闭时, 先调用link对应的窗口remove方法后在执行当前remove
			link: Nil,
			offset: {},
			// this.room外偏移量
			offsets: {},
			_close_: [],
			_resize_: []
		}, sMIX);

		Dialogs[this.id] = this;

		DialogsRanks.push(this);

		args.root.attr({
			id: this.id
		});
		this.bind();
		iRuner(this.init, this);
		this.events = { click: {} };
		this.isOwnSetting = iRuner(this.callback, Dialogs, this.id, this);
	}
	Dialog.prototype = {
		onresize: function (fx) {
			return this._resize_.push(fx), this;
		},
		onclose: function (fx) {
			return (this._close_ || []).push(fx), this;
		},
		remove: function (di) {
			var host = this, isDig = isDigital(di);
			return iLazyRun(function () {
				if (host.link instanceof Dialog) host.link.remove();
				iCurrent(!isDig ? di || host : host);
			}, isDig ? di * 1000 : Nil), this;
		},
		resize: function (time) {
			var self = this;
			return iLazyRun(function () {
				$resize(self, time);
			}, time), self;
		},
		glass: function (show) {
			this.root.attr('is-blur', +show);
			n_BLUR_COUNT += show >> 0;
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
					self.timeout = true;
					self.remove();
				}, this.timeout * 1000);
			}
		},
		cleartime: function () {
			return clearTimeout(this.times), this;
		},
		push: function (event, key, factory) {
			return iGetDataByLine(event + DOT + key, this.events, []).push(factory), this;
		},
		click: function (key, factory) {
			return this.push('click', key, factory), this;
		},
		proxy: function (target, fx) {
			var eventid = QUERY_ID++;
			if (isString(target)) {
				var ps = [];
				/* 归类为一个对象 */
				each(
					/* "bg,a,b" => bg,[data-bind]绑定的对象 @see iPicker*/
					iPicker(this, target), function (i, v, list) {
						v instanceof Query ? list.push.apply(list, v.result) : v.push(v);
					}, ps);
				target = iQuery(ps);
			}
			target instanceof Query ?
				target.attr(EVENT_HANDLE, eventid)
				:
				iAttr(target, EVENT_HANDLE, eventid);
			this.onclose(function (id) {
				this.events.click[id] = null;
			}.bind(this, eventid))
			return this.click(eventid, fx);
		},
		destroy: function () {
			var self = this;
			// 停止计时
			self.cleartime();
			var config = {
				easing: iEasing.easeInBack
			}
			// 关闭背景
			self.bg.stop(true, true).animate({
				opacity: .1
			}, config);
			// 替换配置
			config = {
				css: {
					opacity: .5
				},
				speed: config
			}
			// 设置出场方向对应设置
			config.css[iTakeMovePositionName(this.position)] = '-=25px';
			// 附加自定义样式
			merge(config, self.destroyConfig, true);
			// 执行动画
			self.room.stop(true, true).animate(config.css, config.speed, function () {
				iRuner(self._close_, self);
				n_DIALOGCOUNT--;
				// 删除当前容器
				self.root.remove();
				// 删除保存
				delete Dialogs[self.id];
				if (n_DIALOGCOUNT <= 0) iHtmlElement.css({ 'overflow': overflow });
				// 判断是否为首次打开窗口所创建的,[is-blur]为附加属性
				if (+self.root.attr('is-blur')) n_BLUR_COUNT--, !n_BLUR_COUNT && self.glass();
				// 回收关联
				iToEmpty(self);
			});
		},
		bind: function () {
			this.root.find('[data-bind]').each(function (_, v, dia, attr, key) {
				iListener(dia, key = iAttr(v, attr), {
					first: { v: v, key: '@' + key },
					context: dia,
					enumerable: true,
					get: function (first) {
						return this[first.key] || (this[first.key] = iQuery(first.v, this.root));
					}/* ,
					set: function (first) {
						iToEmpty(this[first.key]);
					} */
				}, dia);
				iAttr(v, attr, null);
			}, this, 'data-bind');
		},
		runer: iRuner
	};
	function iToEmpty(host) {
		each(host, function (k) {
			this[k] = null;
		})
	}
	/**
	 * 设置居中
	 */
	function iCenter(element/* id */, position, dia, user) {
		// var dialog = iQuery(id);
		var css = !user && dia.isOwnSetting
			? {} :
			iPosition.trigger(
				position,
				$pickWidthHeight(element/* dialog.room || dialog */),
				SCREEN
			), marg;
		if (!isEmpty(marg = dia.margins)) {
			css.top && (
				css.top -= (marg.top + marg.bottom) / 2
			)
			css.left && (
				css.left -= (marg.left + marg.right) / 2
			)
		}
		css.zIndex = 10;
		css.position = fixed;
		user ? element.stop(true, true).animate(css, {
			speed: 600,
			easing: iEasing.easeOutCirc
		}) : element.css(css);
		return SCREEN;
	}
	// 当windows变化后执行
	function $resize(dia, task) {
		if (!iRuner(dia._resize_, dia, task))
			iRepainting(dia);
	};
	// 重新绘制
	function iRepainting(dia, user) {
		var css = iCenter(dia.room, dia.position, dia, user);
		css.left = css.top = 0;
		dia.bg.css(css);
	}
	// 创建基础DOM
	var HTMLS = selector2Html('div.windows>div.content[data-bind="room"]+div.bg[data-bind="bg"]');
	// 创建确认对话框DOM结构
	var CONFIRM_HTML = selector2Html('div.confirm>div.confirm-title{标题}+div.confirm-content{内容}+span.confirm-cancel{取消}+span.confirm-submit{确定}+span.confirm-cancel.close{×}');

	var CLOSE_HTML = selector2Html('span.close{×}');

	String.prototype.buildHtml = function () {
		// if (!/(?:[#\.][\w-]+(?:\.|{|\[)+|(?:\[\s*[\w-]+=(?:("|')((?:(?!\1).)*)\1)\])+)/.test(this)) return this;
		if (iSelector2Html.rPar.test(this)) return giveUHtmlBySelector(this);
		// 判断html tag 是否存在于{}内
		return selector2Html(this);
	}

	var EVENT_HANDLE = 'e-dialog-handle';
	function iFindEventParent(target) {
		var ret = {}, handle;
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
	function isQuery(node) {
		return node instanceof Query;
	}
	function isNode(node) {
		node = isQueryGetTheFrist(node);
		return !isString(node) && node && node.nodeType == 1;
	}
	/* if node is Query , take the frist */
	function isQueryGetTheFrist(node) {
		return isQuery(node) ? node[0] : node;
	}
	function iDialogTriggerInit() {
		var css = {
			position: fixed,
			top: 0,
			left: 0,
			zIndex: 100000
		};
		this.room.html(this.context);
		delete this.context;
		iHtmlElement.append(this.root).css({
			'overflow': 'hidden'
		});
		n_DIALOGCOUNT++;
		/* 追加点击事件 */
		this.root.css(css).click(function (e) {
			var target = iPicker(e, ePickLine).target;
			var ev = iFindEventParent(target);
			iRuner(this.events.click[ev.name], ev.target, e, this);
		}.bind(this)).removeClass(s_HOVER_HAND);
	}
	/**
	 * 显示Dialog
	 * @param  {String} context 要显示的窗体内容
	 * @param  {Function} callback 回调
	 * @param  {Number} time x秒后自动消失
	 * @param {JSON|String|Node} position 位置信息 
	 * 	JSON: {
	 * 		target: 所指目标元素,
	 * 		position: 'left,right,bottom,top' //优先级显示
	 * }
	 * String: 'top right' 右上角 [left|right|center]和[top|bottom|center]的组合,不分顺序
	 * @param {JSON} mixin 补充
	 * @return {Dialog}
	 */
	function iDialog(context, callback, time, position, mixin) {//events,init,data,watch,link,components|slot=>slot
		var _render = iPicker(context, 'data,mode=>M,events,watch,components|slot=>slot,init,link,clazz|cls|selector=>selector,_share__');
		if (!isEmpty(_render) && _render.M) {
			context = _render = render(_render.M, _render);
		}
		if (context && (context.finger == TIMEFINGER)) context = context.node;
		var config = isNode(position) ?
			{ target: position }
			:
			iPicker(position, 'slow,position,target');
		merge(config, mixin);
		// 判断是否含有配置信息
		if (!isEmpty(config)) {
			position = config.target;
		}
		var positionIsDom = isNode(position);
		var dialog = new Dialog({
			timeout: time,
			context: context,
			callback: callback,
			root: iQuery(HTMLS),
			init: iDialogTriggerInit,
			position: positionIsDom ? Nil : position
		});
		dialog.render = _render;
		merge(_render.data || {}, {
			_dialog: dialog
		})
		var room = dialog.room;
		if (positionIsDom) {
			room.addClass('windows-freely').append(iSelector2Html.toHtml('.i-mark[data-bind="iMark"]'));
			dialog.bind();
		}

		var slow = config.slow;
		+slow && room.hide();
		if (positionIsDom) {
			var callRoot = {
				index: 1,
				// offset: 12,
				room: room,
				target: isQueryGetTheFrist(position),
				position: config.position,
				iMark: dialog.iMark
			}
			dialog.onresize(function (data) {
				var worker = iPicker(data, 'exec,state|center=>center');
				if (this._to_center__ || worker.center === true) {
					iRepainting(this, this._to_center__ = true);
					iRuner(worker.exec, this, this);
					return true;
				}
				this.bg.css(SCREEN);
				return iResize(callRoot), true;
			})
			/* 是否延迟加载 */
			iLazyRun(function () {
				room.show();
				// iGetDataByLine('firstRun', dialog, [])
				dialog.resize(function () {
					// iResize(callRoot);
					this.room.stop(true, true).css({
						top: '-=10'
					}).animate({
						top: '+=10'
					})
				});

			}, slow);
		} else {
			iUserEventMap.auto.mix.animate(dialog, !dialog.isOwnSetting);
		}
		dialog.onclose(function () {
			var data = this.render.data;
			delete this.render;
			if (data) {
				// 删除关联
				delete data._dialog;
			}
			this.room.html(SPACE);
		})
		/* 是否延迟加载 */
		iLazyRun(function () {
			dialog.timer();
		}, slow);
		if (isIE) {
			iQuery('body').append(dialog.root);
		}
		return dialog;
	};

	var aPosition = ['i-s-left', SPACE, 'i-s-right', 'i-s-bottom'];
	var iPMap = { left: 0, top: 1, right: 2, bottom: 3 };
	/**
	 * 重置位置
	 * @param {JSON} simply  {
	 * 		target: 目标,
	 * 		room: 当前提示窗
	 * 		index: 上次位置
	 * 		offset: 偏移量
	 * 		position: 是否
	 * }
	 */
	function iResize(simply) {
		var target = simply.target,
			tRect = iRuner(iPicker(target, 'getBoundingClientRect|rect=>rect').rect, target),
			room = simply.room,
			index = simply.index,
			position = simply.position;
		/* 指向目标三角箭头 */
		var iM = simply.iMark;
		var imHeight = simply.offset || simply.iMarkHeight || (simply.iMarkHeight = iM.attr(s_OFFSETHEIGHT) / 2);
		/* default order [bottom,left,right,top]*/
		var order = '3,1,2,0'.split(r_MULTI_SEL), aList;
		var rHeight = room.attr(s_OFFSETHEIGHT);
		var rWidth = room.attr(s_OFFSETWIDTH) + imHeight;
		/* ie低版本不含有 height, width */
		var tHeight = (tRect.height == Nil ? tRect.bottom - tRect.top : tRect.height) >> 0;
		var tWidth = (tRect.width == Nil ? tRect.right - tRect.left : tRect.width) >> 0;
		// 除去弹窗宽度所剩的空间
		var iShowWidth = SCREEN.width - rWidth - imHeight;
		var iShowHeight = SCREEN.height - rHeight - imHeight;
		// 一维方位状态
		var iState = [
			/* left: 0 */
			tRect.left - rWidth/* 减去宽度剩余值 */,
			/* top: 1 */
			tRect.top - rHeight/* 减去高度剩余值 */,
			/* right: 2 */
			iShowWidth - tRect.right,
			/* bottom: 3 */
			iShowHeight - tRect.bottom
		];
		room.state = iState;
		// console.log('left:{0}\t top:{1}\t right:{2}\t bottom:{3}\t'.format(iState));
		if (!isNil(position)) {
			/* 多配置排序 */
			each(position.split(r_MULTI_SEL), function (i, v, map, list) {
				list.push(map[v]);
			}, iPMap, aList = []);
			order.unshift.apply(order, aList);
		}
		// Get index of position!
		index = each(order, function (i, v, map) {
			// 当自定义计算最适合显示的位置
			if (map[v] > 0) return v
		}, iState);// || 0;
		var rStyle = {}, mStyle = {};
		if (isNil(index)) {
			mStyle.display = 'none';
			/* 当自定义显示和默认位置都不适合显示时, 居中显示 */
			iCenter(room, iPosition.CENTER, simply);
		} else {
			var isLR = index == 0 || index == 2,
				isTB = index == 3 || index == 1;
			rStyle.left = isTB ? Math.min(tRect.left, iShowWidth) : index == 2 ? tRect.right + imHeight : iState[0]/* 除去宽度的位置 */;

			var iTargetTop = Math.max(tRect.top, 0)/* 目标元素的 top */;
			var iTargetBottom = Math.min(tRect.bottom, SCREEN.height)/* 目标元素的 bottom */
			// 计算显示区域 和 目标对象显示区域的交集的 一半显示
			var iViewHeight = (iTargetBottom - rHeight + Math.min(SCREEN.height - rHeight, iTargetTop)) / 2;
			var iTipsTop = Math.max(isLR ? iViewHeight : index == 3 ? tRect.top + tHeight + imHeight
				:
				Math.min(iViewHeight, iState[1] - imHeight), 0);
			/* initialize value of the top */
			mStyle.display = mStyle.left = mStyle.top = SPACE;
			if (isLR) {
				var imTop = (
					/* 底边距 */
					Math.min(iTipsTop + rHeight /* Tips bottom */, iTargetBottom)
					+ Math.max(iTipsTop/* tips top */, iTargetTop)
				) / 2 - iTipsTop/* 补足高度 */;
				// 目标对象高度大于提示框高度 判断
				mStyle.top = imTop + (iM.css('border-width', 'number') + imHeight) / 2;
			}
			if (isTB && tRect.left > iShowWidth)
				mStyle.left = tRect.left - rStyle.left - imHeight + tWidth / 2;
			rStyle.top = iTipsTop;
			room.removeClass(aPosition[simply.index]/* 取消上次位置 */).addClass(aPosition[index]);
			simply.index = index;

			iM.show();
		}
		/* 设置相关样式 */
		iM.css(mStyle);
		room.css(rStyle);
	}
	/**
	 * 是否延迟运行
	 * @param {Function} run 
	 * @param {Number|Object} slow 
	 */
	function iLazyRun(run, slow) {
		return +slow ? setTimeout(run, slow) : iRuner(run, Nil, slow);
	}
	//移除当前窗口
	function iCurrent(dialog, mark) {
		if (isDigital(mark) && mark <= 0) return;
		var curr;
		if (dialog) {
			var count = n_DIALOGCOUNT;
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
			var isModal;
			if (isModal = iPicker(curr, 'model|isModal|ismodal|modalclose=>mod').mod) {
				if (isModal === true || iRuner(isModal, Nil, curr) !== Nil) {
					DialogsRanks.unshift(curr);
					iCurrent(dialog, (isNil(mark) ? n_DIALOGCOUNT : mark) - 1);
					return;
				}
			}
			curr.destroy();
		};
	};
	/**
	 * 通过el获取dialog对象
	 * 2023-7-6
	 * @param {Element} element 
	 * @returns {Dialog|undefined}
	 */
	function iGetDialogByElement(element) {
		if (isNode(element)) {
			var dial = iWithIn('.windows', element);
			if (dial) {
				return Dialogs[iAttr(dial, 'id')];
			}
		}
	}
	function iUserWindowResize(time) {
		var dial;
		if (dial = iGetDialogByElement(time)) {
			return iRuner(iPicker(dial, 'resize').resize, dial);
		}
		iLazyRun(function () {
			SCREEN = $pickWidthHeight();
			for (var i in Dialogs) {
				$resize(Dialogs[i]);
			}
		}, +time || 10);
	}

	function isDigital(data) {
		return /^[-+]?\d+(.\d+)?$/.test(data);
	}
	/**
	 * 获取DOM对象
	 * iQuery(selector, context|[0-9]+, true|false|[0-9])[css, attr, find, each, ...]
	 * 特殊用途
	 * iQuery('div', n) | iQuery('div', '.class', n) 获取查询的第n个对象 => [object HTMLDivElement]
	 * iQuery('div', false) 只返回结果集第一条数据 => Query{[object HTMLDivElement]}
	 * iQuery('div.class[attr]{abc}', true) 创建sel对应的Node对象 => Query{<div class="class" attr>abc</div>}
	 * @param {String|Query|Node|NodeList} sel 
	 * @param {String|Query|Node|NodeList|Number|Boolean} context 
	 * @param {Boolean} elements 
	 */
	function iQuery(sel, context, elements) {
		/* 是否返回索引对应的Noded对象 */
		isDigital(context) && (elements = context, context = Nil);
		/* 执行对应的查询 */
		var iv = new Query(sel, context, elements === false ? false : Nil);
		// var digital = !isNil(elements) ? elements : context;
		return isDigital(elements) ? iv.result[elements] : (elements === true ? iv.result : iv);
	}
	// 新增事件监听
	iQuery(window).resize(iUserWindowResize).keydown(function (e) {
		if (e.keyCode === 27) iCurrent();
	});

	function iHtml(target, element) {
		var unQuery = {};
		unQuery.result = isArray(target) ? target : [target];
		return iPackHtml.call(unQuery, element);
	}
	/* 通过选择器获取对象的父类 */
	function iWithIn(sel, target) {
		return iElementsIs(isQueryGetTheFrist(target), sel, true/* 溯源 */).pop();
	}
	/**
	 * 对比对象之间的差异
	 * @param {JSON} source 原始数据
	 * @param {JSON} _diff 对比的数据
	 * @param {Function} _back 回调函数
	 * @param {Object} _context 回调函数的this
	 */
	function iDiffer(source, _diff, _back, _context) {
		var data = {};
		merge(data, source, _diff, sMIX);
		each(data, function (k, _v, _, _back, _context) {
			iRuner(_back, _context, k, k in this, this[k]);
		}, source, _back, _context)
	}
	/* 拆分 'x.x.x.name' to ['x','x','x','name'] */
	function iToCutByDot(cut, split) {
		return cut.split(split || DOT);
	}

	var TIMEFINGER = 'T-{0-99}-{100-999}-T'.format();
	var render = function () {};
	/**
	 * 替换字符串中含有的 ? 按照顺序替换
	 * @param {String} mode 
	 * @param {String|Array} args 
	 * @returns 
	 */
	function TextFormat(mode, args) {
		var mat = /\?/;
		if (mat.test(mode)) {
			isArray(args) || (args = iList2Array(arguments), args.shift());
			isString(args) && (args = args.split(r_MULTI_SPLIT_SEP));
			var list = mode.match(/\?/g), pre;
			for (var i = 0, lenth = list.length; i < lenth; i++) {
				mode = mode.replace(mat, (pre = ((isNil(args[i]) ? pre : args[i]))));
			}
		}
		return mode;
	}
	String.prototype.on = iStringFormat;
	/**
	 * 注册便捷方法, 处理创建DOM+ 数据绑定
	 * @param {JSON} data 
	 * @param {JSON} same {events: ..., slot: ..., watch: ...}
	 * @returns Node
	 */
	String.prototype.render = function (data, same) {
		/* 处理 选择器创建, 选择器转换html字符串 */
		var mode = this.buildHtml();
		/* 配置信息 */
		var config = {
			data: data || {}
		}
		merge(config, same);
		return render(mode, config);
	}

	var inset = ['left', 'top', 'right', 'bottom'], insetMap;
	each(inset, function (k, v) { this[v] = k; }, insetMap = {});
	/* 获取相反的方向 */
	function iOpposite(opposite) {
		return inset[(insetMap[opposite] + 2) % 4];
	}
	var rExport = {
		'_': Query,
		'is': iElementIs,
		// 'render': render,
		'css': iCss,
		'each': each,
		'attr': iAttr,
		'html': iHtml,
		'merge': merge,
		'kv2url': iMap2Url,
		'url2kv': iString2KeyValue,
		'attrs': iAttrs,
		'show': iDialog,
		'list': Dialogs,
		'runer': iRuner,
		'picker': iPicker,
		'showBox': iDialog,
		'between': between,
		'isString': isString,
		'isEmpty': isEmpty,
		'getline': pickVarLine,
		'iGetDataByLine': iGetDataByLine,
		'resize': iUserWindowResize,
		'selector2Html': selector2Html,
		'giveUHtmlBySelector': giveUHtmlBySelector,
		'format': iStringFormat,
		'idialog': iGetDialogByElement,
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
			var iNode = isNode(msg)
			if (!iNode && time > 7) msg += CLOSE_HTML;
			var config = iPicker(position, 'position,target,slow');
			if (isEmpty(config)) {
				merge(config, { target: position });
			}
			return iDialog(iNode ? msg : giveUHtmlBySelector(msg), function (id, dialog) {
				dialog.root.addClass('dialog-tips');
				iRuner(init, dialog);
				dialog.proxy(dialog.root.find('.content .close' + (time > 7 ? SPACE : ',.bg')), function () {
					dialog.remove();
				});
			}, time, config.target || rExport.tips_position, config);
		},
		/**
		 * 自动适应
		 * @param  {String}   mode     内容
		 * @param  {Function} callback 回调函数
		 * @param  {String}   propertys       布局 offset : 左 上 右 下..等;
		 */
		'auto': function (mode, callback, propertys) {
			var cs;
			if (!isFunction(callback) && isNil(propertys)) {
				propertys = callback;
				callback = propertys && propertys.callback;
			}
			if (isString(propertys)) {
				cs = propertys;
				propertys = {};
			} else {
				propertys || (propertys = {});
				cs = propertys.cs;
			}
			cs || (cs = s_AUTOATTRS);
			var free = propertys.center === false || r_IsNotCenter.test(cs) || propertys.free;
			var rainbox = iDialog(mode, function (id, dia) {
				// 初始化
				dia.runer(propertys.init, dia, id);
				dia.runer(callback, this, id, dia);
				/* 绑定数据关联 */
				dia.bind();
				/* 复制属性 */
				merge(dia, iPicker(propertys, 'destroy=>destroyConfig,model,link,name,auto=>@auto'));
				// end
				dia.runer([propertys.last, propertys.end], dia, id);
				dia.onresize(resize);
				dia.isFree = free;
				return true;
			}, Nil, propertys.position);

			var rules = iDialogAutoRules(cs.split(r_MULTI_SPLIT_SEP));
			isArray(rules) && rules.sort(function (a, b) {
				return a.sort - b.sort
			});
			propertys.destroy && (
				isNil(propertys.center)
				&&
				/* 当定位中不含有center时 */
				!/center/.test(propertys.position)
			) && (propertys.center = false);
			// 是否自由定位,非居中
			var room = rainbox.room.hide();
			iLazyRun(function () {
				room.show();
				// 结束
				resize.call(rainbox, true);

				iRuner(
					/* 设置了css: 'animate:xxxx' 取消调用 iUserEventMap.auto.mix.animate */
					/animate\s*\:/.test(cs)
					|| propertys.end
					|| function () {
						iUserEventMap.auto.mix.animate(this, true);
					}, rainbox);
			}, propertys.slow);
			/* 注册滚动事件 */
			if (propertys.scroll) {
				/* 查找滚动容器 */
				var contextinner = each(rules, function (_, v) {
					if (v.name == 'inner') return v.value[5];
				});
				var scrollBox = rainbox.room.find(contextinner);
				// 容器添加滚动事件
				(scrollBox.length ? scrollBox : rainbox.room).scroll(function () {
					iLazyRun(propertys.scroll, 60);
				});
			}
			function resize(is1st) {
				if (this.lock) return;
				this.is1st = !!is1st;
				var css4 = {};
				each(rules, function (k, v, rMap, css4, house) {
					if (!(v.value[0] instanceof Dialog)) {
						v.value.unshift(house);
					}
					/* 调用自定义处理 */
					iRuner(v.custom || (v.custom = iPicker(house, '@auto.?=>fx'.on(v.name)).fx), house, v.value);
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
		'remove': function (sel) {
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
		'clazz': iClass,
		'addClass': function (target, clazz) {
			iClass(target, clazz, true);
		},
		'removeClass': function (target, clazz) {
			iClass(target, clazz);
		},
		'within': iWithIn,
		'query': iQuery,
		'Query': iQuery,
		/**
		 * 返回 Query对象
		 * @param {String} selector tag.class[attr]{innerHTML} | <tag [attr] .class/>
		 */
		'createElement': function (selector) {
			return iQuery(selector, rStringHtml.test(selector) ? Nil : true);
		},
		'destroy': function (dialog) {
			iRuner(iPicker(dialog, 'remove').remove, dialog);
		},
		'get': function (elem) {
			var ret = {};
			if (!isNode(elem)) return ret;
			var node = isQueryGetTheFrist(elem);
			return Dialogs[this.within('.windows', node).id] || ret;
		},
		'current': function () {
			return DialogsRanks[DialogsRanks.length - 1];
		},
		'mix': function () { var _ = iList2Array(arguments); _.push(sMIX); merge.apply(Nil, _) },
		/**
		 * 通过对象方法获取相应属性
		 * @param {Object} host 
		 * @param {String} fun 方法名称或者 方法名称 + 返回属性名称
		 * @returns 返回获取值
		 */
		'exec': function (host, fun) {
			var config = pickVarLine(fun, host);
			var data = iRuner(config.parent[config.head], config.parent);
			return data === Nil ? config.data : data;
		},
		'differ': iDiffer,
		opposite: iOpposite
	};
	var sPickArgsByIndex = '1=>left,2=>top,3=>right,4=>bottom';
	// 窗口距容器的边距
	rExport.push(s_AUTO_KEY, 'offset', function (host, l, t, r, b) {
		/* 设置非居中绘制 */
		host.isFree = true;
		var room = host.room;
		var css = iPaddings(room);
		var offset = iGetConfigByArgs(host, 'offsets', arguments, null);
		var isNoLeft = offset.left === null,
			isNoRight = offset.right === null,
			isNoTop = offset.top === null,
			isNoBottom = offset.bottom === null;

		each(offset, function (k, v) {
			this[k] = v;
		}, this);
		var widthHeight;
		if (isNoLeft || isNoTop || isNoRight || isNoBottom) {
			room.css({ width: null, height: null });
			widthHeight = room.css('width,height', s_NUMBER);
		}
		var width = SCREEN.width - (l >> 0) - (r >> 0) - css.l - css.r;
		var height = SCREEN.height - (t >> 0) - (b >> 0) - css.t - css.b;

		this.width = isNoLeft || isNoRight ? Math.min(width, widthHeight.width) : width;
		this.height = isNoTop || isNoBottom ? Math.min(height, widthHeight.height) : height;
		if (isNoLeft && isNoRight) {
			this.left = Math.max((SCREEN.width - room.attr(s_OFFSETWIDTH)) / 2, 0);
		}
		if (isNoTop && isNoBottom) {
			this.top = Math.max((SCREEN.height - room.attr(s_OFFSETHEIGHT)) / 2, 0);
		}
		room.css(this);
	});

	// 窗口居中偏移量
	rExport.push(s_AUTO_KEY, 'margin', function (host) {
		iGetConfigByArgs(host, 'margins', arguments, 0);
	});
	/**
	 * 获取参数配置信息 offset: auto 10 auto 10
	 * @param {Dialog} host Dialog对象
	 * @param {String} name 检索对象
	 * @param {Arguments} propertys 触发函数参数
	 * @param {Object} val 
	 */
	function iGetConfigByArgs(host, name, propertys, val) {
		if (isEmpty(host[name])) {
			host[name] = iPicker(propertys, sPickArgsByIndex, s_NUMBER, function (_, v) {
				if (!isNumber(v)) return val;
			})
		}
		return host[name];
	}
	/**
	 * 判断参数是否为"数值"
	 * @param {Object} value 
	 */
	function isNumber(value) {
		return !isNaN(+value)
	}
	function iPaddings(house) {
		return house.paddings || (house.paddings = house.css(s_PICK_PADDING_4_CSS, s_NUMBER))
	}
	function iMargins(house) {
		return house.margins || (house.margins = house.css(s_PICK_PADDING_4_CSS.replace(/padding/g, 'margin'), s_NUMBER))
	}
	function iWidthHeightBox(house) {
		return house.WidthHeight || (house.WidthHeight = house.css('width=>left,width=>right,height=>top,height=>bottom', s_NUMBER))
	}
	var iDefaultPadding = { l: 0, t: 0, r: 0, b: 0 };
	// 计算内部布局
	rExport.push(s_AUTO_KEY, 'inner', function (host, _, _, _, _, center, offset, isrezsize) {
		var
			room = host.room,
			offsets = iPickInnerOffset(room, arguments);
		if (isStringBoolOrBoolean(offset)) {
			isrezsize = offset;
			offset = Nil;
		}
		var isUnRe = isrezsize != 'true';
		var
			css = {},
			isOutElement = room.is(center) || room.find(iSelector2Html.CHILD + center).length,
			paddings = isOutElement ? iDefaultPadding : iPaddings(room),
			BODY = room.iINNER || (room.iINNER = room.find(center)),
			paings = isOutElement ? iDefaultPadding : iPaddings(BODY),
			/* inner 滚动高度 */
			cScrollHeight = BODY.attr(s_SCROLLHEIGHT) >> 0,
			// 可视区域(高)
			screenHeight = SCREEN.height - (offset >> 0),
			// 可视区域(宽)
			screenWidth = SCREEN.width - (offset >> 0),
			minWidth = room.attr(s_SCROLLWIDTH) >> 0,
			offsetY = offsets.top + offsets.bottom + paddings.t + paddings.b + paings.t + paings.b,
			iW = screenWidth - (paddings.l + paddings.r + offsets.left + offsets.right + paings.l + paings.r),
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
	/**
	 * 获取内部可视容器的Offset
	 * @param {Query} host 宿主
	 * @param {Arguments} propertys 触发函数的参数
	 */
	function iPickInnerOffset(host, propertys) {
		var offsets;
		if (isEmpty(offsets = host._offset__)) {
			offsets = host._offset__ = {};
			iPicker(propertys, sPickArgsByIndex, null, iOffsetStep.bind({
				box: offsets,
				host: host
			}));
		}
		return offsets;
	}
	/**
	 * @see iPickInnerOffset#pick
	 * @param {Number} i 
	 * @param {Object} v 
	 */
	function iOffsetStep(i, v) {
		if (!isNumber(v)) {
			var Q = this.host.find(v);
			if (Q.is(':visible')) {
				var padding = iPaddings(Q), margin = iMargins(Q), iWH = iWidthHeightBox(Q);
				v = Q.length ? (
					iWH[i] + (/left|right/.test(i) ? margin.l + margin.r + padding.l + padding.r : margin.t + margin.b + padding.t + padding.b)/*  + (Q.attr(aOffsetList[i]) >> 0) */
				) >> 0 : 0;
			}
		}
		this.box[i] = v >> 0;
	}
	/**
	 * 判断是否为字符串Bool或者Boolean对象
	 * @param {Object} bool 
	 */
	function isStringBoolOrBoolean(bool) {
		return /^(?:true|false)$/.test(bool);
	}
	/**
	 * @see iDialog(String, Number, Position[center,left,...]);
	 * @param {String} posi 位置信息 
	 */
	function iTakeMovePositionName(posi) {
		return /(left|right|bottom)/._test(posi) ? _RegExp.$1 : 'top';
	}
	// 第一次打开时的动画 可以被覆盖 @see dialog.push('auto', 'animate', Function)
	rExport.push(s_AUTO_KEY, 'animate', function (D, use, start, end) {
		if (/^true$/.test(use)) {
			iRepainting(D, D.isFree != Nil ? !D.isFree : true);
			if (D.is1st != Nil && !D.is1st) return;
			var _init = { opacity: .7 }, _end = { opacity: 1 }, _pos = iTakeMovePositionName(D.position);
			_init[iOpposite(_pos)] = 'auto';
			_init[_pos] = start || '-=10';
			_end[_pos] = end || '+=10';
			D.room
				.stop(true, true)
				.css(_init)
				.animate(_end);
		}
	});
	module.exports = rExport;
}));
