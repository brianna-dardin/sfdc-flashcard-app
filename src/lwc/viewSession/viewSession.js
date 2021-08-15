import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import getFlashcards from '@salesforce/apex/SessionController.getFlashcards';

export default class ViewSession extends LightningElement {
    @api recordId;
    sessionObj = {};
    sessionAvail = false;

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        if (this.recordId) {
            this.retrieveFlashcards();
        }
    }

    retrieveFlashcards() {
        getFlashcards({
            sessionId : this.recordId
        })
            .then(result => {
                if (result != null && result != undefined) {
                    this.sessionObj = result;
                    this.sessionAvail = true;
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: "Something went wrong. Please try again.",
                            variant: 'error'
                        })
                    );
                }
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                } else {
                    console.log(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: "Something went wrong. Please try again.",
                            variant: 'error'
                        })
                    );
                }
            })
    }
}