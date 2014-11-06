var path = require('path');
var printer = require("../lib");

var testfile = path.join(__dirname, 'test.txt');
console.log('printing: ' + testfile);

printer.printFile({
	filename: testfile,
	docname: "test document",
	printer: "Brother_MFC_7860DW",
	success: function(jobID){
		console.log("sent to printer with ID: " + jobID);
	},
	error: function(err){
		console.error('error while printing: ' + err);
	}
});
