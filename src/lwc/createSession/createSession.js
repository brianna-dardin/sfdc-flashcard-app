import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import isGuest from '@salesforce/user/isGuest';
import getTotalCards from '@salesforce/apex/SessionController.getTotalCards';
import createSession from '@salesforce/apex/SessionController.createSession';

export default class CreateSession extends LightningElement {
    @track deckType = '';
    @track numberNewCards = 0;

    guest = isGuest;
    cardsAvailable;
    sessionLevels = [];
    sessionId;

    get options() {
        return [
            { label: 'Character', value: 'Character' },
            { label: 'English', value: 'English' },
            { label: 'Pin Yin', value: 'Pin Yin' },
            { label: 'Sound', value: 'Sound' }
        ];
    }

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        getTotalCards({
            isGuest : this.guest
        })
            .then(result => {
                if (result != null && result != undefined && result.length > 0) {
                    this.cardsAvailable = result[0].amount;
                    if (this.cardsAvailable < 1) {
                        this.dispatchEvent(
                            new CustomEvent('sessionerror', { 
                                detail: "There are no new cards available for a session. Please add at least one new term and try again." 
                            })
                        );
                    }

                    if (result.length > 1) {
                        for (var i = 1; i < result.length; i++) {
                            if (result[i].amount > 0) {
                                this.sessionLevels.push(result[i]);
                            }
                        }
                    }
                } else {
                    this.dispatchEvent(
                        new CustomEvent('sessionerror', {
                            detail: "Something went wrong. Please try again." 
                        })
                    );
                }
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.dispatchEvent(
                        new CustomEvent('sessionerror', { 
                            detail: error.body.message 
                        })
                    );
                } else {
                    console.log(error);
                    console.log("Unknown error");
                    this.dispatchEvent(
                        new CustomEvent('sessionerror', { 
                            detail: "Something went wrong. Please try again." 
                        })
                    );
                }
            })
    }

    genericOnChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleClick(event) { 
        if (!this.deckType) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: "Please select the front of the cards.",
                    variant: 'error'
                })
            );

            event.preventDefault();
            return false;            
        } else if (this.numberNewCards < 1) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: "Number of cards drawn must be greater than zero.",
                    variant: 'error'
                })
            );

            event.preventDefault();
            return false;
        } else if (this.numberNewCards > this.cardsAvailable) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: "Number of cards drawn cannot be greater than the amount available: " + this.cardsAvailable,
                    variant: 'error'
                })
            );

            event.preventDefault();
            return false;
        }

        this.makeSession(event);
    }

    makeSession(event) {
        createSession({
            deckType : this.deckType,
            numberNewCards : this.numberNewCards,
            isGuest : this.guest
        })
            .then(result => {
                if (result != null && result != undefined) {
                    this.sessionId = result;

                    this.dispatchEvent(
                        new CustomEvent('create', { 
                            detail: this.sessionId 
                        })
                    );
                } else {
                    this.dispatchEvent(
                        new CustomEvent('sessionerror', { 
                            detail: "Something went wrong. Please try again." 
                        })
                    );
                }
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.dispatchEvent(
                        new CustomEvent('sessionerror', { 
                            detail: error.body.message 
                        })
                    );
                } else {
                    console.log(error);
                    console.log("Unknown error");
                    this.dispatchEvent(
                        new CustomEvent('sessionerror', { 
                            detail: "Something went wrong. Please try again." 
                        })
                    );
                }
            })
    }
}