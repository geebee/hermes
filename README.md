hermes
-----
>He spoke, and the messenger god, the slayer of Argus, promptly obeyed. He quickly fastened to his feet the lovely imperishable golden sandals that carry him swift as the flowing wind over the ocean waves and the boundless earth...
>
>--Homer

###Description:
Hermes is a small, fast, and simple RESTful log service, which has a pluggable output pipeline for what to do with the messages it recieves.


###How To Run:
 - Prerequisites: node.js (installed)
 - Choose your `output` and `port`:
   1. Run the command: `node ./hermes.js --output stdout --port 8081`


###How To Use:
####Create a log
 - `http://localhost:8081/log` (`POST` - creates a log event, returns `200` on processing success, `400` on validation errors, and `500` on other errors)
 - The log format is not strict in any way. Any structure valid to the chosen output can be `POST`ed
 - Use the following CURL command (or an equivalent) to `POST`: 
	
	    	curl -v -H "Content-Type: application/json" -X POST -d '{
    	    	"name":"SomeApp",
    	    	"hostname":"web.server",
    	    	"level":"INFO",
    	    	"time":"2013-04-22T15:10Z",
    	    	"message":"Logged…",
    	    	"req":{},
    	    	"v":"0.1"
		    }' http://localhost:8081/log  

####Available outputs:
 - `stdout` - Simply echoes out any message recieved to the server's standard out
   - Validation: _None_
 - `tcp` - Send any message recieved over a TCP socket to a waiting recipient
    - Validation: _Verifies that the message parses as valid JSON_

####Create a new output
 - The `stdout` output contains complete documentation, and enough code to create a functioning output of any type
 - There are very few restrictions, as long as the functions `process` and `validate` are available
 - The `process` function must emit the following events:
   - `received` - emitted at the entry point of the output module
   - `processed` - emitted after the whole output has been processed successfully
   - `error` - emitted if the processing has failed in an unrecoverable way
   - `validationError` if the output's validation format was not met
 - The `validate` function must emit the following events:
   - `validated` - emitted after the validation process has finished
     - The callback data should be `null` if the validation was successful, and contain a `"string"` with the error message if the validation was unsuccessful