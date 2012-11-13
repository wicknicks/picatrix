	var contentRows;
	
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
	    sessionStorage.query = "ashley joel wedding";
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
	
	function initLayout(WIDTH, HEIGHT, minHeight) {
	  var images = [];
	  for (var i=1; i<53; i++) {
      var img = new Image()
      img.src = '/pics/w/' + i + '.320.JPG';
      images.push(img);
    }
    
	  var SPc = {width: 160, height: 240};
    var SP = {width: 180, height: 240};
    var SL = {width: 320, height: 240};
    var P = {width: 360, height: 480};
    var L = {width: 640, height: 480};

    var s = "";
    for (var i=0; i<images.length; i++) {
      if ((images[i].width/images[i].height) > 1) s += "L"
      else s += "P";
    }
    console.log(s);
    s = "PPPPPLLLLLLLLLLPPPLLLLLLLLPLLLLLLLLLLLLLLLLLLPLLPPPLL";
    
    var rows = Math.floor(HEIGHT/minHeight);
    var contentRows = []
    var currentRow = {width: 0, images: []};
    for (var i=0; i<s.length; i++) {
      var rect = SL;
      if (s[i] == 'P') rect = SP;
      if (currentRow.width + rect.width > WIDTH) {
        contentRows.push(currentRow);
        currentRow = {width: 0, images: []};
      }
      currentRow.width = currentRow.width + rect.width;
      currentRow.images.push(images[i])
    }
    contentRows.push(currentRow);
    return contentRows;
  }
	
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
	    backgroundColor: 'azure',
     	overflowX: 'hidden',
    	overflowY: 'hidden'
    });

		var testImagesViewGallery = '<div id = "outer" class= "outer"></div>';
		
		viewBox.html('<div id = "viewGallery"></div>');
    var viewGallery = $('#viewGallery');
    viewGallery.css({
      height: Math.floor(($(window).height() - searchBox.height()) * 76/100),
      width: "100%"
    });
    viewGallery.html(testImagesViewGallery);




    /**** render content ****/
    
    var WIDTH = $('#outer').width();
    var HEIGHT = $('#outer').height();
    var minHeight = 240;
    var rows = Math.floor(HEIGHT/minHeight);
    
    console.log(WIDTH + " " + HEIGHT + " " + HEIGHT/minHeight);
    contentRows = initLayout(WIDTH, HEIGHT, minHeight);
    
    $('#outer').html('<table id="galleryTable"><tr></tr></table>');
    $('#galleryTable').css ({
      height: viewGallery.height(),
      width: 0
    });
		
		for (var col = 0; col < Math.ceil(contentRows.length/rows); col++) {
		
		  var tdTemplate = '<td id="gt_'+col+'"></td>';
		  $('#galleryTable tr').append(tdTemplate);
      $('#galleryTable').css({ width: (col+1) * $(window).width() });
		  
		  for (var k=0; k<rows; k++) {
		  
        $("#gt_"+col).append('<div style="width:' + ($(window).width() + 50) + 
                           ';" id="inner_' + col + '_' + k + '"></div>');

        if (contentRows.length <= (col * rows + k)) continue;                           
        
        for (var i=0; i<contentRows[col * rows + k].images.length;i++) {
        
          console.log(i + " " + contentRows[col * rows + k].images.length);
          $('#inner_'+col+'_'+k).append(contentRows[col * rows + k].images[i]);
          
          var margX = (HEIGHT - (rows * minHeight))/(2 * rows) - 2;
          var margY = ((WIDTH - contentRows[k].width)/(2*contentRows[col * rows + k].images.length)) - 2;
          //contentRows[col * rows + k].images[i].style.marginRight = margY;
          //contentRows[col * rows + k].images[i].style.marginLeft = margY;
          //contentRows[col * rows + k].images[i].style.marginTop = margX;
          //contentRows[col * rows + k].images[i].style.marginBottom = margX;
        }
      }
    }
    
    /**** render content [end] ****/
    console.log('#inner_0_2' + " --->>>> " + $('#inner_0_2').html());
    
    
    
    
    
    
    
    
    
    
    
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
    
    var CANVAS_MAX_WIDTH = 32766; //(2^15)-2
      
    var hWidth = 16;
    var hSpace = 1;
    
    //var clickIndex = 0;
    //var hoverIndex = -1;
    
    
    var histValues = [];
	  var maxValue = 0;
		var eventTitles = [];
		var histArray = [];
		for (var i = 0; i < events.arr.length; i++) {
		    var values = [];
            var converter = new Converter();
            var s = converter.toSeries(events.arr[i], 75);
            for (var j = 0; j < s.length; j++) {
                if (s[j].n > 0) {
                	histArray.push(s[j]);
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
			position : 'relative',
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
		            
		            var _hStartScale = Math.floor(_hBarStart/CANVAS_MAX_WIDTH);
		            var _hEndScale = Math.floor(_hBarEnd/CANVAS_MAX_WIDTH);
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
		                        c.fillRect((CANVAS_MAX_WIDTH - ((_hStartScale+1) * CANVAS_MAX_WIDTH - _hBarStart)), histogramWrap.height() - histValues[i][hBarIndex]*heightScale, ((_hStartScale+1) * CANVAS_MAX_WIDTH - _hBarStart), histValues[i][hBarIndex]*heightScale);
		                        
		                    }
		                    else if (k === hBarEnd) {
		                        c.fillRect(0, histogramWrap.height() - histValues[i][hBarIndex]*heightScale, (hWidth - ((_hEndScale - _hStartScale - 1)*CANVAS_MAX_WIDTH) - (((_hStartScale+1) * CANVAS_MAX_WIDTH) - _hBarStart)), histValues[i][hBarIndex]*heightScale);
		                        
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

		    //[arjun]
		    var jump = 250;
		    var ix = 0;
		    
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
		      if (ix > 0) ix--;
		      controlBox.animate({
    			    //scrollLeft: 0
			        scrollLeft: ix * jump
			    }, "fast");
			    viewBox.animate ({scrollLeft: ix*500}, "slow");
		    });
		    carouselRightArrow.click(function() {
  		    var maxJump = Math.ceil((histogramWrap.width() - controlBox.width())/jump)
		      
		      //if (ix < maxJump) ix++;
		      ix++
		      
			    controlBox.animate({
			        //scrollLeft: (histogramWrap.width() - controlBox.width())
			        scrollLeft: (Math.min(ix, maxJump)) * jump
			    }, "fast");
			    viewBox.animate ({scrollLeft: ix*500}, "slow");
		    });
		}
		
		
		
        histogramWrap.append('<div id="histHoverGuide"></div><div id="histHoverBar"></div>');
        $('#histHoverGuide').css({
        	position: 'absolute',
        	bottom: 0,
        	left: -9999,
        	width: hWidth,
        	height: 0,
        	backgroundColor: '#808080'
        });
        $('#histHoverBar').css({
        	position: 'absolute',
        	bottom: 0,
        	left: 0,
        	width: 0,
        	height: 0,
        	backgroundColor: 'purple'
        });
        controlBox.append('<div id="preview"></div>');
        $('#preview').css({
        	position: 'fixed',
        	bottom: controlBox.height(),
        	left: 0,
        	width: 0,
        	height: 0,
        	backgroundColor: 'black'
        });
		
		
		
		var ranges = [];
		var sum = 0;
		for (var i = 0; i < eventWidths.length; i++) {
		    var _s = sum + hSpace;
		    var _e = sum + hWidth + hSpace;
		    for (var j = 0; j < eventLengths[i]; j++) {
		    	ranges.push({
		    		"title" : eventTitles[i],
		    		"start" : _s,
		    		"end" : _e
		    	});
		        _s += hWidth + hSpace;
		        _e += hSpace + hWidth;
		    }
		    sum += eventWidths[i];
		}
		
		function setHoverBar(x) {
		    // *** IMPORTANT ***
		    // NEED TO OPTIMIZE TO NEAR O(1) INSTEAD OF O(n)
		    for (var i = 0; i < ranges.length; i++) {
		    	if (x >= ranges[i].start && x <= ranges[i].end) {
		    		$('#histHoverGuide').css({
		    			left: ranges[i].start,
		    			width: hWidth,
		    			height: histogramWrap.height()
		    		});
		    		$('#histHoverBar').css({
		    			left: ranges[i].start,
		    			width: hWidth,
		    			height: histArray[i].n * heightScale
		    		});
		    		break;
		    	}
		    }
		}
		
		function setPreviewBox(x) {
		    // *** IMPORTANT ***
		    // NEED TO OPTIMIZE TO NEAR O(1) INSTEAD OF O(n)
		    for (var i = 0; i < ranges.length; i++) {
		    	if (x >= ranges[i].start && x <= ranges[i].end) {
		    		// start - (half of preview width) + (half of bar width)
		    		var leftPos = ranges[i].start - 75 + 8;
		    		if (leftPos < 0) leftPos = 0;
		    		// start + (half of preview width) - (half of bar width)
		    		if ((ranges[i].start + 75 - 8) > $('#controlBox').width()) leftPos = $('#controlBox').width() - 150;
		    		//viewBox.html(leftPos + "<br />" + (ranges[i].start));
        			$('#preview').css({
        				left: leftPos,
        				width: 150,
        				height: 100
        			});
		    		break;
		    	}
		    }
		
		}
		
		histogramWrap.mouseenter(function(e) {
		    var x = e.pageX - this.offsetLeft + controlBox.scrollLeft();
		    var x1 = e.pageX - this.offsetLeft;
		    //viewBox.html(x);
		    setHoverBar(x);
		    setPreviewBox(x1);
	    });
	    histogramWrap.mousemove(function(e) {
		    var x = e.pageX - this.offsetLeft + controlBox.scrollLeft();
		    var x1 = e.pageX - this.offsetLeft;
		    //viewBox.html(x);
		    setHoverBar(x);
		    setPreviewBox(x1);
		    
	    });
	    histogramWrap.mouseleave(function(e) {
		    //viewBox.empty();
		    $('#histHoverGuide').css({
		    	left: 0,
        		width: 0,
		    	height: 0
		    });
		    $('#histHoverBar').css({
		    	left: 0,
        		width: 0,
		    	height: 0
			});
		    $('#preview').css({
		    	left: 0,
        		width: 0,
		    	height: 0
			});
	    });
		
	    controlBox.mousewheel(function(e, delta) {
            e.preventDefault();
            this.scrollLeft -= (delta * 30);
            var x = e.pageX + this.scrollLeft;
            var x1 = e.pageX;
            //viewBox.html(x);
		    setHoverBar(x);
		    setPreviewBox(x1);
        });
        
        var middle = true;
        var scFlag = 0;
        $('#controlBox').click(function() {
        if (middle) {
          scFlag += 1;
          if (scFlag > Math.floor(contentRows.length/rows)) scFlag = 0;
          viewBox.animate ({scrollLeft: scFlag * $(window).width()}, "slow");
          //middle = false;
        } else {
          viewBox.animate ({scrollLeft: 0}, "slow");
          //middle = true;
        }
      });
      
    }
    
});
