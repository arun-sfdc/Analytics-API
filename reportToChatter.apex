// Run Report using Analytics API
HttpRequest req = new HttpRequest();
req.setEndpoint('https://cs12.salesforce.com/services/data/v29.0/analytics/reports/00OV0000000OTyR');
req.setHeader('Authorization', 'Bearer '+ UserInfo.getSessionId());
req.setMethod('GET');
Http http = new Http();
HTTPResponse res = http.send(req);
JSObject reportResult = JSObject.wrap(JSON.deserializeUntyped(res.getBody()));

// Make a feed post for each user in the report
List<FeedItem> posts = new List<FeedItem>();
for(JSObject user: reportResult.getAsObject('groupingsDown').getAsList('groupings')) {
    String factMapKey = user.get('key')+'!T'; // Refer to "Decode the FactMap"
    JSObject factMapEntry = reportResult.getAsObject('factMap').getAsObject(factMapKey);
    String numCases = (String) factMapEntry.getAsList('aggregates').get(0).get('label');
    
    // Construct the Feed object
    FeedItem post = new FeedItem();
    post.parentId = (Id)user.get('value');
    post.body = 'Alert!! You have '+ numCases + ' open cases.';
    posts.add(post);
}
insert posts;
