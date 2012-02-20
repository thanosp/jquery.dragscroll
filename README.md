# jquery.dragscroll.js #
## a scrolling plugin for the jQuery JavaScript Library ##

### PREPERATION ###

#### Required ####
- include the jquery javascript library in your document
- include jquery.dragscroll.js in your document
- add jquery.dragscroll.css to your page css styles

#### Optional ####
- if you want mousewheel support, include the jquery.mousewheel plugin before the jquery.dragscroll.js

### SETUP ###

- call this plugin on an overflow hidden container element like:
  $('#container').dragscroll(); 

#### Default Setup ####
    $('#container').dragscroll({
        scrollBars : true,
        autoFadeBars : true,
        smoothness : 15,
        mouseWheelVelocity : 2
    }); 

### OPSTIONS ###

- scrollBars: boolean			// default true. set this, if you want to have scrollbars enabled
- autoFadeBars : boolean		// default true. this auto-fades scrollbars in and out while scrolling or hoering over scrollbararea				
- smoothness : integer/float	// default 15. values between 1 and 18 work best, where 1 is no smoothing
- mouseWheelVelocity : float	// default 2. values between 1 and 2
- onScrollStart : function		// user callback function when scrolling starts
- onScrollEnds : function		// user callback function when scrolling stops
- ignoreMouseWheel : boolean    // default false. skips binding to the mouse wheel event

