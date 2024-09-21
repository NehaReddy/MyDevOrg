public class displayQAs{


public list<Questions__c> quesList {get;set;}
public list<Responce__c > resplist { get; set;}
  
  public displayQAs(){
        quesList = [SELECT Question__c,Serial_No__c,(SELECT Answer__c,Q_A__c FROM Responces__r) FROM Questions__c ORDER BY Serial_No__c ];
    }
    
  public void save(){
    
  }
  
     public class wrapperclass{
            
     } 
  
}