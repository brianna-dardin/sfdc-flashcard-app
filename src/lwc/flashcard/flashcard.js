import { LightningElement, api } from 'lwc';
import isCommunity from '@salesforce/apex/ChineseTermController.isCommunity';

export default class Flashcard extends LightningElement {
    @api card;

    showCard = true;
    showFront = true;
    showBack = false;
    isComm = false;

    connectedCallback() {
        isCommunity()
            .then(result => {
                this.isComm = result;
            })
            .catch(error => {
                if (error && error.body && error.body.message) {
                    this.dispatchEvent(
                        new CustomEvent('carderror', { 
                            detail: error.body.message 
                        })
                    );
                } else {
                    console.log(error);
                    console.log("Unknown error");
                    this.dispatchEvent(
                        new CustomEvent('carderror', { 
                            detail: "Something went wrong. Please try again." 
                        })
                    );
                }  
            })
    }

    frontClicked(event) {
        this.showFront = false;
        this.showBack = true;
    }

    gotCorrect(event) {
        this.processCard('correct');
    }

    gotIncorrect(event) {
        this.processCard('incorrect');
    }

    processCard(eventType) {
        this.dispatchEvent(new CustomEvent(eventType));

        this.showFront = true;
        this.showBack = false;
    }

    get characterSession() {
        return this.card.deckFront === "Character";
    }

    get englishSession() {
        return this.card.deckFront === "English";
    }

    get pinyinSession() {
        return this.card.deckFront === "Pin Yin";
    }

    get soundSession() {
        return this.card.deckFront === "Sound";
    }

    get hasCharacter() {
        return this.card.term.character;
    }

    get hasEnglish() {
        return this.card.term.english;
    }

    get hasPinyin() {
        return this.card.term.pinYin;
    }

    get hasSound() {
        return this.card.term.sound;
    }

    get audioURL() {
        if (this.isComm && this.card.term.sound
                && this.card.term.sound.includes("/sfc/servlet.shepherd/version/download/")) {
            let paths = window.location.pathname.split('/');
            let newPaths = [];

            for(var i = 0; i < paths.length; i++) {
                if (paths[i]) {
                    if (paths[i] != "s") {
                        newPaths.push(paths[i]);
                    } else {
                        break;
                    }
                } 
            }

            return "/" + newPaths.join('/') + this.card.term.sound;
        } else {
            return this.card.term.sound;
        }
    }
}