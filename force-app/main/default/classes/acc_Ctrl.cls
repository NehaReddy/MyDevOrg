public class acc_Ctrl{

    public acc_Ctrl(ApexPages.StandardController controller) {

    }

 //create a sum method  
 public integer sum(integer a,integer b){
 return a+b;
 }
 
 public boolean showPopup {get;set;}
 
     public void doSave(){
         showPopup =true;
     }
 }