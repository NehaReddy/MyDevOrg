import { LightningElement } from 'lwc';
import getContactList from '@salesforce/apex/ContactController.getContactList';

export default class ImperativeApex extends LightningElement {

    contacts;
    error;

    async handleLoad() {
        try {
            const result = await getContactList();
            this.contacts = result;
        } catch (error) {
            this.error = error;
        }
    }
}