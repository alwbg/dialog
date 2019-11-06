/**
 * @autor alwbg@163.com | soei
 * -----------------------------------
 * - https://github.com/alwbg/dialog -
 * -----------------------------------
 * creation-time : 2019-11-01 18:49:00 PM
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
var Q = window.$ || require('query');
var Dialogs = {};
var DialogsRanks = [];
var Count = 0;
var Nil;

var SPLIT_SEP = /\s*;\s*/;
var SPLIT_KV = /\s*:\s*/;
var SPACE = '';
var DOT = '.';
var htmls = '<div class="windows"><div class="content" ></div><div class="bg" ></div></div>';

var oObject = '[object Object]';
var oString = '[object String]';
var OBJECT_EMPTY = {};
var isString = function(o) {
	return to(o) == oString;
}

function to(o) {
	return OBJECT_EMPTY.toString.call(o);
}
var confirmHtml = '<div class="confirm">' +
	'	<div class="confirm-title">标题</div><div class="confirm-content">内容</div>' +
	'	<span class="confirm-cancel">取消</span><span class="confirm-submit">确定</span>' +
	'</div>';
var isNotFixed = /ie\s*(6|5)/ig.test(navigator.userAgent);
//var isBlur      	= /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*(?:7|8|9|10)|webkit)/i.test( navigator.userAgent );
var fixed = isNotFixed ? 'absolute' : 'fixed';

var ddoc = document.documentElement;
var body = Q(ddoc);
var overflow = body.css('overflow');

var SCREEN = $pickWidthHeight();

function $pickWidthHeight(box) {
	if (!box) box = ddoc;
	if (!+box.nodeType) box = box[0];
	return {
		height: box.clientHeight,
		width: box.clientWidth
	};
}

//对象原型
var EMPTY_ARRAY = [];
var EMPTY_ARRAY_SLICE = EMPTY_ARRAY.slice;
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
function $runer(rank, context) {
	var args = Array.apply(null, arguments);
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
			if (msg !== undefined) return msg;
		}
	}
}
var ID = 20160516;
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
	this.isOwnSetting = $runer(this.callback, Dialogs, this.id, this);
}
Dialog.prototype = {
	tips: module.exports.tips,
	onresize: function(fx) {
		return this._resize_.push(fx), this;
	},
	onclose: function(fx) {
		return this._close_.push(fx), this;
	},
	remove: function(di) {
		if (this.link instanceof Dialog) this.link.remove();
		return $current(di || this), this;
	},
	resize: function(time) {
		var self = this;
		return time ? setTimeout(function() {
			$resize(self)
		}, time) : $resize(self), self;
	},
	glass: function(show) {
		this.root.attr('is-blur', +show);
		Q('body')[show ? 'addClass' : 'removeClass']('blur');
	},
	addClass: function(clazz) {
		return this.root.addClass(clazz), this;
	},
	timer: function() {
		if (+this.timeout) {
			var self = this;
			self.times = setTimeout(function() {
				self.remove();
			}, this.timeout * 1000);
		}
	},
	destroy: function() {
		$runer(this._close_);
		Count--;
		this.root.remove();
		delete Dialogs[this.id];
		if (Count <= 0)
			body.css({
				'overflow': overflow
			});
		if (+this.root.attr('is-blur')) this.glass();
	},
	cleartime: function() {
		clearTimeout(this.times);
	},
	runer: $runer
};
var _Position = {
	CENTER: 'center',
	rWidth: /top|bottom/,
	// 计算方向
	aLT: ['left', 'top'],
	// 获取计算属性
	aWH: ['width', 'height'],
	// 获取配置方向所需
	rPosition: /(?:(center)|(left|top|right|bottom))/g,
	trigger: function(position, own, room) {
		var center = this.CENTER;
		position || (position = center);
		room || (room = {});
		var css = {},
			isWidth, other,
			rWidth = this.rWidth,
			aLT = this.aLT,
			aWH = this.aWH;
		var positions = position.match(this.rPosition);

		for (var i = 0, length = positions.length; i < length; i++) {
			sim = positions[i];
			if (sim != center) {
				css[sim] = 0;
			} else {
				// 获取另一个位置position
				other = positions[(i + 1) % length];
				isWidth = !rWidth.test(other);
				position = aWH[+isWidth];
				css[aLT[+isWidth]] = (room[position] - own[position]) / 2;
				// 如果为center时 计算相对值
				if (other == sim) {
					position = aWH[+!isWidth];
					css[aLT[+!isWidth]] = (room[position] - own[position]) / 2;
				}
			}
		}
		return css;
	}
};

