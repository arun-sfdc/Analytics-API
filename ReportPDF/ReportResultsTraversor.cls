public class ReportResultsTraversor {
        private List<Reports.GroupingValue> down = new List<Reports.GroupingValue>();
        Reports.ReportResults result = null;
        ReportResultsVisitor visitor = null;
        
        public ReportResultsTraversor(Reports.ReportResults result, ReportResultsVisitor visitor) {
            this.result = result;
            this.visitor = visitor;
        } 
		
        public void process() {
            for(Reports.GroupingValue grouping: result.getGroupingsDown().getGroupings()) {
                processGrouping(grouping);
            }
    	}
        
        private void processGrouping(Reports.GroupingValue grouping) {
            down.add(grouping);
           	visitor.processSummary(down, null, result.getFactMap().get(grouping.getKey()+'!T'));
            if(grouping.getGroupings() != null && grouping.getGroupings().size() > 0) {
                for(Reports.GroupingValue subgrouping:grouping.getGroupings()) {
                    processGrouping(subgrouping);
                }
            }
            down.remove(down.size() - 1);
    	}
}