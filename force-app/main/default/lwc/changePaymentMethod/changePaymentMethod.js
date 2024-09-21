import { LightningElement,wire } from 'lwc';
import {publish, subscribe,unsubscribe, MessageContext } from 'lightning/messageService';
import paymentInfo from '@salesforce/messageChannel/paymentInfo__c';

export default class ChangePaymentMethod extends LightningElement {

    @wire(MessageContext)
    messageContext;

    subscription = null;
    messageValue;
    ccmessageValue;
    achmessageValue;

  
    //subsription code
    subscribeToMessageChannel() {
        if(!this.subscription){
            this.subscription = subscribe(
                this.messageContext,
                paymentInfo,
                (message) => this.handleMessage(message),
            );
            console.log('received in changepayment Screen');
        }
    }

    handleMessage(message){
        if(message.source =='ccval'){
            const ccmessageVal = message.ccValidated;
            this.ccmessageValue = ccmessageVal;
            console.log('-ccmessageValue--',this.ccmessageValue)
        }else if(message.source =='achval'){
            const achmessageVal = message.achValidated;
            this.achmessageValue = achmessageVal;
            this.ccmessageValuee = false;
            console.log('-achmessageValue--',this.achmessageValue)
        }
    }

    connectedCallback(){
        this.subscribeToMessageChannel();
    }


    //publishing code
        handleChangePaymentMethod(){ 
            const payload = {source: 'paymentMethod',switchToACH: true};
            publish(this.messageContext, paymentInfo, payload);
            console.log('-Send to Payment Screen--')
        }
}