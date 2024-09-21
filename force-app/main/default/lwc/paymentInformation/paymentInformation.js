import { LightningElement,wire ,api} from 'lwc';
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, subscribe,unsubscribe,MessageContext } from 'lightning/messageService';
import paymentInfo from '@salesforce/messageChannel/paymentInfo__c';

import CARDNUMBER_FIELD from "@salesforce/schema/Account.Card_Number__c";
import EXPMONTH_FIELD from "@salesforce/schema/Account.Card_Exp_Month__c";
import EXPYEAR_FIELD from "@salesforce/schema/Account.Year__c";
import CVV_FIELD from "@salesforce/schema/Account.CVV__c";
import CARDHOLDER_FIELD from "@salesforce/schema/Account.Card_Holder_Name__c";
import ID_FIELD from "@salesforce/schema/Account.Id";

import ABAUMBER_FIELD from "@salesforce/schema/Account.ABA_Routing_Numeber__c";
import BANKACC_FIELD from "@salesforce/schema/Account.Bank_Account_Number__c";
import BANKNAME_FIELD from "@salesforce/schema/Account.Bank_Name__c";
import ACCTYPE_FIELD from "@salesforce/schema/Account.Account_Type__c";
import ACCHOLDER_FIELD from "@salesforce/schema/Account.Account_Holder_Name__c";


export default class PaymentInformation extends LightningElement {

    @api recordId ;
    @wire(MessageContext)
    messageContext;

    cardNumber; expMonth; expYear; cvv; cardHolderName; ccValidatedValue =false; subscriptionACH = null;switchValue =false;

    abaNumber;bankAccnumber;accType; bankName; accHolderName;
    achReadOnly =false;

    typeOptions =[
        { label: 'Savings', value: 'Savings' },
        { label: 'Checking', value: 'Checking' }
    ];

   handleChange(event){
    let inputElement = this.template.querySelectorAll("lightning-input");
        inputElement.forEach(function(element){
            console.log('inputVal', element.value);
                if(element.name=="inputCardnumber"){
                    this.cardNumber=element.value;
                }
                else if(element.name=="inputCVV"){
                    this.cvv=element.value;
                }else if(element.name=="inputCardHolderName"){
                    this.cardHolderName=element.value;
                }
                else if(element.name=="inputAbanumber"){
                    this.abaNumber=element.value;
                }else if(element.name=="inputAccNumber"){
                    this.bankAccnumber=element.value;
                }else if(element.name=="inputAccType"){
                    this.accType=element.value;
                }else if(element.name=="inputBankName"){
                    this.bankName=element.value;
                }else if(element.name=="inputAccHolderName"){
                    this.accHolderName=element.value;
                }
            },this);
            
   }

   //publishing code
   onClickCC(){
        const payload = {source: 'ccval',ccValidated: true};
        publish(this.messageContext, paymentInfo, payload);
   }

   onClickACH(){
    const payload = {source: 'achval',achValidated: true};
    publish(this.messageContext, paymentInfo, payload);
    }

   
    handleValidateCC(event){
        const allValid = [...this.template.querySelectorAll("lightning-input")].reduce(
            (validSoFar, inputFields) => {
              inputFields.reportValidity();
              return validSoFar && inputFields.checkValidity();
            },
            true,
          );
          if (allValid) {
                // Create the recordInput object
                const fields = {};
                fields[ID_FIELD.fieldApiName] = '0012v00002MKqPYAA1';
                fields[CARDNUMBER_FIELD.fieldApiName] = this.cardNumber;
                fields[EXPMONTH_FIELD.fieldApiName] = this.expMonth;
                fields[EXPYEAR_FIELD.fieldApiName] =this.expYear;
                fields[CVV_FIELD.fieldApiName] =this.cvv;
                fields[CARDHOLDER_FIELD.fieldApiName] =this.cardHolderName;

                const recordInput = { fields };

                console.log('input', JSON.stringify(recordInput));

                    updateRecord(recordInput)
                        .then(() => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                            title: "Success",
                            message: "CC INFO updated",
                            variant: "success",
                            }),
                        );
                        const payload = {source: 'ccval',ccValidated: true};
                        publish(this.messageContext, paymentInfo, payload);
                        console.log('published');
                        this.ccValidatedValue =true;
                        })
                        .catch((error) => {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                title: "Error Updating CC Ino",
                                message: error.body.message,
                                variant: "error",
                                }),
                            );
                        });
                    
    }
    else {
        // The form is not valid
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Something is wrong",
            message: "Check your input and try again.",
            variant: "error",
          }),
        );
      }
            

    }


    handleValidateACH(event){
        const allValid = [...this.template.querySelectorAll("lightning-input")].reduce(
            (validSoFar, inputFields) => {
              inputFields.reportValidity();
              return validSoFar && inputFields.checkValidity();
            },
            true,
          );
          if (allValid) {
                // Create the recordInput object
                const fields = {};
                fields[ID_FIELD.fieldApiName] = '0012v00002MKqPYAA1';
                fields[ABAUMBER_FIELD.fieldApiName] = this.abaNumber;
                fields[BANKACC_FIELD.fieldApiName] = this.bankAccnumber;
                fields[ACCTYPE_FIELD.fieldApiName] =this.accType;
                fields[BANKNAME_FIELD.fieldApiName] =this.bankName;
                fields[ACCHOLDER_FIELD.fieldApiName] =this.accHolderName;

                const recordInput = { fields };

                console.log('input', JSON.stringify(recordInput));

                    updateRecord(recordInput)
                        .then(() => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                            title: "Success",
                            message: "ACH INFO updated",
                            variant: "success",
                            }),
                        );
                        const payload = {source: 'achval',achValidated: true};
                        publish(this.messageContext, paymentInfo, payload);
                        console.log('published');
                        this.achReadOnly =true;
                        })
                        .catch((error) => {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                title: "Error Updating CC Ino",
                                message: error.body.message,
                                variant: "error",
                                }),
                            );
                        });
                    
            }
    else {
        // The form is not valid
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Something is wrong",
            message: "Check your input and try again.",
            variant: "error",
          }),
        );
      }
    }
            




    //subscrition code
    subScribeToMessage(){
        if(!this.subscriptionACH){
            this.subscriptionACH = subscribe(this.messageContext, paymentInfo, (message) => this.handleMessageACH(message));
        }  
        console.log('received in payment Screen');  
    }
    
    handleMessageACH(message){
        if(message.source =='paymentMethod'){
            const messageVal = message.switchToACH;
            console.log('-switchToACH--',messageVal)
            this.switchValue = messageVal;
        }
    }

    connectedCallback(){
        this.subScribeToMessage();
    }
}