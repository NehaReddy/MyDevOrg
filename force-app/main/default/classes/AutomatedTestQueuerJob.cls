global with sharing class AutomatedTestQueuerJob implements schedulable {
    
    global void execute(SchedulableContext SC) {
        doExecute();
    }
    
    @future (callout=true)
    public static void doExecute(){
        enqueueUnitTests();
    }
    
    webservice static void enqueueUnitTests(){      
        enqueueTests();
    }

    public static void enqueueTests() {
      
       ApexClass[] testClasses = 
         [SELECT Id,
                 Name
            FROM ApexClass 
           WHERE Name LIKE 'InstallationTests%'];
              
       Integer testClassCnt = testClasses != null ? testClasses.size() : 0;
        
       system.debug('   enqueueTests::testClassCnt ' + testClassCnt);
            
       if (testClassCnt > 0) {
          ApexTestQueueItem[] queueItems = new List<ApexTestQueueItem>();
            
          for (ApexClass testClass : testClasses) {
              system.debug('   enqueueTests::testClass ' + testClass);
                
              queueItems.add(new ApexTestQueueItem(ApexClassId=testClass.Id));
          }
        insert queueItems;

        ApexTestQueueItem item = 
            [SELECT ParentJobId
               FROM ApexTestQueueItem 
              WHERE Id=:queueItems[0].Id
              LIMIT 1];
          
            //create this custom object AutomatedTestingQueue__c and a text field AsyncId__c
          AutomatedTestingQueue__c atq = new AutomatedTestingQueue__c(
              AsyncId__c = item.parentjobid
          );

          insert atq;
       }
    }
}