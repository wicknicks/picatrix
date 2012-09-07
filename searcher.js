var 
  reds = require('reds'),
  search = reds.createSearch('px-embedded-index'), 
  strs = [];

var fs = require('fs');
var data = fs.readFileSync('data/events.js', 'utf-8');
var lines = data.split('\n');

lines.forEach(function(str) {
    if (str.length < 1) return; 
    var data = JSON.parse(str)['path'];
    strs.push(data);
});

strs.forEach(function(str, i){ search.index(str, i); });

/* read photos */
data = fs.readFileSync('data/photo.js', 'utf-8');
lines = data.split('\n');
var photos = [];
lines.forEach(function(str) {
    if (str.length < 1) return;
    photos.push(JSON.parse(str));
  });

data = fs.readFileSync('data/exif.js', 'utf-8');
lines = data.split('\n');

var exif = [];
lines.forEach(function(str) {
    if (str.length < 1) return;
    exif.push(JSON.parse(str));
  });

var exifIndex = {};
for (var i=0; i<exif.length; i++) exifIndex[exif[i].uid] = exif[i]

//Server
var 
  express = require('express'),
  app = express();

app.configure( function() {
    app.use(express.cookieParser());
    app.use(express.session({ secret: "nujrekijung" }));
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.logger('dev'));
});

var APP_PORT = 2900;
app.listen(APP_PORT);
console.log('listening at http://localhost:' + APP_PORT);

app.get('/', function (req, res, next) {
    serve_html(res, '/public/index.html');
  });

app.get('/search', function (req, res, next) {
    res.send('use post /search');
  });

app.post('/star', function(req, res, next) {
    console.log('Requesting Star Search');
    var result = {}
    result.n = strs.length;
    result.arr = [];
    for(var i=0; i<strs.length; i++) result.arr.push(strs);
    result.arr = condense(result.arr);
    res.send((result));
  });

app.post('/search', function (req, res, next) {
    var query = req.body.query;
    console.log('query req: %s', query);
    var result = {query: query};
    result.n = 0;
    result.arr = [];
    search.query(query=query).end(function(err, ids) {
	if(err) {
	  res.send(JSON.stringify(result)); throw err;
	}
	ids.forEach(function(id){result.arr.push(strs[id])});
	result.n = result.arr.length;
  result.arr = condense(result.arr);
	res.send((result));
      });
  });


/* convert a list of results into an array of hierarchical objects
   (which specify subevent relationships between parent and child
   events) */
function condense(results) {
  results = results.sort();
  var root = []; count=0;

  for(var i = 0; i < results.length; i++) {
    var res = results[i];
    var splits = res.split('/');
    var ev = null;
    if (splits.length == 1) ev = rootAdd(root, splits[0]);
    else {
      var ix = find(root, splits[0]);
      if (ix == -1) {
        ev = rootAdd(root, splits[0]);
        load(ev, splits[0])
        ix = find(root, splits[0])
      }
      ev = leafAdd(root[ix], splits.splice(1, splits.length));
    }
    load(ev, res);
  }
  for (var i=0; i<root.length; i++) computeIntervals(root[i]);
  return root;
}

function leafAdd(event, splits) {
  var ix = find(event.subevents,splits[0]);
  if (ix >= 0) {
    return leafAdd(event.subevents[ix], splits.splice(1, splits.length));
  }
  else {
    //console.log('Creating New Obj: ' + event.title + ' ' + JSON.stringify(ev));
    var ev = new Object();
    ev.subevents = [];
    ev.title = splits[splits.length-1];
    event.subevents.push(ev);
    return ev;
  }
}

function find(arr, title) {
  for (var i=0; i<arr.length; i++) {
    if (arr[i].title == title) return i;
  }
  return -1;
}

function rootAdd(root, nm) {
  if (find(root, nm) >= 0) return;
  var event = new Object();
  event.subevents = [];
  event.title = nm;
  root.push(event);
  return event; //return the index
}


//load photo content for each event
function load(event, path) {
  if (!event.photos) event.photos = [];
  for (var i=0; i<photos.length; i++) {
    if (photos[i].parent != path) continue;
    var o = new Object();
    o.uid = photos[i].uid;
    o.timestamp = exifIndex[photos[i].uid].ts;
    event.photos.push(o);
  }
} 

//recursively compute interval field for event
function computeIntervals(event) {
  var times = [];
  for (var i=0; i<event.photos.length; i++) {
    var p = event.photos[i];
    times.push(p.timestamp);
  }
  for (var i=0; i<event.subevents.length; i++) {
    var sub = event.subevents[i];
    computeIntervals(sub);
    times.push(sub.interval.start);
    times.push(sub.interval.end);
  }
  if (times.length == 0) return;
  times.sort();
  event.interval = new Object();
  event.interval.start = times[0];
  event.interval.end = times[times.length-1];
}


//test search functionality
search.query(query='NY').end(function(err, ids) {
    if(err) {
      res.send(JSON.stringify(result)); throw err;
    }
    var arr = [];
    ids.forEach(function(id){ arr.push(strs[id]) });
    arr = condense(arr);
    //arr.forEach(function(a) { console.log("TEST " + a.title); });
  });


function serve_html(res, file_path) {
  serve_file(res, 'text/html', __dirname + file_path);
}

function serve_file(res, content_type, file_path) {
  res.header('Content-Type', content_type);
  var content = fs.readFileSync (file_path, 'utf8');
  res.send(content);
}