var _Html = {
	htmlMode: '<tag#.[>inner</tag>',
	rVal: /^\s*(.*)$/,
	rPar: /\({2}([^\|]+)\|(((?!\){2}).)+)\){2}/g,
	_default: {
		'#': [/#/, '', 'id="$1" '],
		'.': [/\./, '', 'class="$1" '],
		'[': [/\[/, '', '$1'],
		'tag': [/tag/g, 'span ', '$1 ']
	},
	toHtml: function(str, inner) {
		str = new String(str);
		var SPACE = ' ',
			sim, key, isInner;
		var Keys = {
			'tag': [],
			'.': [],
			'#': [],
			'[': []
		}
		var quto = 0;
		for (var i = 0, length = str.length; i < length; i++) {
			sim = str[i];
			key = key || 'tag';
			var picker = Keys[key];
			if (isInner === false) picker.push(SPACE)
			switch (sim) {
				case SPACE:
					if (isInner) picker.push(SPACE);
					break;
				case '.':
					key = sim;
					isInner = false;
					break;
				case '#':
					key = sim;
					isInner = false;
					break;
				case '[':
					key = sim;
					isInner = false;
					break;
				case ']':
					isInner = false;
					break;
				case '"':
					if (quto % 2) isInner = false;
					picker.push(sim);
					quto++;
					break;
				case ',':
					if (isInner) picker.push(sim);
					else {
						picker.push(SPACE);
					}
					break;
				default:
					isInner = true;
					picker.push(sim);
			}
		}
		var val, sdefault;
		var hMode = this.htmlMode;
		for (var key in Keys) {
			val = Keys[key].join('');
			sdefault = this._default[key];
			hMode = hMode.replace(sdefault[0], val ? val.replace(this.rVal, sdefault[2]) : sdefault[1]);
		}
		hMode = hMode.replace(/inner/, inner);
		return hMode;
	}
}


/**
 * 设置居中
 */
function $center(id, position, dia, user) {
	var dialog = Q(id);
	var css = !user && dia.isOwnSetting ? {} : _Position.trigger(position, $pickWidthHeight(dialog.room || dialog), SCREEN);
	css.zIndex = 10;
	css.position = fixed;
	dialog.css(css);
	return SCREEN;
}
// 当windows变化后执行
function $resize(dia) {
	if (!$runer(dia._resize_, dia))
		$repainting(dia);
};
// 重新绘制
function $repainting(dia, user) {
	var css = $center(dia.room, dia.position, dia, user);
	css.left = css.top = 0;
	dia.bg.css(css);
}
/**
 * 显示Dialog
 * @param  {String} mode 要显示的窗体内容
 * @param  {Function} fx 回调
 * @param  {Number} time x秒后自动消失
 * @return {Query}       
 */
function $showbox(mode, fx, time, position, show) {
	var args = Array.apply(null, arguments);
	var callback = args.shift();
	var Md;
	if (!(callback instanceof Function)) {
		Md = callback;
		callback = args.shift();
		if (!callback) callback = new Function;
	}
	var root = Q(htmls);

	var room = root.find('>.content');
	var bg = root.find('>.bg');

	room.html(Md);
	body.css({
		'overflow': 'hidden'
	});
	var css = {
		position: fixed,
		top: 0,
		left: 0,
		zIndex: 100000
	};
	root.css(css);
	//jQ.appendTo存在两份( 多个html标签导致 )
	ddoc.appendChild(root[0]);
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

	if (positionIsDom) {
		var slow, _position;
		if (show && to(show) == oObject) {
			slow = show.slow;
			_position = show.position;
		}
		$repainting(dialog, true);
		(+slow) && room.hide();
		var box = room[0];
		var _target = position;
		var screen, top, height;

		room.addClass('windows-freely');
		room.append(giveUHtmlBySelector('(( |.link-mark))'))

		function _resize() {
			var css = _target.getBoundingClientRect();
			height = SCREEN.height;
			if (!_position || height - css.top - css.height < box.offsetHeight) {
				top = css.top - 2 - box.offsetHeight - 7
			} else {
				top = css.top + css.height + 2
			}
			room.css({
				top: top,
				left: css.left
			})
			return true;
		}
		dialog.onresize(_resize);

		if (+slow) {
			setTimeout(function() {
				room.show();
				_resize()
			}, slow);
		} else {
			_resize();
		}

	} else {
		$Map.auto.mix.animate(dialog, !dialog.isOwnSetting);
	}
	dialog.timer();
	return dialog;
};
//移除当前窗口
function $current(dialog) {
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
		}, 400, function() {
			curr.destroy();
		});
	};
};

