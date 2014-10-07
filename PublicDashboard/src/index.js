// DEPS
var express = require('express');
var fs = require('fs');
var Mustache = require('mustache');
var jsforce = require('jsforce');
var morgan = require('morgan');

// Constants
var REPORTID = process.env.SFDC_REPORTID;
var USERNAME = process.env.SFDC_USERNAME;
var PASSWORD = process.env.SFDC_PASSWORD;
var LOGIN_URL = process.env.SFDC_URL||'https://salesforce.com';
var CACHE_TIME = (process.env.SFDC_CACHEMINS || 1) * 60000;
var PORT = 9000;
var cacheFile = './src/cache';
var template = './src/d3Chart.mst';

// App
var app = express();
app.use(morgan());
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
				var conn = new jsforce.Connection({loginUrl: LOGIN_URL});
				conn.login(USERNAME, PASSWORD, function(err, resp) {
				  if (err) { return console.error(err); }
						conn.analytics.reports(function(err, reports) {
								var reportId = REPORTID||reports[0].id; 
								var report = conn.analytics.report(reportId);
								report.execute(function(err, result) {
									result = JSON.stringify(result);
									fs.writeFile(cacheFile, result, 'utf-8');
									writeResponse(result);
								});
						});
				});
		}
	});
});
app.listen(PORT);
