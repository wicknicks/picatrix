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
	    var hWidth = 20;
	    var hSpace = 1;
	    */
	    
	    var hWidth = 100000;
	    var hSpace = 50000;
	    
	    var browserWidth = $(window).width();
	    
	    //var clickIndex = 0;
	    //var mouseIndex = -1;
	    
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
		histValues = [ [1, 1], [1] ];
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
		console.log("eventLengths: ");
		console.log(eventLengths);
		console.log("eventWidths: ");
		console.log(eventWidths);
		console.log("canvasAmounts: ");
		console.log(canvasAmounts);
		//console.log(totalEventWidth);
		
		
		// SET HISTOGRAMWRAP WIDTH
		var histogramWrap = $('#histogramWrap');
		histogramWrap.css({
			width : totalEventWidth,
			height : controlBox.height(),
			marginTop : 0,
			marginRight : 'auto',
			marginBottom : 0,
			marginLeft : 'auto',
			backgroundColor : 'aqua'
		});
		
		
		// APPEND CANVAS(ES) TO HISTOGRAMWRAP
		var canvasIndex = 0;
		for (var i = 0; i < canvasAmounts.length; i++) {
		    var canvasAmount = canvasAmounts[i];
		    for (var j = 0; j < canvasAmount; j++) {
		        histogramWrap.append('<canvas id="histogram_'+canvasIndex+'"></canvas>');
		        var h = $('#histogram_'+canvasIndex);
		        var c = h[0].getContext("2d");
		        var cWidth = ((j+1) < canvasAmount) ? CANVAS_MAX_WIDTH : (eventWidths[i] - ((canvasAmount-1) * CANVAS_MAX_WIDTH));
		        h.attr({
			        width : cWidth,
			        height : histogramWrap.height()
		        }).css({
	                display : 'block',
	                float : 'left'
                });
                c.fillStyle = '#FFF';
                //c.fillStyle = (canvasIndex % 2 === 0) ? 'red' : 'blue';
                c.fillRect(0, 0, cWidth, histogramWrap.height());
		        canvasIndex++;
		    }
		}
		
		
		// DRAW/COLOR EVENT REGIONS ON CANVAS(ES)
		var cStart = 0;
		var cEnd = 0;
		for (var i = 0; i < canvasAmounts.length; i++) {
		    var canvasAmount = canvasAmounts[i];
		    cEnd += canvasAmount;
		    var _cWidth = 0;
		    for (var j = cStart; j < cEnd; j++) {
		        var h = $('#histogram_'+j);
		        var c = h[0].getContext("2d");
		        var cWidth = ((_cWidth+1) < canvasAmount) ? CANVAS_MAX_WIDTH : (eventWidths[i] - ((canvasAmount-1) * CANVAS_MAX_WIDTH));
		        c.fillStyle = (i % 2 === 0) ? 'red' : 'blue';
		        c.fillRect(0, 0, cWidth, histogramWrap.height() * .90);
		        _cWidth++;
		    }
		    cStart += canvasAmount;
		}
		
		
		
		
		/*
		*/
		// DRAW/COLOR HISTOGRAM BARS ON CANVAS(ES)
		// SAVE THIS BECAUSE WE WILL NEED IT TO DRAW THE HISTOGRAM BARS
		var eStart = 0;
		var eEnd = 0;
		for (var i = 0; i < histValues.length; i++) {
		    var hBar = 0;
		    var canvasAmount = canvasAmounts[i];
		    eEnd += canvasAmount;
		    
		    //console.log("event_"+i + " spans from canvas_" + eStart + " to canvas_" + (eEnd-1) + ", has " + eventLengths[i] + " histogram bar(s), and has a width of " + eventWidths[i] + "px");
		    
		    var hBarIndex = 0;
		    for (var j = 0; j < (2 * histValues[i].length + 1); j++) {
		        var _hBarStart = hBar;
		        hBar += (j % 2 === 0) ? hSpace : hWidth;
		        var _hBarEnd = hBar;
		        if (j % 2 !== 0) {
		            var hBarStart = Math.floor(eStart+(_hBarStart/CANVAS_MAX_WIDTH));
		            var hBarEnd = Math.floor(eStart+(_hBarEnd/CANVAS_MAX_WIDTH));
		            
		            
		            var fooboo = Math.floor(_hBarStart/CANVAS_MAX_WIDTH);
		            var barbaz = Math.floor(_hBarEnd/CANVAS_MAX_WIDTH);
		            
		            //console.log(_hBarStart + " _ " + _hBarEnd);
		            //console.log(fooboo + " - " + barbaz);
		            
		            console.log("histogrambar_"+hBarIndex + " of event_"+i + " spans from canvas_"+ hBarStart + " to canvas_" + hBarEnd);
		            
		            if (hBarStart === hBarEnd) {
		                //console.log("histogrambar_"+hBarIndex + " fits in a single <canvas> element");
		            }
		            else {
		                //console.log("histogrambar_"+hBarIndex + " fits in multiple <canvas> elements");
		                
		                
		                for (var k = hBarStart; k <= hBarEnd; k++) {
		                    var h = $('#histogram_'+k);
		                    var c = h[0].getContext("2d");
		                    c.fillStyle = 'aqua';
		                    
		                    if (k === hBarStart) {
		                        var w = ((fooboo+1) * CANVAS_MAX_WIDTH - _hBarStart);
		                        var xpos = CANVAS_MAX_WIDTH - w;
		                        
		                        //console.log("width: " + w);
		                        //console.log("xpos: " + xpos);
		                        console.log("$('#histogram_"+k+"').fillRect("+xpos+", 0, "+w+", histogramWrap.height() * .80);");
		                        c.fillRect(xpos, 0, w, histogramWrap.height() * .80);
		                        
		                    }
		                    else if (k === hBarEnd) {
		                        var w = (hWidth - ((barbaz - fooboo - 1)*CANVAS_MAX_WIDTH) - ((fooboo+1) * CANVAS_MAX_WIDTH - _hBarStart));
		                        
		                        //console.log("width: " + w);
		                        console.log("$('#histogram_"+k+"').fillRect(0, 0, "+w+", histogramWrap.height() * .80);");
		                        c.fillRect(0, 0, w, histogramWrap.height() * .80);
		                        
		                    }
		                    else {
		                        console.log("$('#histogram_"+k+"').fillRect(0, 0, 32766, histogramWrap.height() * .80);");
		                        c.fillRect(0, 0, CANVAS_MAX_WIDTH, histogramWrap.height() * .80);
		                    }
		                    
		                }
		                
		            }
		            
		            hBarIndex++;
		        }
		    }
		    eStart += canvasAmount;
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

