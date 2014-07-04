// Call the init method with sessionId

angular.module('analyticsApi', [], function($provide) { 
    $provide.factory('analyticsApiService', ['$http', '$timeout', 
        function($http, $timeout){
            var ret = {};
            ret.init = function(sessionId, instanceUrl) {
                ret.sessionId = sessionId;
                ret.instanceUrl = instanceUrl || '';
            };
            ret.getReportUrl = function (reportId) {
                return ret.instanceUrl + '/services/data/v30.0/analytics/reports/' + reportId+'/instances';
            };
            ret.pollAndFetch = function(pollUrl, afterDataFetch) {
                var pollFn = function() {
                    $http({
                        url: pollUrl,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + ret.sessionId
                        },
                        cache: false
                    }).success(function(response) {
                        if(response.attributes.status == "Success") {
                            afterDataFetch(response);
                        } else {
                            $timeout(pollFn, 200);
                        }
                    });
                };
                pollFn();  
            };
            ret.fetchData = function (reportId, afterDataFetch) {
                $http({
                    url: ret.getReportUrl(reportId),
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + ret.sessionId
                    },
                    cache: true
                }).success(function (response) {
                    var getResults = function() {
                        ret.pollAndFetch(response.url, afterDataFetch);
                    };
                    $timeout(getResults, 200);
                });
            };
            ret.fetchReports = function(reportIds, afterDataFetch) {
                var reportResults = new Array(reportIds.length);
                angular.forEach(reportIds, function(reportId, key) {
                    ret.fetchData(reportId, function(response) {
                       reportResults[key] = response;
                       var complete = true;
                       for(var i=0;i<reportResults.length;i++) {
                           if(undefined === reportResults[i]) {
                               complete = false;
                               break;
                           }
                       }
                       if(complete === true) {
                           afterDataFetch(reportResults);
                       }
                    });
                });
            };
            return ret;
        }
    ])
});
