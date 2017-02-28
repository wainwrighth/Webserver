// Name: Harrison Wainwright
// CS 316
// Project 2
// Date: 10/27/2016

// Initialize variables and require ones like fs, http, and url.
var http = require("http"),
        url = require('url');

var fs = require('fs');

var paul = require('/homes/paul/HTML/CS316/p2_req.js');

// Using the paul variable get the hostname and create a random port number.
var hostname = paul.phost();
var randomPort = Math.floor(Math.random() * (paul.pend() -  (paul.pstart() + 1)) + paul.pend());

// Establish the child process exec to be used for a cgi call.
const exec = require('child_process').exec;

// myprocess function that will take in the request and set responses according to input.
function myprocess(request, response) {
        var xurl = request.url;
	
	// Parse the url and take away the leading forward slash.
	if (xurl.charAt(0) == "/")
        {
                xurl = xurl.substring(1);
        }

	// Set initail status code and set the header.
	response.statusCode = 200;
	response.setHeader('Content-Type', 'text/plain');
	
	var fileType = findOption(xurl);
	
	if (fileType == 0) // If option return is zero it is invalid.
	{
		response.statusCode = 404;
		response.end(xurl + " is not a valid file type");
	}
	else if (fileType == 1) // If option return is one then it is an html file.
	{
		runHtml(xurl, response);
	}
	else if (fileType == 2) // If option return is a two then it is a cgi file.
	{
		runCgi(xurl, response);
	}
}

// myListen function that takes in port and hostname for logger.
function myListen(server, randomPort, phost, logger)
{
	logger(randomPort, hostname);
	server.listen(randomPort,hostname);
}

// Create server and call myprocess.
var server = http.createServer(myprocess);

// Call myListen function.
myListen(server, randomPort, paul.phost(), paul.logger);

// findOption function that checks path given to see if it is a cgi or html extension.
function findOption(path)
{
	var ret = path.match(/^[a-zA-Z0-9_]*.cgi$/);
	var ret2 = path.match(/^[a-zA-Z0-9_]*.html$/);
	
	if (ret == null)
	{
		if (ret2 == null)
		{
			return 0; // not a proper file name under html or cgi
		}
		else if (ret2['index'] == 0)
		{
			return 1; // it is an html file
		}
	}
	else if (ret['index'] == 0)
	{
		return 2; // it is a cgi file
	}
}

// runHtml function that serves the html file to user.
function runHtml(path, res)
{
	tmpFile = './PUBLIC/' + path;

	// If file exists, read it.
	if (fs.existsSync(tmpFile))
	{
		var data = fs.readFileSync(tmpFile);
		res.write(data);
		res.end();
	}
	else // Otherwise display error and change status code.
	{
		res.statusCode = 404;
		res.end(path + " is not a present file");
	}
}

// runCgi function that uses exec to run cgi if file exists.
function runCgi(path, res)
{
	// exec function that checks for errors and shows output otherwise.
	exec(path, {env: {'PATH': './CGIDIR/'}}, function(error, stdout, stderr)
	{
		// If problem has errors display to user and change status code.
		if(error)
		{
			console.error('exec error: ' + error);
			res.statusCode = 404;
			res.end(path + " is an invalid file");
			return;
		}

		// Give output using repsonse due to asynchronuos property of the function. 
		res.end(stdout + stderr);
	});
}
