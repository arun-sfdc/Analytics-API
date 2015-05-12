public class ReportAPI {
    public String repId { get; set; }
    public String msg { get; set; }

    public void post() {
        Id reportId = this.repId;
        String msg = this.msg;
        Reports.ReportResults results = Reports.ReportManager.runReport(reportId);
        List<FeedItem> posts = new List<FeedItem>();
        for(Reports.GroupingValue user: (( Reports.Dimension)results.getGroupingsDown()).getGroupings()) {
            String factMapKey = user.getKey()+'!T';
            Reports.ReportFact factMapEntry = ((Map<String,Reports.ReportFact>)results.getFactMap()).get(factMapKey);
            String numCases = ((List<Reports.SummaryValue>)factMapEntry.getAggregates()).get(0).getLabel();
            FeedItem post = new FeedItem();
            post.parentId = (Id)user.getValue();
            post.body = msg;
            posts.add(post);
        }
        insert posts;
    }
}
