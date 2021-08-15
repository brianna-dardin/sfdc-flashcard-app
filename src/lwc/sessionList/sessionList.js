import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import isCommunity from '@salesforce/apex/ChineseTermController.isCommunity';
import getMySessions from '@salesforce/apex/SessionController.getMySessions';

export default class SessionList extends NavigationMixin(LightningElement) {
    preData = [];
    allData = [];
    pageSize = 25;
    isComm = false;

    columns = [
        { label: 'Session Number', fieldName: 'sessLink', type: 'url', typeAttributes: { label: { fieldName: 'name' }, target: '_top' }, sortable: true },
        { label: 'Card Front', fieldName: 'deckFront', sortable: true },
        { label: 'Levels', fieldName: 'levels', sortable: true },
        { label: 'Total Cards', fieldName: 'totalCards', type: 'number', sortable: true },
        { label: 'Total Correct Cards', fieldName: 'correctCards', type: 'number', sortable: true },
        { label: 'Total Incorrect Cards', fieldName: 'incorrectCards', type: 'number', sortable: true },
        { label: 'Completed Date', fieldName: 'completedDate', type: 'date-local', sortable: true }
    ];

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        isCommunity()
        .then(result => {
            this.isComm = result;
            this.getSessions();
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
                console.log("Unknown error");
            }  
        })
    }

    getSessions() {
        getMySessions()
        .then(result => {
            this.preData = result;

            if (this.preData) {
                if (this.isComm) {
                    let paths = window.location.pathname.split('/');
                    let newPaths = [];
        
                    for(var i = 0; i < paths.length; i++) {
                        if (paths[i]) {
                            if (paths[i] != "Session__c") {
                                newPaths.push(paths[i]);
                            } else {
                                break;
                            }
                        } 
                    }
        
                    let urlPrefix = "/" + newPaths.join('/');
                    for (var i = 0; i < this.preData.length; i++) {
                        let newURL = urlPrefix + this.preData[i].sessLink;
                        this.preData[i].sessLink = newURL;
                    }
                }
        
                this.allData = this.preData.map((x) => x);
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
                console.log("Unknown error");
            }
        })
    }
}