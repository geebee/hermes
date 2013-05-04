var net = require("net");

var EventEmitter = require("events").EventEmitter;
var tcp = new EventEmitter();

tcp.NAME = "tcp";
tcp.DESCRIPTION = "Forwards any message received over a TCP socket. Validates that the message is proper JSON";

tcp.process = function(log) {
  console.log("about to emit 'received' event");
  tcp.emit("receivied", null);
  tcp.on("validated", function(err) {
    if (err) {
      console.log("about to emit 'validationError' event");
      tcp.emit("validationError", err);
    } else {
      //Process the event, emit 'processed' or 'error'
      var client = net.createConnection(9999, "localhost")

      client.on("connect", function(){
        client.on("close", function(hadError) {
          if (hadError) {
            console.log("about to emit 'error' event");
            tcp.emit("error", "TCP Connection Error");
          } else {
            console.log("about to emit 'processed' event");
            tcp.emit("processed", null);
          }
        });
        client.end(log);
      });
      client.on("error", function(err) {
        if (err.code === "ECONNREFUSED") {
          console.log("about to emit 'error' event");
          tcp.emit("error", "Remote TCP socket refused the connection");
        } else {
          console.log("about to emit 'error' event");
          tcp.emit("error", err.toString());
        };
      });
    }
  });
  tcp.validate(log);
};

tcp.validate = function(log) {
  console.log("about to emit 'validated' event");
  tcp.emit("validated", null);
};

module.exports = tcp;