function $$resize() {
	SCREEN = $pickWidthHeight();
	for (var i in Dialogs) {
		$resize(Dialogs[i]);
	}
}
Q(window).resize($$resize).keydown(function(e) {
	if (e.keyCode === 27) $current();
});

// 配置
var $Map = {};

function $autoToMap(css, list) {
	!css && (css = {});
	var kv, k, v, vs, fx;
	for (var i = 0, len = list.length; i < len; i++) {
		kv = list[i].split(SPLIT_KV);
		k = kv[0];
		v = kv[1] || SPACE;
		if ((vs = v.split(/\s+/)).length >= 1) {
			css[k] = vs;
		}
	}
	return css;
}

function picktype(O) {
	return to(O).replace(/\[object\s(\w+)\]/, '$1');
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
	return val === undefined;
}
// 遍历Set Map
function MS(source, fn, args) {
	fn instanceof Function || (fn = function() {});
	source.forEach(function(v, k) {
		fn.call(this, k, v);
	}, this);
}
var EACH = {
	'changeWay': function(key, args, source, cb) {
		args[0] = key; /*设置KEY*/
		args[1] = source[key]; /*设置对应的*/
		return !isNil(this.ret = cb.apply(this.context, args));
	},
	'Array': function(source, fn, args) {
		for (var key = 0, length = source.length >> 0; key < length; key++) {
			if (EACH.changeWay.call(this, key, args, source, fn)) return this.ret;
		}
	},
	'Object': function(source, fn, args) {
		for (var key in source) {
			if (source.hasOwnProperty(key) && EACH.changeWay.call(this, key, args, source, fn)) return this.ret;
		}
	},
	'Set': MS,
	'Map': MS
}
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
	}, source, func, Array.apply(null, arguments));
}
var R_SPLIT_SEL = /(?:\,|\|)/;
var R_SPLIT_KV = /\=\>/;
var R_SPLIT_MORE = /;/;
/**
 * 提取指定属性名称的值
 * @Time  2018-11-15
 * @param {Object}   source 源数据
 * @param {String}   rule   要提取的列表
 */
