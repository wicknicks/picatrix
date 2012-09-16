$(document).ready(function() {

	var histogramBarWidth = 200;
	var histogramBarSpacing = 1;
	var browserWidth = $(window).width();
	var canvasMaxWidth = 32766;
	
	var clickIndex = 0;
	var mouseIndex = -1;
	
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
	
	var searchBox = $('#searchBox');
	searchBox.css({
		width : $(window).width(),
		height : 50
	});
	
	var viewBox = $('#viewBox');
	viewBox.css({
		width : $(window).width(),
		height : Math.floor(($(window).height() - searchBox.height()) * 76/100),
		minHeight : 200,
		backgroundColor : '#888'
	});
	
	var controlBox = $('#controlBox');
	controlBox.css({
		overflowX: 'scroll',
		overflowY: 'scroll',
		width : $(window).width(),
		height : $(window).height() - searchBox.height() - viewBox.height(),
		minHeight : 100,
		backgroundColor : '#000'
	});
	
	//var viewGallery = $('#viewGallery');
	
	var searcher = new Searcher();
	searcher.keysearch('trip', function(events) {
		var histValues = [];
		var eventRegions = [];
		var xCoord = 0;
		var maxValue = 0;
		var canvasAmount = 0;
		var estimatedHistogramWidth = 0;
		var heightScale = 0;
		for (var i = 0; i < events.arr.length; i++) {
            var values = [];
            var converter = new Converter();
            var s = converter.toSeries(events.arr[i], 75);
            for (var j = 0; j < s.length; j++) {
                if (s[j].n > 0) {
				    values.push(s[j].n);
                    //console.log("\t"+s[j].n);
                    //console.log("\t"+s[j].interval.start + "-" + s[j].interval.start);
                }
			    if (s[j].n > maxValue) {
				    maxValue = s[j].n;
			    }
            }
            var w = (values.length * histogramBarWidth + (values.length + 1) * histogramBarSpacing);
            //console.log(values.length);
            console.log(w);
            //console.log(values);
            estimatedHistogramWidth += w;
		    eventRegions.push([xCoord, w+xCoord]);
	        xCoord += w;
		    histValues.push(values);
		}
		//console.log(eventRegions);
		
		var histogramWrap = $('#histogramWrap');
		histogramWrap.css({
			width : estimatedHistogramWidth,
			height : controlBox.height(),
			backgroundColor : 'aqua'
		});
		
		heightScale = histogramWrap.height() / maxValue;
		
		canvasAmount = Math.ceil(estimatedHistogramWidth/canvasMaxWidth);
		if (canvasAmount === 1) {
			histogramWrap.css({
				marginTop : 0,
				marginRight : 'auto',
				marginBottom : 0,
				marginLeft : 'auto'
			});
		}
		
		console.log("BROWSER WIDTH: " + browserWidth);
		console.log("CANVAS MAX WIDTH: " + canvasMaxWidth);
		console.log("MAX VALUE: " + maxValue);
		console.log("ESTIMATED HISTOGRAM WIDTH: " + estimatedHistogramWidth);
		console.log("HEIGHT SCALE: " + heightScale);
		console.log("CANVAS AMOUNT: " + canvasAmount);
		
		console.log("HISTVALUES LENGTH: " + histValues.length);
		for (var i = 0; i < histValues.length; i++) {
			//console.log(histValues[i].length);
			//console.log(histValues[i]);
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
            
            c.fillStyle = '#FFF';
            //c.fillStyle = 'aqua';
            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	        //c.fillStyle = (i % 2 === 0) ? 'red' : 'blue';
            c.fillRect(0, 0, hWidth, histogramWrap.height());
		}
		
		// COLOR EVENT REGION
		for (var i = 0; i < canvasAmount; i++) {
	        var h = $('#histogram_'+i);
	        var c = h[0].getContext("2d");
	        
	        var start = (i*canvasMaxWidth);
	        var end = (i < canvasAmount-1) ? (canvasMaxWidth+(i*canvasMaxWidth)) : ((estimatedHistogramWidth - ((canvasAmount-1) * canvasMaxWidth))+(i*canvasMaxWidth)) ;
	        console.log("start: " + (start) + " \nend: " + (end));
	        
		    //console.log(eventRegions);
		    for (var j = 0; j < eventRegions.length; j++) {
		        if (eventRegions[j][0] >= start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] <= end) {
		            //console.log(eventRegions[j]);
		            //console.log("i: "+ i);
		            
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth))-a;
		            //console.log(a + "___" + (b-a));
		            
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //console.log("c.fillRect("+a+", "+(0)+", "+(b-a)+", "+(histogramWrap.height()/2)+")");
		            c.fillRect(a, 0, b, histogramWrap.height());
		        }
		        if (eventRegions[j][0] >= start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] > end) {
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = ((i+1)*canvasMaxWidth)-a
		            //console.log(a + "___" + b);
		            
		            //c.fillStyle = "orange";
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(a, 0, b, histogramWrap.height());
		        }
		        if (eventRegions[j][0] < start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] <= end) {
		            var a = 0;
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth));
		            //console.log(a + "+++" + b);
		            
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //c.fillStyle = "orange";
		            c.fillRect(a, 0, b, histogramWrap.height());
		        }
		    }
	        
	        
	        
	        
		}
        /*
		var h1 = $('#histogram_'+0);
		var c1 = h[0].getContext("2d");
        c1.fillStyle = 'orange';
        c1.fillRect(0, 0, 17, histogramWrap.height());
        c1.fillStyle = 'green';
        c1.fillRect(17, 0, 65, histogramWrap.height());
        c1.fillStyle = 'orange';
        c1.fillRect(82, 0, 577, histogramWrap.height());
        c1.fillStyle = 'green';
        c1.fillRect(659, 0, 513, histogramWrap.height());
        c1.fillStyle = 'orange';
        c1.fillRect(1172, 0, 465, histogramWrap.height());
        c1.fillStyle = 'green';
        c1.fillRect(1637, 0, 97, histogramWrap.height());
        c1.fillStyle = 'orange';
        c1.fillRect(1734, 0, 129, histogramWrap.height());
        c1.fillStyle = 'green';
        c1.fillRect(1863, 0, 561, histogramWrap.height());
        c1.fillStyle = 'orange';
        c1.fillRect(2424, 0, 81, histogramWrap.height());
        c1.fillStyle = 'green';
        c1.fillRect(2505, 0, 369, histogramWrap.height());
        */
        
        /*
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
		var eventRegions = [];
		var xSum = 0;
		var xCoord = 0;
		for (var i = 0; i < events.arr.length; i++) {
		
            var s = converter.toSeries(events.arr[i], 75);
            
            for (var j = 0; j < s.length; j++) {
                if (s[j].n > 0) {
				    values.push(s[j].n);
                    //console.log("\t"+s[j].n);
                    //console.log("\t"+s[j].interval.start + "-" + s[j].interval.start);
                }
            }
		    var subEventWidth = (events.arr[i].photos.length * histogramBarWidth + (events.arr[i].photos.length + 1) * histogramBarSpacing);
		    xSum += subEventWidth;
		    //console.log(xSum);
		    //console.log(subEventWidth);
		    //console.log(xCoord);
		    eventRegions.push([xCoord, xSum]);
	        xCoord += subEventWidth;
		}
		*/
		
		/*
		// COLOR EVENT REGIONS
		for (var i = 0; i < canvasAmount; i++) {
	        var h = $('#histogram_'+i);
	        var c = h[0].getContext("2d");
	        
	        var absBegin = (i*canvasMaxWidth);
	        var absEnd = (i < canvasAmount-1) ? (canvasMaxWidth+(i*canvasMaxWidth)) : ((estimatedHistogramWidth - ((canvasAmount-1) * canvasMaxWidth))+(i*canvasMaxWidth)) ;
	        //console.log("abs begin: " + (absBegin) + " \nabs end: " + (absEnd));
	        
		    //console.log(eventRegions);
		    for (var j = 0; j < eventRegions.length; j++) {
		        if (eventRegions[j][0] >= absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] <= absEnd) {
		            //console.log(eventRegions[j]);
		            //console.log("i: "+ i);
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth))-a;
		            //console.log(a + "___" + (b-a));
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
		            //console.log("c.fillRect("+a+", "+(0)+", "+(b-a)+", "+(histogramWrap.height()/2)+")");
		            c.fillRect(a, 0, b, histogramWrap.height());
		        }
		        if (eventRegions[j][0] >= absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] > absEnd) {
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = ((i+1)*canvasMaxWidth)-a
		            //console.log(a + "___" + b);
		            
		            //c.fillStyle = "orange";
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(a, 0, b, histogramWrap.height());
		        }
		        if (eventRegions[j][0] < absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] <= absEnd) {
		            var a = 0;
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth));
		            //console.log(a + "+++" + b);
		            
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //c.fillStyle = "orange";
		            c.fillRect(a, 0, b, histogramWrap.height());
		        }
		    }
		}
		*/
		
		/*
		// COLOR HISTOGRAM BARS
		for (var i = 0; i < canvasAmount; i++) {
	        var h = $('#histogram_'+i);
	        var c = h[0].getContext("2d");
	        
	        var absBegin = (i*canvasMaxWidth);
	        var absEnd = (i < canvasAmount-1) ? (canvasMaxWidth+(i*canvasMaxWidth)) : ((estimatedHistogramWidth - ((canvasAmount-1) * canvasMaxWidth))+(i*canvasMaxWidth)) ;
	        //console.log("abs begin: " + (absBegin) + " \nabs end: " + (absEnd));
	        
		    //console.log(eventRegions);
		    //console.log(eventRegions.length);
		    
		    for (var j = 0; j < eventRegions.length; j++) {
		    	//console.log(eventRegions[j]);
		    	//console.log(eventRegions[j][0]);
		    	
		    	//console.log(histValues[j].length);
		    	for (var k = 0; k < histValues[j].length; k++) {
		    		console.log(k);
		    		//console.log(histValues[j][k]);
		    		
		    		c.fillStyle = 'white';
		    		c.fillRect(eventRegions[j][0]+histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*k, histogramWrap.height() - heightScale*histValues[j][k], histogramBarWidth, heightScale*histValues[j][k]);
		    	}
		    	
		        if (eventRegions[j][0] >= absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] <= absEnd) {
		            //console.log("i: "+ i);
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth))-a;
		            //console.log(a + "___" + (b-a));
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            //c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
		            //console.log("c.fillRect("+a+", "+(0)+", "+(b-a)+", "+(histogramWrap.height()/2)+")");
		            //c.fillRect(a, 0, b, histogramWrap.height());
		        }
		        if (eventRegions[j][0] >= absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] > absEnd) {
		            var a = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var b = ((i+1)*canvasMaxWidth)-a
		            //console.log(a + "___" + b);
		            
		            //c.fillStyle = "orange";
		            //c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //c.fillRect(a, 0, b, histogramWrap.height());
		        }
		        if (eventRegions[j][0] < absBegin && eventRegions[j][1] >= absBegin && eventRegions[j][0] <= absEnd && eventRegions[j][1] <= absEnd) {
		            var a = 0;
		            var b = (eventRegions[j][1]-(i*canvasMaxWidth));
		            //console.log(a + "+++" + b);
		            
		            //c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            //c.fillStyle = "orange";
		            //c.fillRect(a, 0, b, histogramWrap.height());
		        }
		    }
		}
		*/
		
		/*
		*/
		
		/*
		console.log("EVENTREGIONS LENGTH: " + eventRegions.length);
		for (var i = 0; i < eventRegions.length; i++) {
			//console.log(eventRegions[i]);
			console.log(eventRegions[i][0]);
		}
		*/
		
		/*
        var h1 = $('#histogram_0');
        var c1 = h1[0].getContext("2d");
        c1.fillStyle = 'white';
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*0, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*1, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*2, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*3, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*4, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*5, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*6, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*7, 1, histogramBarWidth, 126);
        c1.fillRect(histogramBarSpacing+(histogramBarWidth+histogramBarSpacing)*8, 1, histogramBarWidth, 126);
        */
        
        
		/*
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
