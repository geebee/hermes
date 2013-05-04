/* {{{ Rules:
 *  A compliant output handler:
 *   1. Extends EventEmitter
 *   2. Contains NAME, and DESCRIPTION constants
 *   3. Has a 'process' function, which:
 *    a. takes a single input parameter with the message
 *    b. emits a 'received' event upon receiving the log for processing
 *    c. calls the 'validate' function, and listens for the 'validated' event
 *    d. emits a 'processsed' event upon successfully processing the log
 *    e. emits an 'error' event upon being unable to successfully process the log
 *   4. Has a 'validate' function, which:
 *    a. emits a 'validated' event upon ensuring the log matches defined rules
 *    b. returns null on success, error message on failure
 */ 
// }}}

var EventEmitter = require("events").EventEmitter;
var stdout = new EventEmitter();

stdout.NAME = "stdout";
stdout.DESCRIPTION = "Prints any message received to the STDOUT pipe. Validator always succeeds";

stdout.process = function(log) {
  console.log("about to emit 'received' event");
  var receivedTime = new Date().getTime();
  stdout.emit("receivied", null);
  stdout.on("validated", function(err) {
    if (err) {
      console.log("about to emit 'validationError' event");
      stdout.emit("validationError", err);
    } else {
      //Process the event, emit 'processed' or 'error'
      if (typeof console === "object") {
        console.dir(log);
        console.log("about to emit 'processed' event");
        var processedTime = new Date().getTime();
        console.log("Message processed in: %dms", processedTime - receivedTime);
        stdout.emit("processed", null);
      } else {
        console.log("about to emit 'error' event");
        var err = "Somehow... The console is unavailable...";
        stdout.emit("error", err);
      }
    }
  });
  stdout.validate(log);
};

stdout.validate = function(log) {
  console.log("about to emit 'validated' event");
  stdout.emit("validated", null);
};

module.exports = stdout;
