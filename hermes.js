var http = require("http");
var url = require("url");

// {{{ Command Line Processing - Sets 'output', and 'port'
var output,port;
var processArgs = process.argv.slice(2);
if (processArgs.length % 2 === 0) {
  while (processArgs.length >= 2) {
    var key = processArgs.shift();
    var value = processArgs.shift();
    switch(key) {
      case "--port":
        port = value;
        break;
      case "--output":
        output = value;
        break;
      default:
        console.log("Unknown argument: '%s', ignoring", key);
    };
  };
} else {
  console.log("Unbalanced or incorrect parameters were used. Usage:\n  %s %s --output <output module> --port <service port>\n", process.argv[0], process.argv[1]);
  process.exit(1);
};
if (typeof output === "undefined") { output = "stdout"; };
if (typeof port === "undefined") { port = 8081; };
// }}}

var hermes = http.createServer(function(req, res) {
  var parsedURL = url.parse(req.url, true)
  if (parsedURL.pathname === "/log") {
    if (req.method == "POST") {
      var logMessage = "";

      req.on("data", function(chunk) {
        logMessage += chunk.toString();
      });

      req.on("end", function() {
        logHandler.on("validationError", function(err) { 
          res.writeHead(400, "Bad Request");
          res.write("Validation failed with message: " + err + "\n");
          res.end();
          console.log("[400] " + req.method + " to " + req.url + ". Error was: " + err);
        });
        logHandler.on("error", function(err) {
          res.writeHead(500, "Internal Server Error");
          res.write("Unknown error has occurred with message: " + err + "\n");
          res.end();
          console.log("[500] " + req.method + " to " + req.url + ". Error was: " + err);
        });
        logHandler.on("processed", function(err) {
          if (err) {
            res.writeHead(500, "Internal Server Error");
            res.write("The log processor returned this error: " + err + "\n");
            res.end();
            console.log("[500] " + req.method + " to " + req.url + ". Error was: " + err);
          } else {
            res.writeHead(200, "OK");
            res.write("Processed message\n");
            res.end();
            console.log("[200] " + req.method + " to " + req.url);
          }
        });
        logHandler.process(logMessage);
      });
    } else {
      res.writeHead(405, "Method Not Allowed");
      res.write("Only POSTs are allowed to this URL\n");
      res.end();
      console.log("[405] " + req.method + " to " + req.url);
    }
  } else {
    res.writeHead(404, "Not Found");
    res.write("POST messages to /log\n");
    res.end();
    console.log("[404] " + req.method + " to " + req.url);
  }
}).listen(port, function() {
  try {
    var logHandler = require("./outputs/" + output);
    console.log("Log Handler - '%s' registered", logHandler.NAME);
    console.log("Hermes is waiting for your messages... http://%s:%d/log", hermes.address().address, hermes.address().port);
  } catch (e) {
    if (e.code === "MODULE_NOT_FOUND") {
      console.log("Output module '%s' was not found in the outputs directory", output);
      process.exit(1);
    } else {
      throw e;
    }
  };
}).on("error", function(err) {
  if (err.code === "EADDRINUSE") {
    console.log("Could not bind to port: %d. It was already bound", port);
  } else {
    console.log("Unknown error: %s", err);
  }
});
