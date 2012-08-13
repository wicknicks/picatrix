function Searcher(options) {
  this.options = options || {};
  this.endpoint = "/search";
};

Searcher.prototype.keysearch = function(keyword, cb) {
  var q = new Object();
  q.query = keyword;
  this.ajax({url: '/search', data: q, cb: cb});
};

Searcher.prototype.timesearch = function(start, end, cb) {
  //TODO
  return 'tsearch';
};

Searcher.prototype.starsearch = function(cb) {
  this.ajax({url: '/star', cb: cb});
};

Searcher.prototype.ajax = function(options) {
  var ajFunc = $.post;
  if (options.method === 'get') ajFunc = $.get;
  var d = options.data || {};
  ajFunc(options.url, d, function(resp) {
      options.cb(resp);
    });
};

var sample_event = {
  title: 'string-title',
  time: 'human-readable-time-interval',
  location: 'human-readable-address',
  geo: {address: 'geocodable-address', lat: 0.121, lon: -1.22},
  interval: {start: 1344530248060, end: 1344540111007},
  photos: [],
  subevents: []
};

var sample_photo = {
  uid: 342,
  url: '/content/5c262800296e60572f407cfc63dbb3da',
  timestamp: 1344531008363,
  geo: {address: 'geocodable-address', lat: 0.121, lon: -1.22},
  caption: "editable-caption",
  permalink: "peramlink to photo"
};

function Converter(options) {
  this.options = options || {};
};

var count=0;

Converter.prototype.flatten = function(event) {
  var e = jQuery.extend(true, {}, event);
  e.subevents = null;
  e.photos = [];
  cat(e.photos, event.photos);
  count += event.photos.length;
  for (var i=0; i<event.subevents.length; i++)
    rcat(e.photos, event.subevents[i]);
  console.log('Added: ' + e.photos.length + ', Total: ' + count);
  return e;
};

function rcat(photos, event) {
  cat(photos, event.photos);
  count += event.photos.length;
  for (var i=0; i<event.subevents.length; i++)
    rcat(photos, event.subevents[i]);
}

function cat(base, arr) {
  for (var i = 0; i < arr.length; i++) base.push(arr[i]);
}

Converter.prototype.toSeries = function(event, nbins) {
  if (!event.photos) return [[],[]];
  if (event.photos && event.photos.length == 0) return [[],[]];
  if (!nbins) nbins = Math.ceil(event.photos.length / 10);

  var x = new Array(nbins);
  var y = new Array(nbins);
  var timestamps = [];

  for (var i=0; i<event.photos.length; i++) {
    //if (i==436) continue;
    timestamps.push(event.photos[i].timestamp);
  }

  for (var i=0; i<nbins; i++) {
    x[i] = i;
    y[i] = 0;
  }

  timestamps.sort();
  var min = timestamps[0];
  var max = timestamps[timestamps.length - 1];
  var gap = (max - min)/(nbins);

  for (var i=0; i<timestamps.length-1; i++) {
    var ix = (timestamps[i]-min)/gap;
    y[Math.floor(ix)]++;
  }
  y[y.length-1]++; //increment for the last element in timestamps
  
  return [x,y];
};

var query = "";
var series = "";
(new Searcher()).keysearch('india 2010', function(events) {
    query = events;
    series =  (new Converter()).toSeries(events.arr[0], 75);
  });
