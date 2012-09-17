$(document).ready(function() {

	var histogramBarWidth = 32100;
	var histogramBarSpacing = 1;
	var browserWidth = $(window).width();
	var canvasMaxWidth = 32766; //(2^15)-2
	
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
	searcher.keysearch('ted', function(events) {
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
            //console.log(w);
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
	        //console.log("start: " + (start) + " \nend: " + (end));
	        
		    //console.log(eventRegions);
		    for (var j = 0; j < eventRegions.length; j++) {
		        if (eventRegions[j][0] >= start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] <= end) {
		            //console.log("i: "+ i);
		            //console.log(eventRegions[j]);
		            var x = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var width = (eventRegions[j][1]-(i*canvasMaxWidth))-x;
		            //c.fillStyle = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(x, 0, width, histogramWrap.height());
		        }
		        if (eventRegions[j][0] >= start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] > end) {
		            var x = (eventRegions[j][0]-(i*canvasMaxWidth));
		            var width = ((i+1)*canvasMaxWidth)-x;
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(x, 0, width, histogramWrap.height());
		        }
		        if (eventRegions[j][0] < start && eventRegions[j][1] >= start && eventRegions[j][0] <= end && eventRegions[j][1] <= end) {
		            var x = 0;
		            var width = (eventRegions[j][1]-(i*canvasMaxWidth));
		            //c.fillStyle = (j % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		            c.fillStyle = (j % 2 === 0) ? 'green' : 'purple';
		            c.fillRect(x, 0, width, histogramWrap.height());
		        }
		    }
		}
		
		
	});
	
	$('#searchBox').submit(function(event) {
		event.preventDefault();
		searcher.keysearch($('[name=q]').val(), function(events) {
		
		});
	});
});
