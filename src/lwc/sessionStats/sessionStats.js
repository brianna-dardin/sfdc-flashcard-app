import { LightningElement, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';

export default class SessionStats extends LightningElement {
    @api session;

    allData = [];
    pageSize = 10;

    levels = '';
    numCards = 0;
    numCorrect = 0;
    numIncorrect = 0;
    pctCorrect = 0;
    pctIncorrect = 0;

    columns = [
        { label: 'English', fieldName: 'english', sortable: true },
        { label: 'Pin Yin', fieldName: 'pinYin', sortable: true },
        { label: 'Character', fieldName: 'character', sortable: true },
        { label: 'New Level', fieldName: 'levelChange', sortable: true },
        { label: '# Times Incorrect', fieldName: 'numIncorrect', sortable: true }
    ];

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        if (this.session && this.session.flashcards) {
            let cardData = this.session.flashcards.map((x) => x);

            if (cardData.length > 0) {
                this.numCards = cardData.length;

                for(var i = 0; i < cardData.length; i++) {
                    let term = {
                        'english' : cardData[i].term.english,
                        'pinYin' : cardData[i].term.pinYin,
                        'character' : cardData[i].term.character,
                        'levelChange' : cardData[i].levelChange,
                        'numIncorrect' : cardData[i].numIncorrect,
                        'cardId' : cardData[i].cardId
                    }
                    this.allData.push(term);

                    if (cardData[i].numIncorrect > 0) {
                        this.numIncorrect++;
                    } else {
                        this.numCorrect++;
                    }
                }
                
                this.pctCorrect = this.numCorrect / this.numCards;
                this.pctIncorrect = this.numIncorrect / this.numCards;
            }
        }
    }

    get hasCards() {
        return this.numCards > 0;
    }
}