import { LightningElement,wire } from 'lwc';
import {publish, subscribe,unsubscribe, MessageContext } from 'lightning/messageService';
import filterChannel from '@salesforce/messageChannel/filterChannel__c';
export default class Filterselector extends LightningElement {

    @wire(MessageContext)
    messageContext;

    searchKey;

    handleonchange(event){
       this.searchKey = event.target.value;
    }

    handleSearch(){
        console.log('-published from filter--' );
        console.log('-searchKey--' ,this.searchKey);
        const payload = {source:'filterLWC', searchKeyVal: this.searchKey};

        publish(this.messageContext, filterChannel, payload);
        console.log('-published from filter1--' );

 
    }
}