/**
 * @autor alwbg@163.com | soei
 * creation-time : 2017-08-29 16:48:29 PM
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
		funcName && (global[ funcName ] || (global[ funcName ] = function( id ){
			alert( '需要实现 require(),加载模块:"' + id + '"' )
		}))

		var module = { exports : {} }
		factory( global[ funcName ] || new Function, module.exports, module );
		global['dialog'] = module.exports;
	}
}( this, function( require, exports, module ) {

	var Q 			= require( 'query' );
	var Dialogs 	= {};
	var Count 		= 0;
	var htmls 		= '<div class="windows"><div class="content" ></div><div class="bg" ></div></div>';

	var confirmHtml = '<div class="confirm"><div class="title">标题</div><div class="content">内容</div><span class="cancel">取消</span><span class="submit">确定</span></div>';
	var isNotFixed 	= /ie\s*(6|5)/ig.test( navigator.userAgent );
	var isBlur      = /(?:trident\/\d*.*rv[^\w]*\d*|msie\s*(?:7|8|9|10)|webkit)/i.test( navigator.userAgent );
	var fixed 		= isNotFixed ? 'absolute' : 'fixed';

	var ddoc 		= document.documentElement
	var body 		= Q( ddoc );
	var overflow    = body.css( 'overflow' );
	/**
	 * 设置居中
	 */
	function setCenter( id ) {
		var dialog 	= Q( id ),
			h 		= dialog[0].clientHeight,
			w 		= dialog[0].clientWidth,
			wh 		= ddoc.clientHeight,
			ww 		= ddoc.clientWidth;

		dialog.css({
			top 	: ( wh - h ) / 2,
			left 	: ( ww - w ) / 2,
			zIndex 	: 10,
			position: fixed
		});
		return {
			width 	: ww,
			height 	: wh
		}
	}
	function ReSize( O ) {

		for( var i = 0, length = O.callback.length; i < length; i++ ){
			O.callback[ i ] instanceof Function && O.callback[i]( O );
		}
		var css     = setCenter( O.room );
		css.left    = css.top   = 0;
		O.bg.css( css );
	};
	var DialogsRanks = [];
	function showbox( mode, fx ) {
		var args 		= Array.apply( null, arguments );
		var callback 	= args.shift();
		var Md;
		if ( !( callback instanceof Function ) ) {
			Md = callback;
			callback = args.shift() || function() {};
		}
		//创建容器
		var ID 			= 'dialog-' + ( +new Date );
		var root 		= Q( htmls ).attr( { id: ID } );

		var room 		= root.find( '>.content' );
		var bg 			= root.find( '>.bg' );

		room.html( Md );
		/*isNotFixed && */body.css( { 'overflow': 'hidden' } );
		//bg.css( { 'opacity' : .5, 'backgroundColor' : '#000' } );
		var css 		= {};
		css.position 	= fixed;
		css.top 		= 0;
		css.left 		= 0;
		//css[ 'z-index' ] 		= 6;
		css.zIndex 		= 100
		root.css( css ).appendTo( 'body' );
		Count ++;
		Dialogs[ ID ] = {
			id      	: ID,
			root    	: root,
			room    	: room,
			bg      	: bg,
			callback	:[],
			center 		: setCenter,
			remove 	: function(){
				current()
			},
			glass 	: function( show ){
				this.root.attr( 'is-blur', +show );
				Q( 'body' )[ show ? 'addClass' : 'removeClass']( 'blur' );
			},
			resize 	: function(){
				ReSize( this );
			}
		}
		DialogsRanks.push( Dialogs[ ID ] );
		callback.call( Dialogs, ID );
		ReSize( Dialogs[ ID ] );
		room.css( {top : '+=10' } ).animate( { top : '-=10', opacity : 1}, 10 );
		return root;
	}
	//移除当前窗口
	function current(){
		var curr = DialogsRanks.pop();
		if( curr ){
			curr.bg.stop( true ).animate({ opacity : .1 }, 10 );
			curr.room.stop( true ).animate({ top : '-=30px', opacity : .5 }, 10,function(){
				var dialog = curr.root;
				Count -- ;
				dialog.remove();
				delete Dialogs[ curr.id ];
				//console.log(Dialogs)
				if( Count <= 0 )
					/*isNotFixed && */body.css( { 'overflow': overflow } );
				+curr.root.attr( 'is-blur' ) && curr.glass();
			})
		}
	}
	Q( window ).resize( function(){
		var css, O;
		for( var i in Dialogs ){
			ReSize( Dialogs[ i ] )
		}
	} ).keydown(  function( e ){
		if( e.keyCode == 27 ) current();
	} )

	var msg = {
		showBox : showbox,
		show    : showbox,
		list    : Dialogs,
		'remove' : function(  ){
			current()
		},
		'confirm' : function( title, content, callback ){
			showbox( confirmHtml, function( id ){
				var self = this[ id ], room = self.room;
				room.find( '.title' ).html( title );
				room.find( '.content' ).html( content );
				room.find( '.submit' ).click( function( e ){
					if( ( callback instanceof Function ) && callback.call( self.root, msg, id ) ){
						self.remove();
					}
					return false
				} )
				room.find( '.cancel,.close' ).click( function(e){
					self.remove();
					return false
				} )
			} )
		}
	}
	module.exports = msg
}))