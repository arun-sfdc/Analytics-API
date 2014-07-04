public interface ReportResultsVisitor {
 	void processSummary(List<Reports.GroupingValue> down, List<Reports.GroupingValue> across, Reports.ReportFact fact);
 }