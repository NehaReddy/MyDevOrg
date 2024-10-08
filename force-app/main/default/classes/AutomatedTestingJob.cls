global with sharing class AutomatedTestingJob implements Schedulable {
    
    global void execute(SchedulableContext SC) {
        doExecute();
    }

    // Have to use a future method so the email will be sent out.
    @future (callout=true)
    public static void doExecute(){
        processAsyncResults();
    }
    
    public static void processAsyncResults(){
        List<AutomatedTestingQueue__c> queuedTests = 
           [select id,
                   name,
                   AsyncId__c
              from AutomatedTestingQueue__c
             limit 5];
        
        if (queuedTests != null && queuedTests.size() > 0){
            Set<Id> AsyncIds = new Set<Id>();

            for (AutomatedTestingQueue__c queuedJob : queuedTests){
                 AsyncIds.add(queuedJob.AsyncId__c);
            }
            
            List<ApexTestQueueItem> queuedItems = checkClassStatus(AsyncIds);
            
            Map<Id, List<ApexTestQueueItem>> groupedTestsByJob = new Map<Id, List<ApexTestQueueItem>>();

            for (ApexTestQueueItem atqi : queuedItems){
                 if (groupedTestsByJob.containsKey(atqi.ParentJobId) == true){
                     List<ApexTestQueueItem> groupedTests = groupedTestsByJob.get(atqi.ParentJobId);
                     groupedTests.add(atqi);
                 }
                 else{
                     List<ApexTestQueueItem> groupedTests = new List<ApexTestQueueItem>();
                     groupedTests.add(atqi);
                     groupedTestsByJob.put(atqi.ParentJobId, groupedTests);
                 }
            }
            
            Set<Id> completedAsyncIds = getCompletedAsyncJobsIds(groupedTestsByJob);
            
            if (completedAsyncIds != null && completedAsyncIds.size() > 0){
                
                List<ApexTestResult> testResults = checkMethodStatus(completedAsyncIds);
                
                Map<Id, List<ApexTestResult>> groupedTestResultsByJob = new Map<Id, List<ApexTestResult>>();
                
                
                for (ApexTestResult testResult : testResults){
                    if (groupedTestResultsByJob.containsKey(testResult.AsyncApexJobId)){
                        List<ApexTestResult> groupedTestsResults = groupedTestResultsByJob.get(testResult.AsyncApexJobId);
                        groupedTestsResults.add(testResult);
                    }
                    else{
                        List<ApexTestResult> groupedTestsResults = new List<ApexTestResult>();
                        groupedTestsResults.add(testResult);
                        
                        groupedTestResultsByJob.put(testResult.AsyncApexJobId, groupedTestsResults );
                    }
                }

                List<AutomatedTestingQueue__c> queuedTestsToDelete = new List<AutomatedTestingQueue__c>(); 
                
                for (List<ApexTestResult> jobTestResults : groupedTestResultsByJob.values()){
                    sendTestResultEmail(jobTestResults);
                }
                
                for (AutomatedTestingQueue__c queuedTest : queuedTests){
                    for (Id completedAsyncId : completedAsyncIds){
                        if (queuedTest.AsyncId__c == completedAsyncId){
                            queuedTestsToDelete.add(queuedTest);
                            break;
                        }
                    }
                    if (groupedTestsByJob.containsKey(queuedTest.asyncId__c) == false){
                        queuedTestsToDelete.add(queuedTest);
                    }
                }
                
                if (queuedTestsToDelete.size() > 0){
                    delete queuedTestsToDelete;
                }
            }
        }
    }
    
    public static Set<Id> getCompletedAsyncJobsIds(Map<Id, List<ApexTestQueueItem>> groupedTestsByJob){
        Set<Id> completedAsyncJobIds = new Set<Id>();
        
        for (List<ApexTestQueueItem> jobTests : groupedTestsByJob.values()){
            if (jobTests == null || jobTests.size() == 0){
                continue;
            }
            
            Boolean allCompleted = true;
            
            for (ApexTestQueueItem queuedTest : jobTests){
                if (queuedTest.Status != 'Completed' && queuedTest.Status != 'Failed' && queuedTest.Status != 'Aborted'){
                    allCompleted = false;
                    break;
                }
            }
            
            if (allCompleted == true){
                completedAsyncJobIds.add(jobTests[0].ParentJobId);
            }
        }
        
        return completedAsyncJobIds;
    }
    
    private static void sendTestResultEmail(List<ApexTestResult> jobTestResults){
        system.debug(' In sendTestResultEmail');
            
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        
        String emailAddress = 'its.neha4291@gmail.com';
        
        String[] toAddresses = new String[] { emailAddress };
    
        mail.setToAddresses(toAddresses);
        
        String emailSubject = 'Dev Unit Test Results ' + String.valueOf(Date.today()); 
    
        mail.setSubject(emailSubject);

        String testResultEmailbody = getTestResultHtmlEmailBody(jobTestResults);

        mail.setHtmlBody(testResultEmailbody);
        Messaging.sendEmail(new Messaging.Email[] { mail });
        
        system.debug(' sent test results email');
    }
    
    private static String getTestResultHtmlEmailBody(List<ApexTestResult> jobTestResults){
        system.debug(' In getTestResultHtmlEmailBody');
        
        List<ApexTestResult> successTests = new List<ApexTestResult>();
        List<ApexTestResult> failedTests = new List<ApexTestResult>();
        
        for (ApexTestResult jobTestResult : jobTestResults){
            if (jobTestResult.Outcome == 'Pass'){
                successTests.add(jobTestResult);
            }
            else{
                failedTests.add(jobTestResult);
            }
        }
        
        Integer numTestsRun = successTests.size() + failedTests.size();
        Integer numFailures = failedTests.size();
        Integer successNum = numTestsRun - numFailures;
        
        if (successNum < 0){
            successNum = 0;
        }
        
        String testResultBody = '';
        
        testResultBody += 'no of tests run :' + numTestsRun + '';
        testResultBody += 'no of failures :' + numFailures + '';
        testResultBody += 'no of success : ' + successNum + '';
        
        return testResultBody;
    }


   public static List<ApexTestQueueItem> checkClassStatus(Set<ID> jobIds) {
        ApexTestQueueItem[] items = 
           [SELECT ApexClass.Name,
                   Status,
                   ExtendedStatus,
                   ParentJobId
            FROM ApexTestQueueItem 
            WHERE ParentJobId in :jobIds];
            
        for (ApexTestQueueItem item : items) {
            String extStatus = item.extendedstatus == null ? '' : item.extendedStatus;
            System.debug(item.ApexClass.Name + ': ' + item.Status + extStatus);
        }
        
        return items;
    }

    public static List<ApexTestResult> checkMethodStatus(Set<ID> jobIds) {
        ApexTestResult[] results = 
           [SELECT Outcome,
                   MethodName,
                   Message,
                   StackTrace,
                   AsyncApexJobId, 
                   ApexClass.Name,
                   ApexClass.Body,
                   ApexClass.LengthWithoutComments,
                   ApexClass.NamespacePrefix,
                   ApexClass.Status,
                   ApexLogId,
                   ApexLog.DurationMilliseconds,
                   ApexLog.Operation,
                   ApexLog.Request,
                   ApexLog.Status,
                   ApexLog.Location,
                   ApexLog.Application
            FROM ApexTestResult 
            WHERE AsyncApexJobId in :jobIds];
            
        for (ApexTestResult atr : results) {
            System.debug(atr.ApexClass.Name + '.' + atr.MethodName + ': ' + atr.Outcome);
            if (atr.message != null) {
                System.debug(atr.Message + '\n at ' + atr.StackTrace);
            }
        }
        
        return results;
    }
}