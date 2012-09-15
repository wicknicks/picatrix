$(document).ready(function() {
	
	$('#disableBox').hide();
	$('html').css({overflowX: 'hidden', overflowY: 'scroll'});
	$('body').attr("class", "enable").append(''
	+ '<form id="searchBox" method="get" action"">'
		+ '<input type="text" name="q" size=25 maxlength=255 value="" />'
		+ '<input type="submit" name="btn" value="Search" />'
		+ '<span style="visibility:hidden">&nbsp;</span>'
	+ '</form>'
	+ '<div id="viewBox">'
        + '<!--'
		+ '<ul id="viewGallery">'
		+ '<li><img src="img/city_1.jpg" alt="" /></li>'
		+ '<li><img src="img/city_2.jpg" alt="" /></li>'
		+ '<li><img src="img/city_3.jpg" alt="" /></li>'
		+ '<li><img src="img/city_4.jpg" alt="" /></li>'
		+ '<li><img src="img/city_5.jpg" alt="" /></li>'
		+ '<li><img src="img/city_6.jpg" alt="" /></li>'
		+ '<li><img src="img/city_7.jpg" alt="" /></li>'
		+ '<li><img src="img/city_8.jpg" alt="" /></li>'
		+ '<li><img src="img/city_9.jpg" alt="" /></li>'
		+ '</ul>'
        + '-->'
	+ '</div>'
	+ '<div id="controlBox">'
	    + '<div id="histogramWrap"></div>'
	+ '</div>'
	+ '');
	
	var searcher = new Searcher();
	var converter = new Converter();
	var clickIndex = 0;
	var mouseIndex = -1;
	var searchBox = $('#searchBox');
	var viewBox = $('#viewBox');
	var controlBox = $('#controlBox');
	var histogramWrap = $('#histogramWrap');
	var histogramBarWidth = 15;
	var histogramBarSpacing = 1;
	var browserWidth = $(window).width();
	var canvasMaxWidth = 32766;
	var canvasAmount = 0;
	
	//var viewGallery = $('#viewGallery');
	
	searcher.keysearch('trip', function(events) {
		
		/* TESTING
		// events;                                  // Object
		// events.query                             // String
		// events.n                                 // Integer
		// events.arr                               // Array
		// events.arr.length                        // Integer
		//console.log();
		*/
		
		var maxValue = 0;
		var estimatedHistogramWidth = 0;
		
		for (var i = 0; i < events.arr.length; i++) {
		    /* TESTING
		    // events.arr[i]                            // Object
		    // events.arr[i].interval.start             // Integer
		    // events.arr[i].interval.end               // Integer
		    // events.arr[i].photos                     // Array
		    // events.arr[i].photos.length              // Integer
		    // events.arr[i].photos[0]                  // Object
		    // events.arr[i].photos[0].timestamp        // Integer
		    // events.arr[i].photos[0].uid              // Integer
		    // events.arr[i].subevents                  // Array
		    // events.arr[i].subevents.length           // Object
		    // events.arr[i].title                      // String
		    console.log();
		    */
		    //console.log(events.arr[i].photos.length);
		    
		    estimatedHistogramWidth += (events.arr[i].photos.length * histogramBarWidth + (events.arr[i].photos.length + 1) * histogramBarSpacing);
		    
		    /*
		    // NOTE: <canvas> width cannot exceed 32767px
		    if (estimatedHistogramWidth > 32767) {
		        estimatedHistogramWidth = 32767;
		    }
		    // NOTE: When there are multiple <canvas>,
		    width cannot exceed 32766px (NOT 32767px)
		    */
		    
		    /*
		    console.log(events.arr[i].title);
		    console.log(events.arr[i].interval.start + "-" + events.arr[i].interval.end);
		    */
		
            var s = converter.toSeries(events.arr[i], 75);
            
            /* TESTING
            // s                        // Array
            // s.length                 // Integer
            console.log();
            */
            
            for (var j = 0; j < s.length; j++) {
                /* TESTING
                // s[j]                     // Object
                // s[j].interval.start      // Integer
                // s[j].interval.end        // Integer
                // s[j].n                   // Integer
                // s[j].rpic.uid            // Integer
                // s[j].rpic.timestamp      // Integer
                console.log();
                */
                
			    if (s[j].n > maxValue) {
				    maxValue = s[j].n;
			    }
                
                /*
                if (s[j].n > 0) {
                    console.log("\t"+s[j].n);
                    console.log("\t"+s[j].interval.start + "-" + s[j].interval.start);
                }
                */
            }
		}
		canvasAmount = Math.ceil(estimatedHistogramWidth/canvasMaxWidth);
		
		console.log("MAX VALUE: " + maxValue);
		console.log("BROWSER WIDTH: " + browserWidth);
		console.log("CANVAS MAX WIDTH: " + canvasMaxWidth);
		console.log("ESTIMATED HISTOGRAM WIDTH: " + estimatedHistogramWidth);
		console.log("CANVAS AMOUNT: " + canvasAmount);
		
		searchBox.css({
			width : $(window).width(),
			height : 50
		});
		
		viewBox.css({
			width : $(window).width(),
			height : Math.floor(($(window).height() - searchBox.height()) * 76/100),
			minHeight : 200,
			backgroundColor : '#888'
		});
		
		controlBox.css({
		    overflowX: 'scroll',
		    overflowY: 'scroll',
			width : $(window).width(),
			height : $(window).height() - searchBox.height() - viewBox.height(),
			minHeight : 100,
			backgroundColor : '#000'
		});
		
		histogramWrap.css({
		    width : estimatedHistogramWidth,
			height : controlBox.height(),
			backgroundColor : 'aqua'
		});
		if (canvasAmount === 1) {
		    histogramWrap.css({
		        marginTop : 0,
		        marginRight : 'auto',
		        marginBottom : 0,
		        marginLeft : 'auto'
		    });
		}
		
		// APPEND CANVAS TO DOM
		for (var i = 0; i < canvasAmount; i++) {
		    histogramWrap.append('<canvas id="histogram_'+i+'"></canvas>');
		}
		// COLOR ALL CANVAS(ES) WHITE
		for (var i = 0; i < canvasAmount; i++) {
		    var h = $('#histogram_'+i);
		    var c = h[0].getContext("2d");
		    var hWidth = (i < canvasAmount-1) ? canvasMaxWidth : estimatedHistogramWidth - ((canvasAmount-1) * canvasMaxWidth);
		    
		    h.attr({
			    width : hWidth,
			    height : histogramWrap.height()
		    }).css({
	            display : 'block',
	            float : 'left'
            });
            c.fillStyle = 'red';
            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	        //c.fillStyle = (i % 2 === 0) ? 'red' : 'blue';
            c.fillRect(0, 0, hWidth, histogramWrap.height());
		}
		
		var eventRegions = [];
		var xSum = 0;
		var xCoord = 0;
		for (var i = 0; i < events.arr.length; i++) {
		    var subEventWidth = (events.arr[i].photos.length * histogramBarWidth + (events.arr[i].photos.length + 1) * histogramBarSpacing);
		    xSum += subEventWidth;
		    //console.log(xSum);
		    //console.log(subEventWidth);
		    //console.log(xCoord);
		    eventRegions.push([xCoord, xSum]);
	        xCoord += subEventWidth;
		}
		//console.log(eventRegions);
		
		// COLOR EVENT REGIONS
		for (var i = 0; i < canvasAmount; i++) {
	        var h = $('#histogram_'+i);
	        var c = h[0].getContext("2d");
	        
	        var absBegin = (i*canvasMaxWidth);
	        //var end = (i < canvasAmount-1) ? canvasMaxWidth : estimatedHistogramWidth - ((canvasAmount-1) * canvasMaxWidth);
	        //var absEnd = end+(i*canvasMaxWidth);
	        var absEnd = (i < canvasAmount-1) ? (canvasMaxWidth+(i*canvasMaxWidth)) : ((estimatedHistogramWidth - ((canvasAmount-1) * canvasMaxWidth))+(i*canvasMaxWidth)) ;
	        
	        console.log("abs begin: " + (absBegin) + " \nabs end: " + (absEnd));
	        
		    console.log(eventRegions);
		    for (var j = 0; j < eventRegions.length; j++) {
		        if (eventRegions[j][0] >= absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] <= absEnd) {
		            //console.log(eventRegions[j]);
		            //console.log("i: "+ i);
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth));
		            console.log(a + "___" + (b-a));
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? '#EEE' : '#CFCFCF';
		            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
		            console.log("c.fillRect("+a+", "+(0)+", "+(b-a)+", "+(histogramWrap.height()/2)+")");
		            c.fillRect(a, 0, (b-a), histogramWrap.height());
		        }
		    }
		    /*
		    */
		}
		
		/*
        var h1 = $('#histogram_0');
        var c1 = h1[0].getContext("2d");
        c1.fillStyle = '#EEE';
        c1.fillRect(0, 0, 17, 101.5);
        c1.fillStyle = '#CFCFCF';
        c1.fillRect(17, 0, 225, 101.5);
        c1.fillStyle = 'green';
        c1.fillRect(242, 0, 3921, 101.5);
        c1.fillStyle = 'purple';
        c1.fillRect(4163, 0, 2385, 101.5);
        c1.fillStyle = 'yellow';
        c1.fillRect(6548, 0, 5793, 101.5);
        c1.fillStyle = 'orange';
        c1.fillRect(12341, 0, 1489, 101.5);
        c1.fillStyle = 'pink';
        c1.fillRect(13830, 0, 8145, 101.5);
        c1.fillStyle = 'aqua';
        c1.fillRect(21975, 0, 3073, 101.5);
		*/
		
	    /*
		var beginTimestamp = Number.MAX_VALUE;
		var endTimestamp = Number.MIN_VALUE;
		var series = [];
		for (var i = 0; i < events.arr.length; i++) {
		    if (events.arr[i].interval.start < beginTimestamp)
		        beginTimestamp = events.arr[i].interval.start;
		    if (events.arr[i].interval.end > endTimestamp)
		        endTimestamp = events.arr[i].interval.end;
		        
            var s = converter.toSeries(events.arr[i], 75);
            series.push(s);
		}
		var beginDate = new Date(beginTimestamp * 1000);
		var endDate = new Date(endTimestamp * 1000);
		
		console.log("beginTimestamp: " + beginTimestamp);
		console.log("endTimestamp: " + endTimestamp);
		console.log("beginDate: " + beginDate);
		console.log("endDate: " + endDate);
		
		console.log("series: " + series);
		console.log("series.length: " + series.length);
		console.log(series[0].length);
        */
		
		/*
		for (var i = 0; i < events.arr.length; i++) {
		    for (var j = 0; j < events.arr[i].photos.length; j++) {
		        console.log(events.arr[i].photos[j].timestamp);
		    }
		}
		*/
	});
	
	$('#searchBox').submit(function(event) {
		event.preventDefault();
		
		searcher.keysearch($('[name=q]').val(), function(events) {
		
		});
	});
});
