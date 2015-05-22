var express = require('express');
var fs = require('fs');
var Mustache = require('mustache');
var jsforce = require('jsforce');
var app = express();
app.listen(9000);
app.get('/', function(req, res) {
    var METRICS = [{
            reportid: '', username: '', password: '', loginurl: 'https://na1.salesforce.com', chart: 'pie'}, // chart = pie, bar or table
          { reportid: '', username: '', password: '!j', loginurl: 'https://na1.salesforce.com', chart: 'table'} ];

    function getReportResults(metric, callback) {
        var conn = new jsforce.Connection({
            loginUrl: metric.loginurl
        });
        conn.login(metric.username, metric.password, function(err, resp) {
            var report = conn.analytics.report(metric.reportid);
            report.executeAsync(function(err, instance) {
                var pollToComplete = function() {
                    report.instance(instance.id).retrieve(function(err, result) {
                        if (result.attributes.status == 'Success')
                            callback(result);
                        else
                            pollToComplete();
                    });
                };
                pollToComplete();
            });
        });
    }
    var result = [];
    var afterResult = function(reportResult) {
        reportResult.id = result.length;
        reportResult.chart = METRICS[result.length].chart;
        result.push(reportResult);
        if (result.length < METRICS.length) {
            getReportResults(METRICS[result.length], afterResult);
        } else {
            fs.readFile('./src/template.mst', function(err, data) {
                res.write(Mustache.render(data.toString(), {
                    data: result,
                    string: JSON.stringify(result)
                }));
                res.end();
            });
        }
    };
    getReportResults(METRICS[0], afterResult);
});
