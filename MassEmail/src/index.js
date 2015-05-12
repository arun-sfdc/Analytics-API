// DEPS
var express = require('express');
var fs = require('fs');
var Mustache = require('mustache');
var jsforce = require('jsforce');
var morgan = require('morgan');
var _ = require('underscore');

// Constants
var LOGIN_URL = 'https://salesforce.com';
var PORT = 9000;
var TEMPLATE = './src/index.mst';
var PAGESIZE = 2000;

// PATCH JSFORCE for Turbo Pilot
var EXECUTE_ASYNC = function(options, callback) {
		options = options || {};
		if (_.isFunction(options)) {
				callback = options;
				options = {};
		}
		var url = [ this._conn._baseUrl(), "analytics", "reports", this.id, "instances" ].join('/');
		url += "?includeDetails=true&queryable=true";
		var params = { method : 'POST', url : url, body: "" };
		if (options.metadata) {
				params.headers = { "Content-Type" : "application/json" };
				params.body = JSON.stringify(options.metadata);
		}
		return this._conn.request(params).thenCall(callback);
};
var RETRIEVE_PAGE = function(instance, mylastRowIdFetched, callback) {
		options = {
				"paginationSpec": {
						"lastRowIdFetched": mylastRowIdFetched,
						"numRows": PAGESIZE
				}
		};
		var url = [ this._conn._baseUrl(), "analytics", "reports", instance._report.id, "instances", instance.id].join('/');
		var params = { method : 'POST', url : url, body: "" };
		params.headers = { "Content-Type" : "application/json" };
		params.body = JSON.stringify(options);
		return this._conn.request(params).thenCall(callback);
};


// App
var app = express();
app.use(morgan());
app.get('/', function (req, res) {
				console.log(new Date());
				var username = req.query.un;
				var password = req.query.pw;
				var reportid = req.query.id;
				var conn = new jsforce.Connection({loginUrl: LOGIN_URL});
				conn.login(username, password, function(err, resp) {
						if (err) { return console.error(err); }
						conn.analytics.reports(function(err, reports) {
								if (err) { return console.error(err); }
								var reportId = reportid||reports[0].id; 
								var report = conn.analytics.report(reportId);
								report.executeAsync = EXECUTE_ASYNC;
								report.executeAsync({turbo: true}, function(err, instance) {
										if (err) { return console.error(err); }
										var pollToComplete = function() {
												var myinstance = report.instance(instance.id);
												myinstance.retrieve(function(err, result) {
														if (err) { return console.error(err); }
														if(result.attributes.status == 'Success') {
																var rows = [];
																myinstance.retrievePage = RETRIEVE_PAGE;
																var getNextPage = function(lastRow) {
																		myinstance.retrievePage(myinstance, lastRow, function(err, pageresult) {
																				if (err) { return console.error(err); }
																				rows.push(pageresult.factMap['T!T'].rows);
																				if(lastRow >= 100000) {
																						fs.readFile(TEMPLATE, function (err, data) {
																								res.write(Mustache.render(data.toString(), {data: rows}));
																								res.end();
																						});
																						console.log(new Date());
																				} else {
																						getNextPage(lastRow+PAGESIZE);
																				}
																		});
																};
																getNextPage(0);		
														} else {
																pollToComplete();
														}
												});
										};
										pollToComplete();
								});
						});
				});
});
app.listen(PORT);
