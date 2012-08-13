#Server/Client Interface for Picatrix

##Server

You will need node.js v0.8.4 to run this. Get it from here: nodejs.org/

The required npm dependencies are already in node_modules

Run the server using this command (assuming node binary is accessible
through $PATH):

```node searcher.js```

Go to [http://localhost:2900/](http://localhost:2900/) to access the index & tester.html.


##JS Server Interface for the Client

The primary classes here are Searcher and Converter. Both located in
events.js. These classes will interact with the server to provide
search capabilities (query the server with keyword, temporal queries)
and provide events in a format which can be fed to the Converter. The
converter class is used to transform hierarchical event structures to
more easily "paintable" formats.

Here is an example on using these classes. Once run tester.html, the
values of query and series can be viewed on the JS console.

```
var query = "";
var series = "";
(new Searcher()).keysearch('india 2010', function(events) {
    query = events;
    series =  (new Converter()).toSeries(events.arr[0], 75);
  });
```
