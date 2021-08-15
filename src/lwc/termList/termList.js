import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import isGuest from '@salesforce/user/isGuest';
import isCommunity from '@salesforce/apex/ChineseTermController.isCommunity';
import getMyTerms from '@salesforce/apex/ChineseTermController.getMyTerms';

export default class TermList extends NavigationMixin(LightningElement) {
    preData = [];
    allData = [];
    pageSize = 25;
    isComm = false;

    columns = [
        { label: 'Term Number', fieldName: 'termLink', type: 'url', typeAttributes: { label: { fieldName: 'name' }, target: '_top' }, sortable: true },
        { label: 'English', fieldName: 'english', sortable: true },
        { label: 'Pin Yin', fieldName: 'pinYin', sortable: true },
        { label: 'Character', fieldName: 'character', sortable: true },
        { label: 'Level', fieldName: 'level', sortable: true },
        { label: 'Date Created', fieldName: 'createdDate', type: 'date-local', sortable: true },
        { label: 'Last Session Date', fieldName: 'lastSessionDate', type: 'date-local', sortable: true }
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
            this.getTerms();
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

    getTerms() {
        getMyTerms({
            "isGuest" : isGuest
        })
        .then(result => {
            this.preData = result;

            if (this.preData) {
                if (this.isComm) {
                    let paths = window.location.pathname.split('/');
                    let newPaths = [];
        
                    for(var i = 0; i < paths.length; i++) {
                        if (paths[i]) {
                            if (paths[i] != "Chinese_Term__c") {
                                newPaths.push(paths[i]);
                            } else {
                                break;
                            }
                        } 
                    }
        
                    let urlPrefix = "/" + newPaths.join('/');
                    for (var i = 0; i < this.preData.length; i++) {
                        let newURL = urlPrefix + this.preData[i].termLink;
                        this.preData[i].termLink = newURL;
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

    newClick(event) {
        if (this.isComm) {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Create_Term__c'
                }
            });
        } else {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Chinese_Term__c',
                    actionName: 'new'
                }
            });
        }
    }
}