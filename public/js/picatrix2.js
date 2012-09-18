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
	
	/*
	if ($('[name=q]').val().length === 0) {
	}
	*/
	$('[name=q]').val('ted');
	
	var searcher = new Searcher();
	searcher.keysearch($('[name=q]').val(), function(events) {
	    drawHistogram(events);
	});
	
	$('#searchBox').submit(function(event) {
		event.preventDefault();
		searcher.keysearch($('[name=q]').val(), function(events) {
		    drawHistogram(events);
		});
	});
	
	$(window).resize(function(event) {
		searcher.keysearch($('[name=q]').val(), function(events) {
		    drawHistogram(events);
		});
	});
	
    function drawHistogram(events) {
        
        var searchBox = $('#searchBox');
	    searchBox.css({
		    width : $(window).width(),
		    height : 50,
		    backgroundColor : 'cornsilk'
	    });
	    
	    var viewBox = $('#viewBox');
	    viewBox.css({
		    width : $(window).width(),
		    height : Math.floor(($(window).height() - searchBox.height()) * 76/100),
		    minHeight : 200,
		    backgroundColor : 'azure'
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
        
        var CANVAS_MAX_WIDTH = 32766; //(2^15)-2
        
        /* for simplicity and practicality, 
        *  hSpace + (2 * hSpace)
        *  must be <= CANVAS_MAX_WIDTH */
        
        /*
	    var hWidth = 100000;
	    var hSpace = 50000;
	    */
	    var hWidth = 20;
	    var hSpace = 1;
	    
	    var browserWidth = $(window).width();
	    
	    var clickIndex = 0;
	    var mouseIndex = -1;
	    
	    var histValues = [];
		var maxValue = 0;
		for (var i = 0; i < events.arr.length; i++) {
		    var values = [];
            var converter = new Converter();
            var s = converter.toSeries(events.arr[i], 75);
            for (var j = 0; j < s.length; j++) {
                if (s[j].n > 0) {
				    values.push(s[j].n);
                }
			    if (s[j].n > maxValue) {
				    maxValue = s[j].n;
			    }
            }
		    histValues.push(values);
		}
		
		/* delete me testing */
		histValues = [ [1, 1], [1, 1] ];
		//console.log(histValues);
		
		/*
		query = ted
		histValues = [ [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1] ]
		histValues.length = 2
		histValues[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1]
		histValues[0].length = 9
		histValues[1] = [1, 1, 1, 1, 1, 1, 1]
		histValues[1].length = 7
		*/
		
		var eventLengths = [];
		var eventWidths = [];
		var totalEventWidth = 0;
		var canvasAmounts = [];
		for (var i = 0; i < histValues.length; i++) {
		    var eventLength = histValues[i].length;
		    var eventWidth = (eventLength * hWidth) + ((eventLength + 1) * hSpace);
		    var canvasAmount = Math.ceil(eventWidth/CANVAS_MAX_WIDTH);
		    eventLengths.push(eventLength);
		    eventWidths.push(eventWidth);
		    totalEventWidth += eventWidth;
		    canvasAmounts.push(canvasAmount);
		    //console.log(eventLength);
		    //console.log(eventWidth);
		}
		console.log(eventLengths);
		console.log(eventWidths);
		console.log(canvasAmounts);
		//console.log(totalEventWidth);
		
		var histogramWrap = $('#histogramWrap');
		histogramWrap.css({
			width : totalEventWidth,
			height : controlBox.height(),
			backgroundColor : 'aqua',
			marginTop : 0,
			marginRight : 'auto',
			marginBottom : 0,
			marginLeft : 'auto'
		});
		
		// APPEND CANVAS TO DOM
		var canvasIndex = 0;
		for (var i = 0; i < canvasAmounts.length; i++) {
		    var canvasAmount = canvasAmounts[i];
		    for (var j = 0; j < canvasAmount; j++) {
		        histogramWrap.append('<canvas id="histogram_'+canvasIndex+'"></canvas>');
		        canvasIndex++;
		    }
		}
	    
		var canvasIndex = 0;
		for (var i = 0; i < canvasAmounts.length; i++) {
		    var canvasAmount = canvasAmounts[i];
		    for (var j = 0; j < canvasAmount; j++) {
		        var h = $('#histogram_'+canvasIndex);
		        var c = h[0].getContext("2d");
		        var cWidth = ((j+1) < canvasAmount) ? CANVAS_MAX_WIDTH : (eventWidths[i] - ((canvasAmount-1) * CANVAS_MAX_WIDTH));
		        
		        //console.log("j: " + j);
		        //console.log("canvasIndex: " + canvasIndex);
		        //console.log("cWidth: " + cWidth);
		        
		        h.attr({
			        width : cWidth,
			        height : histogramWrap.height()
		        }).css({
	                display : 'block',
	                float : 'left'
                });
                
                c.fillStyle = (canvasIndex % 2 === 0) ? 'red' : 'blue';
                c.fillRect(0, 0, cWidth, histogramWrap.height());
                
		        canvasIndex++;
		    }
		}
	    
	    
	    
	    
	    
	    
	    
	    
	    var foo = histValues[0].length;    // assume this is the event length for a particular event.
		var bar = 0;    // assume this is the width thus far
		for (var i = 0; i < (2 * foo + 1); i++) {
		    var start = bar;
		    if (i % 2 === 0) {
		        bar += hSpace;
		    }
		    else {
		        bar += hWidth;
		    }
		    var end = bar;
		    console.log(start + ", " + end +"\n");
		    
		    var canvasStartIndex = Math.floor(start/CANVAS_MAX_WIDTH);
		    var canvasEndIndex = Math.floor(end/CANVAS_MAX_WIDTH);
		    console.log("\t" + canvasStartIndex + ", " + canvasEndIndex +"\n");
		}
	    
	    
	    
	    /*
		var eventRegions = [];
		var xCoord = 0;
		var canvasAmount = 0;
		var estimatedHistogramWidth = 0;
		var heightScale = 0;
		for (var i = 0; i < events.arr.length; i++) {
            var w = (values.length * hWidth + (values.length + 1) * hSpace);
            eventWidths.push(w);
            estimatedHistogramWidth += w;
		    eventRegions.push([xCoord, w+xCoord]);
	        xCoord += w;
		    histValues.push(values);
		}
		//console.log(eventRegions);
		//console.log(eventWidths);
		
		heightScale = histogramWrap.height() / maxValue;
		
		// APPEND CANVAS TO DOM
		for (var i = 0; i < canvasAmount; i++) {
		    histogramWrap.append('<canvas id="histogram_'+i+'"></canvas>');
		}
		
		// COLOR ALL CANVAS(ES) WHITE
		for (var i = 0; i < canvasAmount; i++) {
		    var h = $('#histogram_'+i);
		    var c = h[0].getContext("2d");
		    var hWidth = (i < canvasAmount-1) ? CANVAS_MAX_WIDTH : estimatedHistogramWidth - ((canvasAmount-1) * CANVAS_MAX_WIDTH);
		    
		    h.attr({
			    width : hWidth,
			    height : histogramWrap.height()
		    }).css({
	            display : 'block',
	            float : 'left'
            });
            
            //c.fillStyle = '#FFF';
            //c.fillStyle = 'aqua';
            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	        c.fillStyle = (i % 2 === 0) ? 'red' : 'blue';
            c.fillRect(0, 0, hWidth, histogramWrap.height());
		}
		
		//console.log(eventRegions);
		// COLOR EVENT REGION
		for (var i = 0; i < canvasAmount; i++) {
	        var h = $('#histogram_'+i);
	        var c = h[0].getContext("2d");
	        
	        var start = (i*CANVAS_MAX_WIDTH);
	        var end = (i < canvasAmount-1) ? (CANVAS_MAX_WIDTH+(i*CANVAS_MAX_WIDTH)) : ((estimatedHistogramWidth - ((canvasAmount-1) * CANVAS_MAX_WIDTH))+(i*CANVAS_MAX_WIDTH)) ;
	        //console.log("start: " + (start) + " \nend: " + (end));
	        
		    //console.log(eventRegions);
		    for (var j = 0; j < eventRegions.length; j++) {
		        if (eventRegions[j][0] >= start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] <= end) {
		            //console.log("i: "+ i);
		            //console.log(eventRegions[j]);
		            var x = (eventRegions[j][0]-(i*CANVAS_MAX_WIDTH));
		            var width = (eventRegions[j][1]-(i*CANVAS_MAX_WIDTH))-x;
		            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(x, 0, width, histogramWrap.height()/2);
		        }
		        if (eventRegions[j][0] >= start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] > end) {
		            var x = (eventRegions[j][0]-(i*CANVAS_MAX_WIDTH));
		            var width = ((i+1)*CANVAS_MAX_WIDTH)-x;
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(x, 0, width, histogramWrap.height()/2);
		        }
		        if (eventRegions[j][0] < start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] <= end) {
		            var x = 0;
		            var width = (eventRegions[j][1]-(i*CANVAS_MAX_WIDTH));
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(x, 0, width, histogramWrap.height()/2);
		        }
		    }
		}
		*/
    }
	
});

