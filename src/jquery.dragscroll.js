/*
 *\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *\\\\\\\\\\\\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *\\\\\\\\\\\\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/\/\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *\\\\\\\/\/\\/\\\/\/\/\\\\/\/\/\\\\\/\/\/\\\\\/\\\\\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *\\\\\/\\\\\/\\\/\\\\\\\/\\\\\/\\\/\\\\\/\\\\\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/\\\/\\\\\\\\
 *\\\\\\/\/\/\\\/\\\\\\\\\/\/\/\\\\\/\/\/\\\\\\\\/\\\\\/\/\/\\\/\/\/\\\\/\/\/\\\\/\\\/\\\\\\\\\
 *\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/\\\\/\\\\\/\\\/\\\\\\\/\\\\\\/\\\\\\/\\\/\\\/\\\\\\\\\\
 *\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\/\\/\\\\\\/\/\/\\\\/\/\/\\\/\\\\\\\/\/\/\\\\\/\\\/\\\\\\\\\\\
 *\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 *
 * jquery.dragscroll.js
 * a scrolling plugin for the jQuery JavaScript Library
 *
 * Copyright 2011, Thomas Appel, http://thomas-appel.com, mail(at)thomas-appel.com
 * dual licensed under MIT and GPL license
 * http://dev.thomas-appel.com/licenses/mit.txt
 * http://dev.thomas-appel.com/licenses/gpl.txt
 *
 * 
 *
 * changelog:
 * --------------------------------------------------------------------------------------------
 * - 0.2.b2pre:
 * --------------------------------------------------------------------------------------------
 *		- removed some options: onScrollInit, workOnChildElement, onScrollDirChange
 *		- fixed some problemes
 *		- changed some internal functions
 * -------------------------------------------------------------------------------------------- 
 * - 0.2.b1pre:
 * --------------------------------------------------------------------------------------------
 *		- completely rewrote this plugin
 *		- added scrollbars
 *		- added mousewheel support
 * --------------------------------------------------------------------------------------------
 * - 0.1.b5b	fixed classname removal on plugin destruction
 * - 0.1.b5a	rewrote almost the whole scrolling mechanism
 * - 0.1.b4:	rewrote event unbinding (teardown,destroy), plugin is now self destroyable
 * - 0.1.b3:	fixed event unbinding (teardown)
 * - 0.1.b2:	fixed touch event support
 * - 0.1.b1:	plugin teardown method added
 * --------------------------------------------------------------------------------------------
 *
 * usage:
 * --------------------------------------------------------------------------------------------
 * - $('selector').dragscroll();
 * - if jquery.event.destroyed.js is available or if you use javascriptMVC,
 *   the plugin will detroy itself automatically
 *
 * - to destroy plugin manually call  $('selector').data('dragscroll').destroy();
 *
 * - see index.html in example directory for a more complex sample setup
 * - visit http://dev.thomas-appel.com/dragscroll for a live demo
 *
 *
 * Features to come:
 * --------------------------------------------------------------------------------------------
 * - pageup pagedown key support
 * known issues:
 * --------------------------------------------------------------------------------------------
 * - 
 * --------------------------------------------------------------------------------------------
 * @author Thomas Appel 
 * @version 0.2.b1pre
 */

