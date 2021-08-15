import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import isGuest from '@salesforce/user/isGuest';
import getMyTermLevels from '@salesforce/apex/ChineseTermController.getMyTermLevels';

export default class RetiredTerms extends LightningElement {
    lastLevel;
    otherLevels;

    numRetired = 0;
    pctRetired = 0;

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        this.getData();
    }

    getData() {
        getMyTermLevels({
            isGuest : isGuest,
            onlyActive : false
        })
            .then(result => {
                if (result && result.length > 0) {
                    this.lastLevel = result.pop();
                    
                    if (this.lastLevel.level === '8') {
                        this.otherLevels = result;
                        this.numRetired = this.lastLevel.amount;

                        let otherTotal = 0;
                        for (let i = 0; i < this.otherLevels.length; i++) {
                            otherTotal += this.otherLevels[i].amount;
                        }

                        if (otherTotal > 0) {
                            this.pctRetired = this.numRetired / (this.numRetired + otherTotal);
                        }
                    }
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