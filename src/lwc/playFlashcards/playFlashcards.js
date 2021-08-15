import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import getFlashcards from '@salesforce/apex/SessionController.getFlashcards';
import endSession from '@salesforce/apex/SessionController.endSession';
import deleteSession from '@salesforce/apex/SessionController.deleteSession';

export default class PlayFlashcards extends LightningElement {
    sessionId;
    sessionObj = {};

    cardsToDisplay = [];
    currentCard = {};

    showForm = true;
    showCards = false;
    showStats = false;

    showError = false;
    errorMsg = '';

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    formSubmitHandler(event) {
        if (event.detail) {
            this.sessionId = event.detail;
            this.retrieveFlashcards();
        }
    }

    retrieveFlashcards() {
        getFlashcards({
            sessionId : this.sessionId
        })
            .then(result => {
                if (result != null && result != undefined) {
                    this.sessionObj = result;

                    if (this.sessionObj.flashcards.length > 0) {
                        this.cardsToDisplay = this.sessionObj.flashcards.map((x) => x);
                        this.currentCard = this.cardsToDisplay[0];

                        this.showForm = false;
                        this.showCards = true;
                    } else {
                        this.deleteThisSession();
                    }
                } else {
                    this.errorMsg = "Something went wrong. Please try again.";
                    this.errorBooleans();
                }
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.errorMsg = error.body.message;
                    this.errorBooleans();
                } else {
                    console.log(error);
                    this.errorMsg = "Something went wrong. Please try again.";
                    this.errorBooleans();
                }
            })
    }

    correctHandler() {
        let allIndex = this.sessionObj.flashcards.findIndex(card => card.cardId === this.currentCard.cardId);
        let oldLevel = this.sessionObj.flashcards[allIndex].term.level;

        let newLevel = Number(oldLevel) + 1;
        if (this.sessionObj.flashcards[allIndex].numIncorrect > 0) {
            newLevel = 2;
        }

        this.sessionObj.flashcards[allIndex].levelChange = oldLevel + " → " + newLevel.toString();

        if (this.cardsToDisplay.length > 1) {
            this.currentCard = this.cardsToDisplay[1];
            this.cardsToDisplay.splice(0, 1);
        } else {
            this.showCards = false;
            this.finishSession();
        }
    }

    incorrectHandler() {
        let allIndex = this.sessionObj.flashcards.findIndex(card => card.cardId === this.currentCard.cardId);
        this.sessionObj.flashcards[allIndex].numIncorrect++;

        this.cardsToDisplay.push(this.sessionObj.flashcards[allIndex]);
        this.currentCard = this.cardsToDisplay[1];
        this.cardsToDisplay.splice(0, 1);
    }

    finishSession() {
        endSession({
            sessionString : JSON.stringify(this.sessionObj)
        })
            .then(result => {
                this.sessionObj.flashcards.sort(this.compare);
                this.showStats = true;
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.errorMsg = error.body.message;
                    this.errorBooleans();
                } else {
                    console.log(error);
                    this.errorMsg = "Something went wrong. Please try again.";
                    this.errorBooleans();
                }
            })
    }

    compare(a, b) {
        if (a.levelChange < b.levelChange) {
            return -1;
        }
        if (a.levelChange > b.levelChange) {
            return 1;
        }
        return 0;
    }

    deleteThisSession() {
        deleteSession({
            sessionId : this.sessionId
        })
            .then(result => {
                this.errorMsg = "No eligible terms were found for this session. Please add more terms and try again.";
                this.errorBooleans();
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.errorMsg = error.body.message;
                    this.errorBooleans();
                } else {
                    console.log(error);
                    this.errorMsg = "Something went wrong. Please try again.";
                    this.errorBooleans();
                }
            })
    }

    errorHandler(event) {
        if (event.detail) {
            this.errorMsg = event.detail;
            this.errorBooleans();
        }
    }

    errorBooleans() {
        this.showForm = false;
        this.showCards = false;
        this.showStats = false;
        this.showError = true;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: this.errorMsg,
                variant: 'error'
            })
        );
    }
}