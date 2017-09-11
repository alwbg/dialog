/**
 * @autor alwbg@163.com | soei
 * -----------------------------------
 * - https://github.com/alwbg/dialog -
 * -----------------------------------
 * creation-time : 2017-09-08 10:32:48 AM
 * 提供弹窗,提示[左上,上中,右上,右下,下中,左下,中]位置显示,xx秒自动关闭功能
 * 支持全局和 AMD和CMD调用
 */
;(function( global, factory ){
	global[ 'global' ] = global;
	if( typeof exports === 'object' ) {
		//factory( require, exports, module );
	} else if (typeof define === 'function') {
		//AMD CMD
		define( 'dialog', factory );
	} else {
		var funcName = 'require';
		if( funcName && !global[ funcName ] ) {
			global[ funcName ] = function( id ) {
				alert( '需要实现 require(),加载模块:"' + id + '"' );
			};
		};
		var module = { exports : {} };
		factory( global[ funcName ] || new Function, module.exports, module );
		global['dialog'] = module.exports;
	}
}( this, function( require, exports, module ) {

	var Q 				= $ || require( 'query' );
	var Dialogs 		= {};
	var DialogsRanks 	= [];
	var Count 			= 0;
	var htmls 			= '<div class="windows"><div class="content" ></div><div class="bg" ></div></div>';

	var confirmHtml 	= '<div class="confirm">'+
	'	<div class="title">标题</div><div class="content">内容</div>'+
	'	<span class="cancel">取消</span><span class="submit">确定</span>'+
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
		//窗口关联, 当主窗口关闭时,先调用link对应的窗口remove方法后在执行当前remove
		this.link 		= null;
		Dialogs[ this.id ] = this;
		DialogsRanks.push( this );

		$runer( this.callback, Dialogs, this.id, this );
	}
	Dialog.prototype = {
		tips 		: module.exports.tips,
		onresize 	: function( fx ) {
			this._resize_.push( fx );
		},
		onclose 	: function( fx ) {
			this._close_.push( fx );
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
	var $Map = {
		'left top' : function() {
			return {
				left 	: 0,
				top 	: 0
			};
		},
		'center top' : function( box ) {
			return {
				top 	: 0,
				left 	: ( SCREEN.width - box.width ) / 2
			};
		},
		'center bottom' : function( box ) {
			return {
				top 	: SCREEN.height - box.height,
				left 	: ( SCREEN.width - box.width ) / 2
			};
		},
		'right top' : function( box ) {
			return {
				top 	: 0,
				left 	: SCREEN.width - box.width
			};
		},
		'right bottom' : function( box ) {
			return {
				top 	: SCREEN.height - box.height,
				left 	: SCREEN.width - box.width
			};
		},
		'left bottom' : function( box ) {
			return {
				top 	: SCREEN.height - box.height,
				left 	: 0
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
	function $center( id, position ) {
		var dialog 	= Q( id );

		var func = $Map[ position ];
		if( !( func instanceof Function ) ) {
			func = $Map.center;
		};
		var css 		= func( $pickWidthHeight( dialog.room || dialog ) );
		css.zIndex 		= 10;
		css.position 	= fixed;
		dialog.css( css );
		return SCREEN;
	}
	function $resize( O ) {
		$runer( O._resize_, O );
		var css     = $center( O.room, O.position );
		css.left    = css.top   = 0;
		O.bg.css( css );
	};
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
		dialog.resize().timer();
		room.css( { top : '+=10' } ).animate( { top : '-=10', opacity : 1 }, 400 );
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
			curr.bg.stop( true ).animate( { opacity : .1 }, 10 );
			curr.room.stop( true ).animate({ top : '-=30px', opacity : .5 }, 400, function() {
				curr.destroy();
			});
		};
	};
	Q( window ).resize( function() {
		SCREEN 	= $pickWidthHeight();
		for( var i in Dialogs ) {
			$resize( Dialogs[ i ] );
		}
	} ).keydown(  function( e ) {
		if( e.keyCode === 27 ) $current();
	} );

	var msg = {
		'showBox' 	: $showbox,
		'show'    	: $showbox,
		'list'    	: Dialogs,
		runer 		: $runer,
		'remove' : function( di ){
			$current( di );
		},
		'confirm' : function( title, content, callback ) {
			return $showbox( confirmHtml, function( id, dialog ) {
				var room = dialog.room;
				room.find( '.title' ).html( title );
				room.find( '.content' ).html( content );
				room.find( '.submit' ).click( function( e ) {
					if( ( callback instanceof Function ) && callback.call( dialog.root, msg, id ) ) {
						dialog.remove();
					}
					return false;
				} );
				room.find( '.cancel,.close' ).click( function(e) {
					dialog.remove();
					return false;
				} );
			} );
		},
		'tips' : function( msg, time, position ){
			if( time > 7 ) msg += '<span class="close">×</span>';
			return $showbox( msg, function( id, dialog ){
				dialog.root.addClass( 'dialog-tips' );
				dialog.root.find( '.content .close,.bg' ).click( function() {
					dialog.remove();
				});
			}, time, position );
		}
	};
	module.exports = msg;
}));
