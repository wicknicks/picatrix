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
	
	
	// BEGIN VARIABLE INITIALIZATION
	var CANVAS_MAX_WIDTH = 32766; //(2^15)-2
	var FPS = 30;
	var hWidth = 20;
	var hSpace = 1;
	// END VARIABLE INITIALIZATION
    
    
	// BEGIN CANVAS DRAW LOOP
	setInterval(function() {
	  drawHistogram();
	}, 1000/FPS);
	
	function drawHistogram() {
		
	    var searchBox = $('#searchBox');
		searchBox.css({
			width : $(window).width(),
			height : 50,
			backgroundColor : 'CornflowerBlue'
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
			position: 'relative',
			overflowX: 'scroll', //hidden //scroll
			overflowY: 'scroll', //hidden //scroll
			width : $(window).width(),
			height : $(window).height() - searchBox.height() - viewBox.height(),
			minHeight : 100,
			backgroundColor : '#000'
		});
		
	    var searcher = new Searcher();
		searcher.keysearch(sessionStorage.query, function(events) {
		
		    var browserWidth = $(window).width();
		    
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
				width : "",
				height : "",
				marginTop : "",
				marginRight : "",
				marginBottom : "",
				marginLeft : "",
				position : "",
				top : "",
				left : ""
			});
			histogramWrap.css({
				width : totalEventWidth,
				height : controlBox.height()
			});
			if (histogramWrap.width() <= controlBox.width()) {
				histogramWrap.css({
					marginTop : 0,
					marginRight : 'auto',
					marginBottom : 0,
					marginLeft : 'auto'
				});
			}
			else {
				histogramWrap.css({
					position : 'absolute',
					top : 0,
					left : 0
				});
			}
			
			
			// REMOVE ANY PREVIOUS CANVAS(ES) AND CAROUSEL BUTTONS
			histogramWrap.empty();
			$('#controlBox #carousel_left_arrow').remove();
			$('#controlBox #carousel_right_arrow').remove();
			
			
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
					c.fillStyle = (i % 2 === 0) ? '#E6E6E6' : '#CFCFCF';
					c.fillRect(0, 0, cWidth, histogramWrap.height());
					_cWidth++;
				}
				cStart += canvasAmount;
			}
			
			
			// DRAW/COLOR HISTOGRAM BARS ON CANVAS(ES)
			// SAVE THIS BECAUSE WE WILL NEED IT TO DRAW THE HISTOGRAM BARS
			var heightScale = histogramWrap.height() / maxValue;
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
						//console.log(_hBarStart + " _ " + _hBarEnd);
						
						var fooboo = Math.floor(_hBarStart/CANVAS_MAX_WIDTH);
						var barbaz = Math.floor(_hBarEnd/CANVAS_MAX_WIDTH);
						//console.log(fooboo + " - " + barbaz);
						//console.log("histogrambar_"+hBarIndex + " of event_"+i + " spans from canvas_"+ hBarStart + " to canvas_" + hBarEnd);
						if (hBarStart === hBarEnd) {
							//console.log("histogrambar_"+hBarIndex + " fits in a single <canvas> element");
							var h = $('#histogram_'+hBarStart);
							var c = h[0].getContext("2d");
							c.fillStyle = '#0033CC';
							c.fillRect(_hBarStart, 0, hWidth, histValues[i][hBarIndex]*heightScale);
							
						}
						else {
							//console.log("histogrambar_"+hBarIndex + " fits in multiple <canvas> elements");
							for (var k = hBarStart; k <= hBarEnd; k++) {
								var h = $('#histogram_'+k);
								var c = h[0].getContext("2d");
								c.fillStyle = '#0033CC';
								if (k === hBarStart) {
									c.fillRect((CANVAS_MAX_WIDTH - ((fooboo+1) * CANVAS_MAX_WIDTH - _hBarStart)), 0, ((fooboo+1) * CANVAS_MAX_WIDTH - _hBarStart), histValues[i][hBarIndex]*heightScale);
									
								}
								else if (k === hBarEnd) {
									c.fillRect(0, 0, (hWidth - ((barbaz - fooboo - 1)*CANVAS_MAX_WIDTH) - (((fooboo+1) * CANVAS_MAX_WIDTH) - _hBarStart)), histValues[i][hBarIndex]*heightScale);
									
								}
								else {
									c.fillRect(0, 0, CANVAS_MAX_WIDTH, histValues[i][hBarIndex]*heightScale);
								}
							}
						}
						hBarIndex++;
					}
				}
				eStart += canvasAmount;
			}
			
			// ADD CAROUSEL BUTTONS IF HISTOGRAM IS LONGER THAN BROWSER WIDTH
			if (histogramWrap.width() > controlBox.width()) {
				controlBox.append('<img id="carousel_left_arrow" src="img/carousel_left_arrow.png" width="53" height="52" /><img id="carousel_right_arrow" src="img/carousel_right_arrow.png" width="53" height="52" />');
				$('#carousel_left_arrow').css({
					position: 'absolute',
					top: ((histogramWrap.height() - carousel_left_arrow.height)/2),
					left: 0
				});
				$('#carousel_right_arrow').css({
					position: 'absolute',
					top: ((histogramWrap.height() - carousel_right_arrow.height)/2),
					right: 0
				});
				$('#carousel_left_arrow').click(function() {
					alert("scroll to left");
				});
				$('#carousel_right_arrow').click(function() {
					alert("scroll to right");
					//histogramWrap.animate();
				
				});
			}
			
			
			
		});
	}
	// END CANVAS DRAW LOOP
	
	
	
	
	
	$('#searchBox').submit(function(event) {
        event.preventDefault();
		sessionStorage.query = $('[name=query]').val();
	});
	
	
	
	
	
});
