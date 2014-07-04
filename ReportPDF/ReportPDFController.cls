public class ReportPDFController {
    private List<String> headers = null;
    private Reports.ReportResults results = null;

    public List<List<List<Cell>>> getSections() {
        Id reportId = ApexPages.currentPage().getParameters().get('reportId');
        this.results = Reports.ReportManager.runReport(reportId);
        LabelVisitor v = new LabelVisitor(this.results);
        ReportResultsTraversor t = new ReportResultsTraversor(this.results, v);
        t.process();
		return v.getSections();
    }
    
    public List<String> getReportHeaders() {
        if(headers != null) {
            return headers;
        }
        this.headers = new List<String>();
        // Grouping Header
        for(Reports.GroupingInfo column:results.getReportMetadata().getGroupingsDown()) {
            headers.add(results.getReportExtendedMetadata().getGroupingColumnInfo().get(column.getName()).getLabel());
        }
        // Aggregates Header
        for(String column:results.getReportMetadata().getAggregates()) {
            headers.add(results.getReportExtendedMetadata().getAggregateColumnInfo().get(column).getLabel());
        }
        return headers;
    }
    
    public class Cell {
        String value;
        String bgcolor ='#D8F6CE';
        
        public Cell(String value, String bgcolor) {
            this.value = value;
            this.bgcolor = bgcolor;
        }
        
        public Cell(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return this.value;
        }
        
        public String getBgColor() {
            return this.bgcolor;
        }

    }
    
    private class LabelVisitor implements ReportResultsVisitor {
        Reports.ReportResults result = null;
        List<List<List<Cell>>> sections = new List<List<List<Cell>>>();
        List<List<Cell>> rows = new List<List<Cell>>();
        String groupingKey = null;
        
        LabelVisitor(Reports.ReportResults result) {
            this.result = result;
        }
        
        public void processSummary(List<Reports.GroupingValue> down, List<Reports.GroupingValue> across, Reports.ReportFact fact) {
            if(null == this.groupingKey) {
                this.groupingKey = down.get(down.size() - 1).getKey();
            }
            if(down.size() == 1 && this.groupingKey != down.get(down.size() - 1).getKey()) {
                this.sections.add(this.rows);
                this.rows = new List<List<Cell>>();
                this.groupingKey = down.get(down.size() - 1).getKey();
            }
            List<Cell> row = new List<Cell>();
            if(null != down) {
                for(Reports.GroupingValue g:down) {
                    row.add(new Cell(g.getLabel()));
                }
                for(Integer i=0;i<result.getReportMetadata().getGroupingsDown().size() - down.size();i++) {
                	row.add(new Cell('----------'));
            	}
            }
            for(Reports.SummaryValue agg: fact.getAggregates()) {
                row.add(new Cell(agg.getLabel(), (Double) agg.getValue() > 100000 ? '#FF6666' :'#D8F6CE'));
            }
            rows.add(row);
        }
        
        List<List<List<Cell>>> getSections() {
            return sections;
        }
    }
}