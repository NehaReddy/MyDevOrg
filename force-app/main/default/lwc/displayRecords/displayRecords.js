import { LightningElement,wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import filterChannel from '@salesforce/messageChannel/filterChannel__c';
import findContacts from '@salesforce/apex/ContactController.findContacts';

export default class DisplayRecords extends LightningElement {

    searchKeyValue='';
    subscription = null;
    error;
    contacts;

    @wire(MessageContext)
    messageContext;


    async handleFindContacts(searchKeyVal) {
        console.log('-searchKeyVal--',searchKeyVal );
        try {
            const result = await findContacts({ searchKey: searchKeyVal });
            this.contacts = result;
        } catch (error) {
            this.error = error;
        }
    }


    subscribeToMesageChannel(){
        
        if(!this.subscription){
            this.subscription = subscribe(  
                this.messageContext,
                filterChannel,
                (message) => this.handleMessage(message),
            );
        }
        console.log('-received in displayrecords--');
    }

    handleMessage(message){
        console.log('-message--',message.source );
        if(message.source =='filterLWC'){
            this.searchKeyValue = message.searchKeyVal;
            this.handleFindContacts( this.searchKeyValue);
        }
       
    }

    connectedCallback(){
        this.subscribeToMesageChannel();
    }

}