(function($, global){
	var doc = global.document,
		//body = $(doc.body),
		$global = $(global);
		
	function scrollbarDimension(c,b, method) {
		var a = c[0]['scroll'+method] / b['outer'+method]();
		return [a, Math.floor(b['inner'+method]()/a)];			
	}	

	function DragScroll(){
		this.init.apply(this,arguments);
	}

	DragScroll.prototype = {
		name : 'dragscroll',
		isTouchDevice : global.ontouchstart !== void 0
	};
	
	$.extend(DragScroll.prototype, {
		events : {
			
			M_DOWN : DragScroll.prototype.isTouchDevice ?  'touchstart.' + DragScroll.prototype.name : 'mousedown.' + DragScroll.prototype.name,
			M_UP : DragScroll.prototype.isTouchDevice ?  'touchend.' + DragScroll.prototype.name : 'mouseup.' + DragScroll.prototype.name,
			M_MOVE : DragScroll.prototype.isTouchDevice ?  'touchmove.' + DragScroll.prototype.name : 'mousemove.' + DragScroll.prototype.name,
			M_ENTER : 'mouseenter.' + DragScroll.prototype.name,
			M_LEAVE : 'mouseleave.' + DragScroll.prototype.name,
			M_WHEEL : 'mousewheel.' + DragScroll.prototype.name,
			S_STOP : 'scrollstop.' + DragScroll.prototype.name,
			S_START : 'scrollstart.' + DragScroll.prototype.name,
			SCROLL : 'scroll.' + DragScroll.prototype.name,
			RESIZE : DragScroll.prototype.isTouchDevice ?  'orientationchange.' + DragScroll.prototype.name : 'resize.' + DragScroll.prototype.name
			
		},
		init : function (elem, options) {
			var div = '<div/>', that = this;
			this.options = options;
			this.elem = elem;
			this.innerElem = this.elem.wrapInner( div ).children(0);
			this.scrollElem = this.innerElem.wrap(div).parent();
			this.elem.addClass( this.name+'-container' );
			this.innerElem.addClass(this.name+'-inner');
			this.scrollElem.addClass(this.name+'-scroller');
			var $div = $( div );
			
			this.scrollBarContainer = $( [$div, $div.clone()] );
			this.scrollBar = $( [$div.clone(), $div.clone()] );
			this.scrollBarContainer.each(function( i ) {
				var o = i === 0 ? 'h' : 'v',
				ah = that.options.autoFadeBars ? ' autohide' : '';
				that.scrollBarContainer[i]
					.addClass(that.name + '-scrollbar-container ' + o + ah)
					.append(that.scrollBar[i].addClass(that.name + '-scrollbar ' + o) );
				if (that.options.scrollBars) {						
					that.scrollBarContainer[i].appendTo(that.elem);	
				}			
			});

			this.elem.css('overflow','visible');
			
			this.mx = 0;
			this.my = 0;						
			this.__tmp__ = {_diff_x : 0,_diff_y : 0,_temp_x : 0,_temp_y : 0,_x : 0,_y : 0,_mx : 0,_my : 0,_deltaX : 0,_deltaY : 0,_start : {x:0,y:0}};
			this.__tmp__._scrolls = false;
			this._buildIndex();
			this.timer = void 0;			
			this._bind();
			this.elem.trigger(this.name + 'ready');			
		},
		/**
		 *  call this on changes of the scrollcontainer, e.g updated content, size changes, etc.
		 */
		reInit : function () {
			return this._buildIndex();
		},
		_buildIndex : function () {
			this.barIndex = {
				X : scrollbarDimension(this.scrollElem, this.scrollElem, 'Width'),
				Y : scrollbarDimension(this.scrollElem, this.scrollElem, 'Height')
			};
			this._getContainerOffset();
			this.scrollBar[0].css({width:this.barIndex.X[1]});
			this.scrollBar[1].css({height:this.barIndex.Y[1]});		
			
			this.__tmp__._cdd = {
				x : this.options.scrollBars ? this.scrollBarContainer[0].innerWidth() : this.scrollElem.innerWidth(),
				y : this.options.scrollBars ? this.scrollBarContainer[1].innerHeight() : this.scrollElem.innerHeight()
			}
			
		},
		_bind : function(){
			var that = this;
			$global.bind(this.events.RESIZE, $.proxy(this._buildIndex, this));
			this.elem.bind('destroyed',$.proxy(this.teardown,this));
			this.elem.bind(this.name + 'ready', $.proxy(this.onInitReady,this));
			//this.scrollBarContainer.bind(this.events.M_DOWN,$.proxy(this.scrollStart,this));			
			this.elem.delegate('.'+this.name+'-scrollbar-container', this.events.M_DOWN,$.proxy(this.scrollStart,this));						
			this.elem.bind( this.events.M_WHEEL, $.proxy(this.scrollStart,this));			
			
			this.scrollElem.bind( this.events.M_DOWN, $.proxy(this.dragScrollStart,this));	
												
			if ( this.options.autoFadeBars ) {
				this.elem.delegate('.'+this.name+'-scrollbar-container', 'mouseenter',$.proxy(this.showBars,this))			
					.delegate('.'+this.name+'-scrollbar-container', 'mouseleave',$.proxy(this.hideBars,this))							
					.bind( this.events.S_START, function() {
						that.options.onScrollStart.call(that.elem.addClass('scrolls'));
						that.showBars();
					})
					.bind( this.events.S_STOP, function(){
						that.options.onScrollEnd.call(that.elem.removeClass('scrolls'));
						that.hideBars();
					});
			}
		},
		_unbind : function(){
			this.elem.unbind(this.name + 'ready')
				.undelegate('.'+this.name+'-scrollbar-container', this.events.M_DOWN )
				.undelegate('.'+this.name+'-scrollbar-container', 'mouseenter' )
				.undelegate('.'+this.name+'-scrollbar-container', 'mouseleave' )
				.unbind( this.events.M_WHEEL )						
				.unbind( this.events.S_STOP )						
				.unbind( this.events.S_START );							
			this.scrollElem.unbind( this.events.M_DOWN );					
			$global.unbind(this.events.M_MOVE).unbind(this.events.M_UP).unbind(this.events.RESIZE);	
		},
		onInitReady : function () {
			if ( this.options.autoFadeBars ) {
				this.showBars().hideBars();
			}
		},
		initMouseWheel : function ( mode ) {
			switch (mode) {
			case 'rebind':
				this.elem.unbind( this.events.M_WHEEL ).bind( this.events.M_WHEEL, $.proxy( this.scrollStart,this ) );	
				break;
			default:
				this.elem.unbind( this.events.M_WHEEL ).bind( this.events.M_WHEEL, $.proxy( this._getMousePosition,this ) );					
				break;
			}			
		},
		
		_getContainerOffset : function() {
			this.containerOffset = this.elem.offset();
		},
		_pageXY : (function () {
			if ( DragScroll.prototype.isTouchDevice ) {
				return function(e){
					return {X:e.originalEvent.touches[0].pageX,Y:e.originalEvent.touches[0].pageY};
				};
			} else {
				return function(e){
					return {X:e.pageX,Y:e.pageY};					
				};				
			}
		}()),
		_getScrollOffset : function () {
			return {x : this.scrollElem[0].scrollLeft, y : this.scrollElem[0].scrollTop};
		},
		_getMousePosition : function( e, delta, deltaX, deltaY ) {
			//console.log(e.originalEvent.wheelDeltaX, e.originalEvent.wheelDeltaY)
			//console.log(deltaX, deltaY)
			if (!delta) {
				var page = this._pageXY.apply( this, arguments );								
				this.mx = this.__tmp__._scrollsX ? page.X - this.containerOffset.left : this.mx;	
				this.my = this.__tmp__._scrollsY ? page.Y - this.containerOffset.top : this.my;										
			} else {

				
				//deltaX = deltaX !== void 0 ? -deltaX : delta;
				//deltaY = deltaY !== void 0 ? deltaY : delta;
				deltaX = deltaX !== undefined ? -deltaX : delta;
				deltaY = deltaY !== undefined ? deltaY : delta;
				// try to normalize delta (in case of magic mouse )
				deltaX = Math.min(5, Math.max( deltaX , -5));
				deltaY = Math.min(5, Math.max( deltaY , -5));

				// TODO: revisit mousewheel normalisation

				this.__tmp__._deltaX = deltaX;
				this.__tmp__._deltaY = deltaY;
//				this.__tmp__._deltaX = null;
//				this.__tmp__._deltaY = null;
				if (deltaX === 0 && deltaY === 0) {
					this.scrollStop();
				}


			}
		},
		_getWheelDelta : function () {
				var mH = this.scrollElem.innerHeight(),
					mW = this.scrollElem.innerWidth();			
				this.mx -= this.mx <= mW ? this.__tmp__._deltaX * ( this.options.mouseWheelVelocity ) : 0;				
				this.my -= this.my <= mH ? this.__tmp__._deltaY * ( this.options.mouseWheelVelocity ) : 0;				
				this.mx = Math.min( Math.max( 0, this.mx ), mW );
				this.my = Math.min( Math.max( 0, this.my ), mH );			
				this.__tmp__._deltaX = null;
				this.__tmp__._deltaY = null;				
		},
		_getDragScrollPosition : function () {
			var tempX,tempY,sm = this.options.smoothness;
			 
			this.__tmp__._diff_x = this.__tmp__._diff_x > 0 ? 
					this.__tmp__._diff_x++ - ( this.__tmp__._diff_x++ / sm ) : 
					this.__tmp__._diff_x-- - ( this.__tmp__._diff_x-- / sm );
			this.__tmp__._diff_y = this.__tmp__._diff_y > 0 ? 
					this.__tmp__._diff_y++ - ( this.__tmp__._diff_y++ / sm ) : 
					this.__tmp__._diff_y-- - ( this.__tmp__._diff_y-- / sm );
									
			tempX = Math.round(Math.max(Math.min(this.scrollElem[0].scrollLeft + this.__tmp__._diff_x, this.scrollElem[0].scrollWidth ), 0));
			tempY = Math.round(Math.max(Math.min(this.scrollElem[0].scrollTop + this.__tmp__._diff_y, this.scrollElem[0].scrollHeight ), 0));

			this.__tmp__._x = tempX;
			this.__tmp__._y = tempY;
			return [ this.__tmp__._x, this.__tmp__._y];			
		},		
		_hasScrolledSince : function () {
			var sl = this.scrollElem[0].scrollLeft,
				st = this.scrollElem[0].scrollTop;
				return {verify : this.__tmp__._temp_x !== sl || this.__tmp__._temp_y !== st, scrollLeft : sl, scrollTop : st};				
		},
		_getScrollPosition : function(posL,posT) {
			var tempX,tempY;
			tempX = posL * this.barIndex.X[0];
			tempY = posT * this.barIndex.Y[0];
			
			this.__tmp__._x += ( tempX - this.__tmp__._x ) / this.options.smoothness ;
			this.__tmp__._y += ( tempY - this.__tmp__._y ) / this.options.smoothness ;
			//console.log(posT)
			return [ this.__tmp__._x, this.__tmp__._y];
		},
		_getDiff : function() {
			var t = this.scrollElem[0].scrollTop,
				l = this.scrollElem[0].scrollLeft;
				
			this.__tmp__._diff_x =  l - this.__tmp__._temp_x;
			this.__tmp__._diff_y =  t - this.__tmp__._temp_y;
			this.__tmp__._temp_x = l;				
			this.__tmp__._temp_y = t;	

		},				

		setScrollbar : function() {						
			this.scrollBar[0].css({left : Math.abs( Math.ceil( this.scrollElem[0].scrollLeft / this.barIndex.X[0] ) )});			
			this.scrollBar[1].css({top : Math.abs( Math.ceil( this.scrollElem[0].scrollTop / this.barIndex.Y[0] ) )});			
		},
		
		scroll:function(l,t){
			var sl = this.scrollElem[0].scrollLeft,
				st = this.scrollElem[0].scrollTop;
				l = this.__tmp__._scrollsX ? Math.round(l) : sl;
				t = this.__tmp__._scrollsY ? Math.round(t) : st;			
				this.scrollElem.scrollLeft(l).scrollTop(t);
		},		
		/**
		 * SCROLL START
		 * ====================================================================================
		 */
		scrollStart : function( e, delta ) {	
			
			var target = e.target, targetX = target === this.scrollBar[0][0], targetY = target === this.scrollBar[1][0], 
			targetCX = target === this.scrollBarContainer[0][0], targetCY = target === this.scrollBarContainer[1][0];
			
			e.preventDefault();
			
			this.scrollElem.unbind( this.events.SCROLL );

			this.__tmp__._scrollsX = targetX || targetCX;
			this.__tmp__._scrollsY = targetY || targetCY;

			this._getMousePosition.apply( this, arguments );
			
			if (delta) {					
				
				this.__tmp__._scrollsX = true;
				this.__tmp__._scrollsY = true;	
				this.__tmp__._mode = 'wheel';
				
				this.initMouseWheel();
				
			} else {
				
				$global.bind(this.events.M_MOVE,$.proxy(this._getMousePosition,this));	
				$global.bind(this.events.M_UP,$.proxy(this.scrollStop,this));				
				
				this.__tmp__._start.x = targetX ? 
					this.mx - this.scrollBar[0].offset().left + this.scrollBarContainer[0].offset().left : 
						targetCX ? 
							Math.round( this.scrollBar[0].outerWidth() / 2 ) : 
							0;
				this.__tmp__._start.y = targetY ? 
					this.my - this.scrollBar[1].offset().top + this.scrollBarContainer[1].offset().top : 
						targetCY ? 
							Math.round(this.scrollBar[1].outerHeight()/2) : 
							0;						
				this.__tmp__._mode = 'scrollbar';
			}
			
			this.startTimer('scrollBPos');					
			this.elem.trigger( this.events.S_START );		
		},
		_getSCBPos : function () {
			
		},
		scrollBPos : function () {	
			var t,l,pos;
			
			this._getDiff();
			if (this.__tmp__._mode === 'wheel') {
				this._getWheelDelta();
			}
			l = Math.min(Math.max( 0, this.mx - this.__tmp__._start.x ), this.__tmp__._cdd.x - this.barIndex.X[1] );
			t = Math.min(Math.max( 0, this.my - this.__tmp__._start.y ), this.__tmp__._cdd.y - this.barIndex.Y[1] );

			pos = this._getScrollPosition( l, t );			

			this.__tmp__._scrollsX && this.scrollBar[0].css( {left : l} );			
			this.__tmp__._scrollsY && this.scrollBar[1].css( {top : t} );			

			this.scroll( pos[0], pos[1] );				
			this.startTimer('scrollBPos');			
			
			if ( this.__tmp__._mode === 'wheel' && this.__tmp__._scrolls && !this._hasScrolledSince().verify ) {
				this.scrollStop();				
			}
			
			if (!this.__tmp__._scrolls) {
				 this.__tmp__._scrolls = true;
			} 
			this.__tmp__.mx = this.mx;
			this.__tmp__.my = this.my;			
		},
		
		scrollStop : function( e ) {			
			var hasScrolled = this._hasScrolledSince();
			
			$global.unbind( this.events.M_MOVE );				
			$global.unbind( this.events.M_UP );	

			if ( hasScrolled.verify ) {	
				this.startTimer('scrollStop');			
			} else {													
				this.stopScroll();	
				this.__tmp__._scrolls = false;				
				this.initMouseWheel('rebind');				
				this.elem.trigger( this.events.S_STOP );	
				this.__tmp__._mx = null;
				this.__tmp__._my = null;
				this.__tmp__._start.x = 0;				
				this.__tmp__._start.y = 0;				
			}
			this.__tmp__._temp_x = hasScrolled.scrollLeft;
			this.__tmp__._temp_y = hasScrolled.scrollTop;
		},

		/**
		 * DRAGSCROLL START
		 * ====================================================================================
		 */

		dragScrollStart : function ( e ) {
			this.stopScroll();
			e.preventDefault();
			this.__tmp__._scrollsX = true;
			this.__tmp__._scrollsY = true;				
			
			this._getMousePosition.apply( this, arguments );				
			
			this.__tmp__._start.x = this.mx + this.scrollElem[0].scrollLeft;
			this.__tmp__._start.y = this.my + this.scrollElem[0].scrollTop;
			
			// start to record the mouse distance
						
			$global.bind( this.events.M_MOVE, $.proxy( this._getMousePosition, this ) );				
			$global.bind( this.events.M_UP, $.proxy( this._initDragScrollStop,this ) );	
			
			this.scrollElem.bind( this.events.SCROLL, $.proxy( this.setScrollbar,this ) );		
			this.startTimer('dragScrollMove');
			this.elem.trigger( this.events.S_START );		
		},
		_checkDirection : function () {
			
		},
		dragScrollMove : function(){					
			
			this.stop = false;
			var sl = Math.min(Math.max(this.__tmp__._start.x - this.mx,0),this.scrollElem[0].scrollWidth),			 
				st = Math.min(Math.max(this.__tmp__._start.y - this.my,0),this.scrollElem[0].scrollHeight),
				scrolled = this._getScrollOffset();
			this._getDiff();
			this.scroll( sl, st );											
			this.__tmp__.temp_x = scrolled.x;
			this.__tmp__.temp_y	= scrolled.y;		
			
			this.startTimer('dragScrollMove');			
		},
		_initDragScrollStop : function (){
			$global.unbind( this.events.M_MOVE );	
			$global.unbind( this.events.M_UP );						
			this.elem.removeClass('scrolls');
			this.stopScroll();
			this.dargScrollStop();
		},
		dargScrollStop : function () {
			var hasScrolled = this._hasScrolledSince(),pos;
			
			if ( hasScrolled.verify ) {
				pos = this._getDragScrollPosition();
				this.scroll( pos[0], pos[1] );	
				
				this.startTimer('dargScrollStop');			
				this.__tmp__._temp_x = hasScrolled.scrollLeft;
				this.__tmp__._temp_y = hasScrolled.scrollTop;				
			} else {
				this.stopScroll();
				this.scrollElem.unbind( this.events.SCROLL ) ;
				this.elem.trigger( this.events.S_STOP );
			}								
		},
		
		hideBars : function(){	
			if (this.__tmp__._scrolls) {
				return this;
			}
			this.scrollBarContainer.each(function(){
				this.stop().delay(100).fadeTo(250,0);
			});			
			return this;
		}, 
		showBars : function(){
			
			this.scrollBarContainer.each(function(){
				this.css({opacity:0,display:'block'});
				this.stop().delay(100).fadeTo(250,1);
			});
			return this;
		},
		startTimer : function (fn) {
			var that = this;			
			this.timer = global.setTimeout(function(){
				that[fn]();
			},15);
		},
		stopScroll : function(){
			global.clearTimeout( this.timer );
			this.timer = void 0;
		},		

		teardown : function (e) {
			this.elem.removeClass('scrolls');
			this._unbind();
			this.elem.unbind('destroyed');
			$.removeData( this.name );
		}
	});

	$.fn.dragscroll = function( options ) {
		var defaults = {
				scrollClassName : '',
				scrollBars : true,
				smoothness : 15,
				mouseWheelVelocity : 2,
				autoFadeBars : true,				
				onScrollStart : function(){},
				onScrollEnd : function(){}
			},
			o = $.extend({}, defaults, options),
			elem = this;	
		return this.each(function(){
			$(this).data( DragScroll.prototype.name, new DragScroll( elem, o ) );
		});
	};
}(this.jQuery, this));