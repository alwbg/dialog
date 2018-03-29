/**
 * @autor alwbg@163.com | soei
 * -----------------------------------
 * - https://github.com/alwbg/dialog -
 * -----------------------------------
 * creation-time : 2018-03-29 16:55:52 PM
 * 提供弹窗,提示[左上,上中,右上,右下,下中,左下,中]位置显示,xx秒自动关闭功能
 * 支持全局和 AMD和CMD调用
 * update 2018-03-29
 * - 新增 auto内的配置项 
 * dialog.auto( html, Function, 
 * 'inner:左边距 上边距 右边距 下边距 中间选择器';
 * animate:true|false 开始位置 结束位置 ;
 * offset: 左 上 右 下;
 * center:true
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
				return global[id];
			};
		};
		var MODULE = { exports : {} };
		factory( global[ funcName ] || function( id ) {
			alert( '需要实现 require(),加载模块:"' + id + '"' );
		}, MODULE.exports, MODULE );
		global['dialog'] = MODULE.exports;
	}
}( this, function( require, exports, module ) {

	var Q 				= $ || require( 'query' );
	var Dialogs 		= {};
	var DialogsRanks 	= [];
	var Count 			= 0;

	var SPLIT_SEP 		= /\s*;\s*/;
	var SPLIT_KV		= /\s*:\s*/;
	var SPACE 			= '';
	var htmls 			= '<div class="windows"><div class="content" ></div><div class="bg" ></div></div>';

	var confirmHtml 	= '<div class="confirm">'+
	'	<div class="confirm-title">标题</div><div class="confirm-content">内容</div>'+
	'	<span class="confirm-cancel">取消</span><span class="confirm-submit">确定</span>'+
	'</div>';
	var isNotFixed 		= /ie\s*(6|5)/ig.test( navigator.userAgent );
	//var isBlur      	= /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*(?:7|8|9|10)|webkit)/i.test( navigator.userAgent );
	var fixed 			= isNotFixed ? 'absolute' : 'fixed';

	var ddoc 			= document.documentElement;
	var body 			= Q( ddoc );
	var overflow    	= body.css( 'overflow' );

	var SCREEN 	= $pickWidthHeight();
	function $pickWidthHeight( box ) {
		if( ! box ) box = ddoc;
		if( ! + box.nodeType ) box = box[ 0 ];
		return {
			height 	: box.clientHeight,
			width 	: box.clientWidth
		};
	}
	/**
	 * 合并与检索
	 */
	function merge( o, n ) {
		for( var i in n ) {
			if( i in  o ) continue;
			o[ i ] = n[ i ];
		}
	}
	/**
	 * 执行方法列队(走私)
	 * @param  {Array} rank    要执行的列表
	 * @param  {Object} context 执行上下文
	 */
	function $runer( rank, context ) {
		var args 	= Array.apply( null, arguments );
		rank 		= args.shift();
		context 	= args.shift();
		var isArray = rank instanceof Array, msg;
		if( ! isArray ) {
			rank = [ rank ];
		}
		for( var r = 0, rl = rank.length; r < rl; r++ ) {
			if( rank[ r ] instanceof Function ) {
				msg = rank[ r ].apply( context, args );
				if( msg !== undefined ) return msg;
			}
		}
	}
	var ID = 20160516;
	/**
	 * 窗口类, tips提示,模式窗口的基类
	 * @param {JSON} args 配置信息
	 */
	function Dialog( args ) {
		merge( this, args );
		this.id 		= ID++;
		this._resize_ 	= [];
		this._close_ 	= [];
		this.offset 	= {};
		//窗口关联, 当主窗口关闭时,先调用link对应的窗口remove方法后在执行当前remove
		this.link 		= null;
		Dialogs[ this.id ] = this;
		DialogsRanks.push( this );

		this.isOwnSetting = $runer( this.callback, Dialogs, this.id, this );
	}
	Dialog.prototype = {
		tips 		: module.exports.tips,
		onresize 	: function( fx ) {
			return this._resize_.push( fx ), this;
		},
		onclose 	: function( fx ) {
			return this._close_.push( fx ), this;
		},
		remove 		: function( di ) {
			if( this.link instanceof Dialog ) this.link.remove();
			return $current( di || this ), this;
		},
		resize 		: function() {
			return $resize( this ), this;
		},
		glass 		: function( show ) {
			this.root.attr( 'is-blur', +show );
			Q( 'body' )[ show ? 'addClass' : 'removeClass']( 'blur' );
		},
		addClass : function( clazz ) {
			return this.room.addClass( clazz ), this;
		},
		timer : function() {
			if( +this.timeout ) {
				var self = this;
				self.times = setTimeout( function(){
					self.remove();
				}, this.timeout * 1000 );
			}
		},
		destroy : function() {
			$runer( this._close_ );
			Count -- ;
			this.root.remove();
			delete Dialogs[ this.id ];
			if( Count <= 0 )
				body.css( { 'overflow': overflow } );
			if( +this.root.attr( 'is-blur' ) ) this.glass();
		},
		cleartime : function() {
			clearTimeout( this.times );
		},
		runer 		: $runer
	};
	var $PositionMap = {
		'left top' : function( box, position ) {
			return {
				left 	: position.left >> 0,
				top 	: position.top >> 0
			};
		},
		'center top' : function( box, position ) {
			return {
				top 	: position.top >> 0,
				left 	: ( SCREEN.width - box.width ) / 2
			};
		},
		'center bottom' : function( box, position ) {
			return {
				top 	: SCREEN.height - box.height - (position.bottom >> 0),
				left 	: ( SCREEN.width - box.width ) / 2
			};
		},
		'right top' : function( box, position ) {
			return {
				top 	: position.top >> 0,
				//left 	: SCREEN.width - box.width - (position.right >> 0)
				right 	: 0
			};
		},
		'right bottom' : function( box, position ) {
			return {
				top 	: SCREEN.height - box.height - (position.bottom >> 0),
				left 	: SCREEN.width - box.width - (position.right >> 0)
			};
		},
		'left bottom' : function( box, position ) {
			return {
				top 	: SCREEN.height - box.height - ( position.bottom >> 0 ),
				left 	: position.left >> 0
			};
		},
		center : function( box ) {
			return {
				top 	: ( SCREEN.height - box.height ) / 2,
				left 	: ( SCREEN.width - box.width ) / 2
			};
		}
	};
	/**
	 * 设置居中
	 */
	function $center( id, position, dia, user ) {
		var dialog 	= Q( id );

		var func = $PositionMap[ position ] || null;
		if( !( func instanceof Function ) ) {
			func = $PositionMap.center;
		};
		var css 		= ! user && dia.isOwnSetting ? {} : func( $pickWidthHeight( dialog.room || dialog ), (dia||{}).offset || {} );
		css.zIndex 		= 10;
		css.position 	= fixed;
		dialog.css( css );
		return SCREEN;
	}
	// 当windows变化后执行
	function $resize( dia ) {
		$runer( dia._resize_, dia );
		$repainting( dia );
	};
	// 重新绘制
	function $repainting( dia, user ){
		var css     = $center( dia.room, dia.position, dia, user );
		css.left    = css.top   = 0;
		dia.bg.css( css );
	}
	/**
	 * 显示Dialog
	 * @param  {String} mode 要显示的窗体内容
	 * @param  {Function} fx 回调
	 * @param  {Number} time x秒后自动消失
	 * @return {Query}       
	 */
	function $showbox( mode, fx, time, position ) {
		var args 		= Array.apply( null, arguments );
		var callback 	= args.shift();
		var Md;
		if ( !( callback instanceof Function ) ) {
			Md = callback;
			callback = args.shift();
			if( ! callback ) callback = new Function;
		}
		var root 		= Q( htmls );

		var room 		= root.find( '>.content' );
		var bg 			= root.find( '>.bg' );

		room.html( Md );
		body.css( { 'overflow': 'hidden' } );
		var css 		= {
			position 	: fixed,
			top 		: 0,
			left 		: 0,
			zIndex 		: 100000
		};
		root.css( css );
		//jQ.appendTo存在两份( 多个html标签导致 )
		ddoc.appendChild( root[ 0 ] );
		Count ++;
		var dialog = new Dialog({
			root 		: root,
			room 		: room,
			bg 			: bg,
			position 	: position,
			callback 	: callback,
			timeout 	: time
		});
		root.attr( {id : dialog.id} );

		$Map.auto.mix.animate( dialog, ! dialog.isOwnSetting );
		return dialog;
	};
	//移除当前窗口
	function $current( dialog ) {
		var curr;
		if( dialog ) {
			var count = Count;
			while( count -- ) {
				if( DialogsRanks[ count ] === dialog ) {
					DialogsRanks.splice( count, 1 );
					curr = dialog;
					break;
				}
			}
		} else {
			curr = DialogsRanks.pop();
		}
		if( curr ) {
			curr.cleartime();
			curr.bg.stop( true, true ).animate( { opacity : .1 }, 10 );
			curr.room.stop( true, true ).animate({ top : '-=30px', opacity : .5 }, 400, function() {
				curr.destroy();
			});
		};
	};
	function $$resize() {
		SCREEN 	= $pickWidthHeight();
		for( var i in Dialogs ) {
			$resize( Dialogs[ i ] );
		}
	}
	Q( window ).resize( $$resize ).keydown(  function( e ) {
		if( e.keyCode === 27 ) $current();
	} );

	// 配置
	var $Map = {}
	function $autoToMap( css, list ){
		!css && (css = {});
		var kv, k, v, vs, fx;
		for( var i = 0, len = list.length; i < len; i++ ){
			kv = list[ i ].split( SPLIT_KV );
			k = kv[ 0 ];
			v = kv[ 1 ] || SPACE;
			if( (vs = v.split( /\s+/ )).length >= 1 ){
				css[ k ] = vs;
			}
		}
		return css;
	}

	var $export = {
		'showBox' 	: $showbox,
		'show'    	: $showbox,
		'list'    	: Dialogs,
		runer 		: $runer,
		merge 		: merge,
		resize 		: $$resize,
		'remove' : function( di ){
			$current( di );
		},
		'confirm' : function( title, content, callback ) {
			return $showbox( confirmHtml, function( id, dialog ) {
				var room = dialog.room;
				room.find( '.confirm-title' ).html( title );
				room.addClass( 'dialog-confirm' ).find( '.confirm-content' ).html( content );
				room.find( '.confirm-submit' ).click( function( e ) {
					if( $runer( callback, dialog.root, $export, dialog, e ) ) {
						dialog.remove();
					}
					return false;
				} );
				room.find( '.confirm-cancel,.close' ).click( function(e) {
					dialog.remove();
					return false;
				} );
			} );
		},
		'tips' : function( msg, time, position ) {
			if( time > 7 ) msg += '<span class="close">×</span>';
			return $showbox( msg, function( id, dialog ){
				dialog.root.addClass( 'dialog-tips' );
				dialog.root.find( '.content .close' + (time > 7 ? '' : ',.bg')  ).click( function() {
					dialog.remove();
				});
			}, time, position );
		},
		/**
		 * 自动适应
		 * @param  {String}   mode     内容
		 * @param  {Function} callback 回调函数
		 * @param  {String}   cs       布局 offset : 左 上 右 下..等;
		 */
		auto : function( mode, callback, cs ){
			if( typeof cs != 'string' ) {
				$showbox( mode, callback );
				return;
			}
			var css 		= {};
			var rank_length = $Map.auto.rank.length;
			$autoToMap( css, cs.split( SPLIT_SEP ) );
			var key, i;
			var d;
			$showbox( mode, function( id ){
				d = this[ id ];
				d.runer( callback, this, id );
				d.onresize( resize );
				return true;
			} );

			resize( true );
			function resize( isStart ){
				d.isStart = isStart;
				var css4 = {}, ltrb, $autoMap = $Map.auto.mix;
				for( i = 0; i < rank_length; i++ ){
					key = $Map.auto.rank[ i ];
					if( key in css && key in $autoMap ){
						ltrb = css[ key ];
						if( ltrb[ 0 ] instanceof Dialog ) continue;
						ltrb.unshift( d );
						$autoMap[ key ].apply( css4, ltrb );
						ltrb.shift( d );
					}
				}
				d.room.css( css4 );
			}
			return d;
		},
		push : function( key, attr, val ){
			var map = $Map[ key ] || ($Map[ key ] = {rank : [], mix : {}});
			var has = attr in map.mix;
			map.mix[ attr ] = val;
			if( has ) return this;
			map.rank.push( attr );
			return this;
		}
	};
	// 窗口距容器的边距
	$export.push( 'auto', 'offset', function(D, l, t, r, b){
		this.top 	= t >> 0;
		this.left 	= l >> 0;
		this.width 	= SCREEN.width - this.left - (r >> 0);
		this.height = SCREEN.height - this.top - (b >> 0);
	} );
	// 计算内部布局
	$export.push( 'auto', 'inner', function(D, l, t, r, b, center){
		var room = D.room;
		var B, H, F; 
		var HEAD = room.find( t );
		H = HEAD[ 0 ] || {};
		var BODY = room.find( center );
		B = BODY[ 0 ] || {};
		var FOOT = room.find( b );
		F = FOOT[ 0 ] || {};
		var hh 	= H.offsetHeight >> 0;
		var bsh = B.scrollHeight >> 0;
		var bh 	= B.offsetHeight >> 0;
		var fh 	= F.offsetHeight >> 0;
		var wh 	= SCREEN.height;
		var ww 	= SCREEN.width;
		var css = {};
		if( ww > 830 ) css.width = 'auto';
		else css.width = ww;
		if( bsh > bh || hh + bh + fh > wh ){
			css.maxHeight = Math.min( bsh + 30, wh - hh - fh );
		}
		BODY.css(css);
	} )
	// 设置居中
	$export.push( 'auto', 'center', function(D, center){
		if( !/^true$/.test( center ) ) return;
		$repainting( D, true );
	} );
	// 第一次打开时的动画 可以被覆盖 @see dialog.push('auto', 'animate', Function)
	$export.push( 'auto', 'animate', function(D, use, start, end){
		if( /^true$/.test( use ) ){
			$repainting( D, true );
			if( ! D.isStart ) return ;
			D.room.css( { top : start || '+=10' } ).stop(true,true).animate( { top : end || '-=10', opacity : 1 }, 400 );
		}
	} )
	module.exports = $export;
}));
