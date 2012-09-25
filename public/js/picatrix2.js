$(document).ready(function() {
	// BEGIN DYNAMIC SITE CREATION
	$('#disableBox').hide();
	$('html').css({overflowX: 'hidden', overflowY: 'scroll'});
	$('body').attr("class", "enable").append(''
	+ '<form id="searchBox" method="post" action"">'
		+ '<input type="text" name="query" size=25 maxlength=255 value="" />'
		+ '<input type="submit" name="button" value="Search" />'
		+ '<span style="visibility:hidden">&nbsp;</span>'
	+ '</form>'
	+ '<div id="viewBox">'
	    //+ 'click to test'
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
	if (typeof(sessionStorage.query) === "undefined") {
	    sessionStorage.query = "trip";
	}
	$('[name=query]').val(sessionStorage.query);
	// END DYNAMIC SITE CREATION
	
	var searcher = new Searcher();
	searcher.keysearch(sessionStorage.query, function(events) {
	    drawHistogram(events);
	});
	
	$('#searchBox').submit(function(event) {
		event.preventDefault();
		sessionStorage.query = $('[name=query]').val();
	    searcher.keysearch(sessionStorage.query, function(events) {
	        drawHistogram(events);
	    });
	});
	
	$(window).resize(function(event) {
	    searcher.keysearch(sessionStorage.query, function(events) {
	        drawHistogram(events);
	    });
	});
	
	// BEGIN TEST
	/*
	$('#viewBox').click(function(event) {
		alert(sessionStorage.query);
	});
	*/
	// END TEST
	
    function drawHistogram(events) {
        
        var searchBox = $('#searchBox');
	    searchBox.css({
		    width: $(window).width(),
		    height: 50,
		    backgroundColor: 'CornflowerBlue'
	    });
	    
	    var viewBox = $('#viewBox');
	    viewBox.css({
		    width: $(window).width(),
		    height: Math.floor(($(window).height() - searchBox.height()) * 76/100),
		    minHeight: 200,
		    backgroundColor: 'azure'
	    });
	    
	    var controlBox = $('#controlBox');
	    controlBox.css({
	        position: 'relative',
		    overflowX: 'hidden',
		    overflowY: 'hidden',
		    width: $(window).width(),
		    height: $(window).height() - searchBox.height() - viewBox.height(),
		    minHeight: 100,
		    backgroundColor: '#000'
	    });
	    
	    //var viewGallery = $('#viewGallery');
        
        var CANVAS_MAX_WIDTH = 32766; //(2^15)-2
        
	    var hWidth = 16;
	    var hSpace = 1;
	    
	    //var clickIndex = 0;
	    //var hoverIndex = -1;
	    
	    var histValues = [];
		var maxValue = 0;
		var eventTitles = [];
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
		    eventTitles.push(events.arr[i].title);
		}
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
		}
		
		// SET HISTOGRAMWRAP WIDTH
		var histogramWrap = $('#histogramWrap');
		histogramWrap.css({
			width : totalEventWidth,
			height : controlBox.height(),
		    marginTop: 0,
		    marginRight: 'auto',
		    marginBottom: 0,
		    marginLeft: 'auto'
		});
		
		// REMOVE ANY CANVAS(ES) AND ARROWS
		histogramWrap.empty();
		$('#carousel_left_arrow').remove();
		$('#carousel_right_arrow').remove();
		
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
		        //c.fillStyle = (i % 2 === 0) ? 'yellow' : 'red';
		        c.fillStyle = (i % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
		        c.fillRect(0, 0, cWidth, histogramWrap.height());
		        _cWidth++;
		    }
		    cStart += canvasAmount;
		}
		
		// DRAW/COLOR HISTOGRAM BARS ON CANVAS(ES)
		var heightScale = histogramWrap.height() / maxValue;
		var eStart = 0;
		var eEnd = 0;
		for (var i = 0; i < histValues.length; i++) {
		    var hBar = 0;
		    var canvasAmount = canvasAmounts[i];
		    eEnd += canvasAmount;
		    
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
		            if (hBarStart === hBarEnd) {
		                var h = $('#histogram_'+hBarStart);
		                var c = h[0].getContext("2d");
		                c.fillStyle = '#0033CC';
		                c.fillRect(_hBarStart, histogramWrap.height() - histValues[i][hBarIndex]*heightScale, hWidth, histValues[i][hBarIndex]*heightScale);
		                
		            }
		            else {
		                for (var k = hBarStart; k <= hBarEnd; k++) {
		                    var h = $('#histogram_'+k);
		                    var c = h[0].getContext("2d");
		                    c.fillStyle = '#0033CC';
		                    if (k === hBarStart) {
		                        c.fillRect((CANVAS_MAX_WIDTH - ((fooboo+1) * CANVAS_MAX_WIDTH - _hBarStart)), histogramWrap.height() - histValues[i][hBarIndex]*heightScale, ((fooboo+1) * CANVAS_MAX_WIDTH - _hBarStart), histValues[i][hBarIndex]*heightScale);
		                        
		                    }
		                    else if (k === hBarEnd) {
		                        c.fillRect(0, histogramWrap.height() - histValues[i][hBarIndex]*heightScale, (hWidth - ((barbaz - fooboo - 1)*CANVAS_MAX_WIDTH) - (((fooboo+1) * CANVAS_MAX_WIDTH) - _hBarStart)), histValues[i][hBarIndex]*heightScale);
		                        
		                    }
		                    else {
		                        c.fillRect(0, histogramWrap.height() - histValues[i][hBarIndex]*heightScale, CANVAS_MAX_WIDTH, histValues[i][hBarIndex]*heightScale);
		                    }
		                }
		            }
		            hBarIndex++;
		        }
		    }
		    eStart += canvasAmount;
		}
		
		
		if (histogramWrap.width() > controlBox.width()) {
		    controlBox.append('<img id="carousel_left_arrow" src="img/carousel_left_arrow.png" width="53" height="52" /><img id="carousel_right_arrow" src="img/carousel_right_arrow.png" width="53" height="52" />');
		    var carouselLeftArrow = $('#carousel_left_arrow');
		    var carouselRightArrow = $('#carousel_right_arrow');
		    carouselLeftArrow.css({
			    position: 'fixed',
			    bottom: (controlBox.height() - carouselLeftArrow.height()),
			    left: 0
		    });
		    carouselRightArrow.css({
			    position: 'fixed',
			    bottom: (controlBox.height() - carouselRightArrow.height()),
			    right: 0
		    });
		    carouselLeftArrow.click(function() {
			    controlBox.animate({
			        scrollLeft: 0
			    }, "fast");
		    });
		    carouselRightArrow.click(function() {
			    controlBox.animate({
			        scrollLeft: (histogramWrap.width() - controlBox.width())
			    }, "fast");
		    });
		}
		
		
		
		// BEGIN TEST
		/*
		var eStart = 0;
		var eEnd = 0;
		for (var i = 0; i < eventWidths.length; i++) {
		    eEnd += eventWidths[i];
		    //console.log(eventWidths[i]);
		    console.log(eStart + "===" + eEnd);
		    eStart += eventWidths[i];
		}
		*/
		
		console.log("eventLengths: ");
		console.log(eventLengths);
		console.log("eventWidths: ");
		console.log(eventWidths);
		console.log("eventTitles: ");
		console.log(eventTitles);
		console.log("canvasAmounts: ");
		console.log(canvasAmounts);
		
		/*
		var n = 3;
		var width = 52;
		
		var _s = hSpace;
		var _e = hWidth + hSpace;
		for (var i = 0; i < n; i++) {
		    console.log("start: " + _s + ", end: " + _e);
		    
		    _s += hWidth + hSpace;
		    _e += hSpace + hWidth;
		}
		*/
		
		var sum = 0;
		for (var i = 0; i < eventWidths.length; i++) {
		    //console.log( sum );
		    //console.log( eventWidths[i] );
		    //console.log( eventLengths[i] );
		    var _s = sum + hSpace;
		    var _e = sum + hWidth + hSpace;
		    for (var j = 0; j < eventLengths[i]; j++) {
		        console.log("eventTitle: " + eventTitles[i] + "   start: " + _s + ", end: " + _e);
		        _s += hWidth + hSpace;
		        _e += hSpace + hWidth;
		    }
		    sum += eventWidths[i];
		}
		
		histogramWrap.append('<div style="position:absolute; bottom:0; left:1px; width: 16px; height: 10px; background: purple;">.</div>');
		histogramWrap.append('<div style="position:absolute; bottom:0; left:325px; width: 16px; height: 10px; background: purple;">.</div>');
        // END TEST
        
		
		histogramWrap.mouseenter(function(e) {
		    var x = e.pageX - this.offsetLeft + controlBox.scrollLeft();
		    viewBox.html(x);
	    });
	    histogramWrap.mousemove(function(e) {
		    var x = e.pageX - this.offsetLeft + controlBox.scrollLeft();
		    viewBox.html(x);
	    });
	    histogramWrap.mouseleave(function(e) {
		    viewBox.empty();
	    });
		
	    controlBox.mousewheel(function(e, delta) {
            e.preventDefault();
            this.scrollLeft -= (delta * 30);
            var x = e.pageX + this.scrollLeft;
            viewBox.html(x);
        });
    }
});
