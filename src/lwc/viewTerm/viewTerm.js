import { LightningElement, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import isGuest from '@salesforce/user/isGuest';
import isCommunity from '@salesforce/apex/ChineseTermController.isCommunity';
import getThisTerm from '@salesforce/apex/ChineseTermController.getThisTerm';

export default class ViewTerm extends LightningElement {
    @api recordId;
    @api card = {};
    @api isEdit = false;
    guest = isGuest;

    hasCharacter = false;
    hasEnglish = false;
    hasPinyin = false;
    hasSound = false;
    hasSessions = false;

    audioURL;

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        if (this.recordId) {
            this.getTerm();
        }
    }

    getTerm() {
        getThisTerm({
            termId : this.recordId
        })
            .then(result => {
                this.card = result;
                this.setVariables();
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

    setVariables() {
        if (this.card) {
            if (this.card.numSessions > 0) {
                this.hasSessions = true;
            }

            if (this.card.character) {
                this.hasCharacter = true;
            }

            if (this.card.english) {
                this.hasEnglish = true;
            }

            if (this.card.pinYin) {
                this.hasPinyin = true;
            }

            if (this.card.sound) {
                this.hasSound = true;
            }

            if (this.hasSound && !this.isEdit) {
                if (this.card.sound.includes("/sfc/servlet.shepherd/version/download/")) {
                    isCommunity()
                    .then(result => {
                        if (result) {
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
    
                            this.audioURL = "/" + newPaths.join('/') + this.card.sound;
                        } else {
                            this.audioURL = this.card.sound;
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
                } else {
                    this.audioURL = this.card.sound;
                }
            }
        }
    }

    onClick(event) {
        this.isEdit = true;
    }

    onSave(event) {
        this.getTerm();
        this.isEdit = false;
    }
}