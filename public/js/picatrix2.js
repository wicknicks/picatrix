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
	$('[name=q]').val('trip');
	
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
        
        /*
	    var hWidth = 100000;
	    var hSpace = 50000;
	    */
	    var hWidth = 20;
	    var hSpace = 4;
	    
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
		//console.log("maxValue: ");
		//console.log(maxValue);
		
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
		//console.log("eventLengths: ");
		//console.log(eventLengths);
		//console.log("eventWidths: ");
		//console.log(eventWidths);
		//console.log("canvasAmounts: ");
		//console.log(canvasAmounts);
		//console.log("totalEventWidth: ");
		//console.log(totalEventWidth);
		console.log("histValues: ");
		console.log(histValues);
		
		
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
		
		
		/*
		// TESTING MUTLIPLE CANVAS HISTOGRAM BAR DRAWING
		var hh0 = $('#histogram_0');
		var cc0 = hh0[0].getContext("2d");
		
		cc0.fillStyle = '#808080';
		cc0.fillRect(1, 0, 20, 100);
		
		cc0.fillRect(22, 0, 20, 100);
		
		var hh1 = $('#histogram_1');
		var cc1 = hh1[0].getContext("2d");
		cc1.fillStyle = '#808080';
		cc1.fillRect(1, 0, 20, 100);
		*/
		
		
		/*
		// TESTING MUTLIPLE CANVAS HISTOGRAM BAR DRAWING
		var hist1 = $('#histogram_1');
		var cont1 = hist1[0].getContext("2d");
		cont1.fillStyle = 'aqua';
		cont1.fillRect(17234, 0, 15532, 100);
		
		var hist2 = $('#histogram_2');
		var cont2 = hist2[0].getContext("2d");
		cont2.fillStyle = 'orange';
		cont2.fillRect(0, 0, 32766, 100);
		
		var hist3 = $('#histogram_3');
		var cont3 = hist3[0].getContext("2d");
		cont3.fillStyle = 'green';
		cont3.fillRect(0, 0, 32766, 100);
		
		var hist4 = $('#histogram_4');
		var cont4 = hist4[0].getContext("2d");
		cont4.fillStyle = 'purple';
		cont4.fillRect(0, 0, 18936, 100);
		
		
		var hist6 = $('#histogram_6');
		var cont6 = hist6[0].getContext("2d");
		cont6.fillStyle = 'aqua';
		cont6.fillRect(3404, 0, 29362, 100);
		
		var hist7 = $('#histogram_7');
		var cont7 = hist7[0].getContext("2d");
		cont7.fillStyle = 'orange';
		cont7.fillRect(0, 0, 32766, 100);
		
		var hist8 = $('#histogram_8');
		var cont8 = hist8[0].getContext("2d");
		cont8.fillStyle = 'green';
		cont8.fillRect(0, 0, 32766, 100);
		
		var hist9 = $('#histogram_9');
		var cont9 = hist9[0].getContext("2d");
		cont9.fillStyle = 'purple';
		cont9.fillRect(0, 0, 5106, 100);
	    
	    
		var hist12 = $('#histogram_12');
		var cont12 = hist12[0].getContext("2d");
		cont12.fillStyle = 'aqua';
		cont12.fillRect(17234, 0, 15532, 100);
		
		var hist13 = $('#histogram_13');
		var cont13 = hist13[0].getContext("2d");
		cont13.fillStyle = 'orange';
		cont13.fillRect(0, 0, 32766, 100);
		
		var hist14 = $('#histogram_14');
		var cont14 = hist14[0].getContext("2d");
		cont14.fillStyle = 'green';
		cont14.fillRect(0, 0, 32766, 100);
		
		var hist15 = $('#histogram_15');
		var cont15 = hist15[0].getContext("2d");
		cont15.fillStyle = 'purple';
		cont15.fillRect(0, 0, 18936, 100);
		*/
    }
	
});

