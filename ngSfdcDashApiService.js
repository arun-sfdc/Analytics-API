// Call the init method with sessionId, dashboardId and afterDataFetchFn
// Refresh will automatically poll to completion
// Poll will call afterDataFetchFn after completion.

angular.module('dashApi', [], function($provide) { 
        $provide.factory('dashApiService', ['$http', '$timeout', 
            function($http, $timeout){
                var ret = {};
                ret.init = function(sessionId, dashboardId, afterDataFetch, instanceUrl) {
                    ret.sessionId = sessionId;
                    ret.dashboardId = dashboardId;
                    ret.afterDataFetch = afterDataFetch;
                    ret.instanceUrl = instanceUrl || '';
                };
                ret.getDashboardUrl = function () {
                    return ret.instanceUrl + '/services/data/v30.0/analytics/dashboards/' + ret.dashboardId;
                };
                ret.poll = function () {
                    $http({
                        url: ret.getDashboardUrl() + '/status',
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + ret.sessionId
                        }
                    }).success(function (response) {
                        var done = true;
                        angular.forEach(response.componentStatus, function (e, i) {
                            done = done && (e.refreshStatus === "IDLE");
                        });
                        (done === true) ? ret.fetchData(true) : $timeout(ret.poll, 250);
                    });
                };
                ret.refresh = function () {
                    $http({
                        url: ret.getDashboardUrl(),
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Bearer ' + ret.sessionId
                        }    
                    }).success(function (response) {
                        $timeout(ret.poll, 200);
                    });
                };
                ret.fetchData = function (ignoreCache) {
                    $http({
                        url: ret.getDashboardUrl(),
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + ret.sessionId
                        },
                        cache: (true != ignoreCache)
                    }).success(function (response) {
                        ret.afterDataFetch(response);
                    });
                };
                return ret;
            }
        ])
    });
