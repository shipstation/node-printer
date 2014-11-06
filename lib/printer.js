var printer_helper = {}
    , fs = require("fs")
    , child_process = require("child_process")
    , os = require("os")
    , path = require("path");

printer_helper = require('../build/Release/node_printer.node');

/** Return all installed printers including active jobs
 */
module.exports.getPrinters = getPrinters;

/** send data to printer
 */
module.exports.printDirect = printDirect;

/** send file to printer
 */
module.exports.printFile = printFile;

/** Get supported print format for printDirect
 */
module.exports.getSupportedPrintFormats = printer_helper.getSupportedPrintFormats;

/**
 * Get possible job command for setJob. It depends on os.
 * @return Array of string. e.g.: DELETE, PAUSE, RESUME
 */
module.exports.getSupportedJobCommands = printer_helper.getSupportedJobCommands;

/** get printer info object. It includes all active jobs
 */
module.exports.getPrinter = getPrinter;

/** get printer job info object
 */
module.exports.getJob = getJob;
module.exports.setJob = setJob;

/** Get printer info with jobs
 * @param printerName printer name to extract the info
 * @return printer object info:
 *		TODO: to enum all possible attributes
 */
function getPrinter(printerName)
{
	return printer_helper.getPrinter(printerName);
}

function getJob(printerName, jobId)
{
	return printer_helper.getJob(printerName, jobId);
}

function setJob(printerName, jobId, command)
{
	return printer_helper.setJob(printerName, jobId, command);
}

function getPrinters(){
    var printers = printer_helper.getPrinters();
    for(i in printers){
        var printer = printers[i];
        if(printer.status || !printer.options || !printer.options['printer-state']){
            continue;
        }
        var status = printer.options['printer-state'];
        // Add posix status
        if(status == '3'){
            status = 'IDLE'
        }
        else if(status == '4'){
            status = 'PRINTING'
        }
        else if(status == '5'){
            status = 'STOPPED'
        }
        printer.status = status;
    }
    return printers;
}

/*
print raw data. This function is intend to be asynchronous

parameters:
   parameters - Object, parameters objects with the following structure:
      data - String, mandatory, data to printer
      printer - String, mandatory, mane of the printer
      docname - String, optional, name of document showed in printer status
      type - String, optional, only for wind32, data type, one of the RAW, TEXT
      success - Function, optional, callback function
      error - Function, optional, callback function if exists any error
   
   or
   
   data - String, mandatory, data to printer
   printer - String, mandatory, mane of the printer
   docname - String, optional, name of document showed in printer status
   type - String, optional, data type, one of the RAW, TEXT
   success - Function, optional, callback function with first argument job_id
   error - Function, optional, callback function if exists any error
*/
function printDirect(parameters){
   var data = parameters
      , printer
      , docname
      , type
      , success
      , error;
   
   if(arguments.length==1){
      //TODO: check parameters type
      //if (typeof parameters )
      data = parameters.data;
      printer = parameters.printer;
      docname = parameters.docname;
      type = parameters.type;
      success = parameters.success;
      error = parameters.error;
   }else{
      printer = arguments[1];
      type = arguments[2];
      docname = arguments[3];
      success = arguments[4];
      error = arguments[5];
   }
   
   if(!success){
      success = function(){};
   }
   
   if(!error){
      error = function(err){
         throw err;
      };
   }
   
   if(!type){
      type = "RAW";
   }

    type = type.toUpperCase();
   
   if(!docname){
      docname = "node print job";
   }
   
   //TODO: check parameters type
   if(printer_helper.printDirect){// call C++ binding
      try{
         var res = printer_helper.printDirect(data, printer, docname, type, success, error);
         if(res){
            success(res);
         }else{
            error(Error("Something wrong in printDirect"));
         }
      }catch (e){
         error(e);
      }
    }else{
      error("Not supported");
   }
}

/*
print file. This function is intend to be asynchronous

parameters:
   parameters - Object, parameters objects with the following structure:
      filename - String, mandatory, data to printer
      docname - String, optional, name of document showed in printer status
      printer - String, mandatory, mane of the printer
      success - Function, optional, callback function
      error - Function, optional, callback function if exists any error
*/
function printFile(parameters){
   var filename
      , docname
	  , printer
      , success
      , error;
   
   if(arguments.length !== 1){
	   throw new Error('must provide arguments object');
   }
   if(!arguments[0].filename){
	   var err = new Error('must provide at least a filename');
	   if(typeof arguments[0].error === 'function'){
		   return arguments[0].error(err);
	   }

	   throw err;
   }

   filename = parameters.filename;
   docname = parameters.docname;
   printer = parameters.printer;
   success = parameters.success;
   error = parameters.error;
   
   if(!success){
      success = function(){};
   }
   
   if(!error){
      error = function(err){
         throw err;
      };
   }
   
   if(!docname){
      docname = "node print job";
   }
   
   //TODO: check parameters type
   if(printer_helper.printFile){// call C++ binding
      try{
		  // TODO: proper success/error callbacks from the extension
 
		  var res = printer_helper.printFile(filename, docname, printer);
         if(!isNaN(parseInt(res))){
            success(res);
         }else{
            error(Error(res));
         }
      }catch (e){
         error(e);
      }
    }else{
      error("Not supported");
   }
}