function picker(source, rule) {
	if (rule == '*') return source;
	if (!isString(rule)) return {};
	var rainbox = [],
		isArray = true;
	source instanceof Array || (source = [source], isArray = false);
	// 遍历队列
	each(source, function(k, val, rule, get) {
		var rain = {};
		// 遍历规则
		each(rule, function(k, v, json, val) {
			v = v.split(R_SPLIT_KV);
			each(v[0].split(R_SPLIT_MORE), function(k, v, val, pi, data) {
				k = val[v];
				// pi = pick [=>(pick:name)]
				if (!isNil(k)) return data[pi || v] = k, true;
			}, val, v[1], json);
		}, rain, val);
		// 添加
		get.push(rain);
	}, rule.split(R_SPLIT_SEL), rainbox);
	return isArray ? rainbox : rainbox.pop();
}
// 获取指定对象的值
function __pick_var_line_(varline, local) {
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

var A_Z = /((\d+)\-(\d+))/;

function between(a, z, callback) {
	if (isString(a)) {
		if (a.search(A_Z) >= 0) {
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
		$runer(callback, null, min + lof, max, min);
	}
	// return val;
}

function giveUHtmlBySelector(selector) {
	return selector.replace(_Html.rPar, function(source, inner, selector) {
		return _Html.toHtml(selector, inner);
	})
}
var $export = {
	'showBox': $showbox,
	'show': $showbox,
	'list': Dialogs,
	'runer': $runer,
	'merge': merge,
	'between': between,
	'each': each,
	'isString': isString,
	'resize': $$resize,
	'picker': picker,
	'getline': __pick_var_line_,
	giveUHtmlBySelector: giveUHtmlBySelector,
	'screen': function() {
		return SCREEN;
	},
	'remove': function(di) {
		$current(di);
	},
	'confirm': function(title, content, callback, position) {
		return this.auto(confirmHtml, function(id, dialog) {
			// dialog.glass(true);
			var room = dialog.room;
			room.find('.confirm-title').html(title);
			room.addClass('dialog-confirm').find('.confirm-content').html(content);
			room.find('.confirm-submit').click(function(e) {
				if ($runer(callback, dialog.root, $export, dialog, e)) {
					dialog.remove();
				}
				return false;
			});
			room.find('.confirm-cancel,.close').click(function(e) {
				dialog.remove();
				return false;
			});
		}, position);
	},
	notice: function(msg, time, position, init, clazz) {
		var notice = this.tips(msg, time, position, init);
		return notice.addClass(clazz || 'notice'), notice;
	},
	error: function(msg, time, position, init) {
		return this.notice(msg, time, position, init, 'error');
	},
	'tips': function(msg, time, position, init) {
		if (time > 7) msg += '<span class="close">×</span>';
		return $showbox(giveUHtmlBySelector(msg), function(id, dialog) {
			dialog.root.addClass('dialog-tips');
			$runer(init, dialog);
			dialog.root.find('.content .close' + (time > 7 ? '' : ',.bg')).click(function() {
				dialog.remove();
			});
		}, time, position || $export.tips_position);
	},
	/**
	 * 自动适应
	 * @param  {String}   mode     内容
	 * @param  {Function} callback 回调函数
	 * @param  {String}   args       布局 offset : 左 上 右 下..等;
	 */
	'auto': function(mode, callback, args) {
		var cs;
		if (isString(args)) {
			cs = args;
			args = {};
		} else {
			args || (args = {});
			cs = args.cs || SPACE;
		}
		/*if( typeof cs != 'string' ) {
			return $showbox( mode, callback );
		}*/
		var css = {};
		var rank_length = $Map.auto.rank.length;
		$autoToMap(css, cs.split(SPLIT_SEP));
		var key, i;
		var rainbox = $showbox(mode, function(id, dia) {
			// 初始化
			$runer(args.init, dia, id);
			dia.runer(callback, this, id, dia);
			// end
			$runer(args.last, dia, id);
			dia.onresize(resize);
			return true;
		});
		// 结束
		resize.call(rainbox, true);
		$runer(args.end || function() {
			$Map.auto.mix.animate(this, true);
		}, rainbox);

		function resize(is1st) {
			this.is1st = !!is1st;
			var css4 = {},
				ltrb, $autoMap = $Map.auto.mix;
			for (i = 0; i < rank_length; i++) {
				key = $Map.auto.rank[i];
				if (key in css && key in $autoMap) {
					ltrb = css[key];
					if (ltrb[0] instanceof Dialog) continue;
					ltrb.unshift(this);
					$autoMap[key].apply(css4, ltrb);
					ltrb.shift(this);
				}
			}
			this.room.css(css4);

			$repainting(this, true);
		}
		return rainbox;
	},
	'push': function(key, attr, val) {
		var map = $Map[key] || ($Map[key] = {
			rank: [],
			mix: {}
		});
		var has = attr in map.mix;
		map.mix[attr] = val;
		if (has) return this;
		map.rank.push(attr);
		return this;
	}
};
// 窗口距容器的边距
$export.push('auto', 'offset', function(D, l, t, r, b) {
	var room = D.room[0];
	var h = room.offsetHeight;
	var w = room.offsetWidth
	var offset_h = h - D.room.height();
	var offset_w = w - D.room.width(); +
	t && (this.top = t); +
	l && (this.left = l);
	var width = SCREEN.width - this.left - r - offset_w;
	var height = SCREEN.height - this.top - b - offset_h;
	if (width)
		this.width = width;
	if (height)
		this.height = height;
});
// 计算内部布局
$export.push('auto', 'inner', function(D, l, t, r, b, center, offset) {
	var room = D.room;
	var HEAD = room.find(t),
		BODY = room.find(center),
		FOOT = room.find(b);
	var H = HEAD[0] || {},
		B = BODY[0] || {},
		F = FOOT[0] || {};
	var hh = H.offsetHeight >> 0,
		bsh = B.scrollHeight >> 0,
		bh = B.offsetHeight >> 0,
		fh = F.offsetHeight >> 0;
	var wh = SCREEN.height - offset >> 0;
	var ww = SCREEN.width - offset >> 0;
	var css = {};
	css.width = ww >= B.scrollWidth ? 'auto' : ww;
	// console.log(B.scrollWidth, ww)
	css.height = bsh > bh || hh + bh + fh > wh ? Math.min(bsh, wh - hh - fh) : 'auto';
	BODY.css(css);
})
// 设置居中
$export.push('auto', 'center', function(D, center) {
	if (!/^true$/.test(center)) return;
	$repainting(D, true);
});
// 第一次打开时的动画 可以被覆盖 @see dialog.push('auto', 'animate', Function)
$export.push('auto', 'animate', function(D, use, start, end) {
	if (/^true$/.test(use)) {
		$repainting(D, true);
		if (D.is1st != undefined && !D.is1st) return;
		D.room.stop(true, true).css({
			top: start || '+=10'
		}).stop(true, true).animate({
			top: end || '-=10',
			opacity: 1
		});
	}
})
module.exports = $export;
}));
