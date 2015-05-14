// DEPS
var express = require('express');
var fs = require('fs');
var Mustache = require('mustache');
var jsforce = require('jsforce');
var morgan = require('morgan');
var _ = require('underscore');
var compression = require('compression')

// Constants
var PORT = 9000;
var TEMPLATE = './src/index.mst';
var TEMPLATE_TABLE = './src/table.mst';
var PAGESIZE = 2000;
var OAUTH2 = new jsforce.OAuth2({
		clientId : process.env.CID,
		clientSecret : process.env.CS,
		redirectUri : process.env.URL
});

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
app.use(compression());
app.get('/auth', function(req, res) {
		res.redirect(OAUTH2.getAuthorizationUrl({ scope : 'full' }));
});
app.get('/', function (req, res) {
		var code = req.query.code;
		if(!code) {
			res.redirect('/auth');
		}
		var conn = new jsforce.Connection({ oauth2: OAUTH2 });
  		conn.authorize(code, function(err, userInfo) {
				conn.analytics.reports(function(err, reports) {
						if (err) { return console.error(err); }
						var reportId = reports[0].id;
						fs.readFile(TEMPLATE, function (err, data) {
								res.write(Mustache.render(data.toString(), {reportid: reportId, refreshToken: conn.refreshToken, accessToken: conn.accessToken, instanceUrl: conn.instanceUrl}));
								res.end();
						});
				});
		});
}); 
app.get('/report', function (req, res) {
		console.log(new Date());
		var conn = new jsforce.Connection({
				oauth2 : OAUTH2,
				instanceUrl : req.query.instanceUrl,
				accessToken : req.query.accessToken,
				refreshToken : req.query.refreshToken
		});
		var report = conn.analytics.report(req.query.reportId);
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
																fs.readFile(TEMPLATE_TABLE, function (err, data) {
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
app.listen(PORT);
app.on('connection', function(socket) {
  console.log("A new connection was made by a client.");
  socket.setTimeout(300 * 1000); 
})
