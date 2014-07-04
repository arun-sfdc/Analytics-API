// DEPS
var express = require('express');
var fs = require('fs');
var Mustache = require('mustache');
var jsforce = require('jsforce');

// Constants
var REPORTID = '00OB0000000c3YY';
var USERNAME = '';
var PASSWORD = '';
var CACHE_TIME = 60000;
var PORT = 8080;
var cacheFile = './src/cache';
var template = './src/d3Chart.mst';

// App
var app = express();
app.get('/', function (req, res) {
	var writeResponse = function(result) {
			fs.readFile(template, function (err, data) {
				res.write(Mustache.render(data.toString(), {reportResult: result}));
				res.end();
			});
	};
	fs.stat(cacheFile, function(err, stats) {
		if(!err && new Date().getTime() - new Date(stats.mtime).getTime() < CACHE_TIME) { 
				fs.readFile(cacheFile, 'utf-8', function(err, result){
					if(!err) {
						writeResponse(result);
					} 
				});
		} else {
				var conn = new jsforce.Connection();
				conn.login(USERNAME, PASSWORD, function(err, resp) {
				  if (err) { return console.error(err); }
						var report = conn.analytics.report(REPORTID);
						report.execute(function(err, result) {
							result = JSON.stringify(result);
							fs.writeFile(cacheFile, result, 'utf-8');
							writeResponse(result);
						});
				});
		}
	});
});
app.listen(PORT);
