import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';
import isGuest from '@salesforce/user/isGuest';
import saveTerm from '@salesforce/apex/ChineseTermController.saveTerm';
import saveAttachment from '@salesforce/apex/ChineseTermController.saveAttachment';

export default class CreateTerm extends NavigationMixin(LightningElement) {
    MAX_FILE_SIZE = 4500000;
    CHUNK_SIZE = 950000;

    @api term;
    newTerm;
    file;
    fireCaptcha = false;
    guest = isGuest;

    isEdit = false;
    editType = 'Create New Term';
    verb = 'created';

    renderedCallback() {
        Promise.all([
            loadStyle(this, GlobalCSS)
        ]);
    }

    connectedCallback() {
        if (!this.term) {
            this.newTerm = {
                "termId" : "",
                "character" : "",
                "pinYin" : "",
                "english" : "",
                "isActive" : true
            }
        } else {
            if (this.term.termId) {
                this.isEdit = true;
                this.editType = 'Edit Term';
                this.verb = 'edited';
    
                this.newTerm = JSON.parse(JSON.stringify(this.term));
            }
        }
    }

    genericOnChange(event) {
        let name = event.target.name;
        let active = "isActive";
        let nameObj = new String(name);
        let activeObj = new String(active);
        let isActive = JSON.stringify(nameObj) === JSON.stringify(activeObj);
        
        if (isActive) {
            this.newTerm.isActive = event.target.checked;
        } else {
            this.newTerm[name] = event.target.value;
        }
    }

    handleFileChange(event) {
        if (event.target.files.length > 0) {
            this.file = event.target.files[0];

            if (!this.file.type.match(/(audio.*)/)) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'You can only upload one audio file.',
                        letiant: 'error'
                    })
                );
                return;
            }

            if (this.file.size > this.MAX_FILE_SIZE) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'File size cannot exceed ' + this.MAX_FILE_SIZE + ' bytes.\n' + 'Selected file size: ' + this.file.size,
                        letiant: 'error'
                    })
                );
                return;
            }
        }
    }

    handleSave(event) {
        if (isGuest) {
            this.fireCaptcha = true;
        } else {
            this.saveThisTerm();
        }
    }

    captchaHandler(event) {
        if (event.detail) {
            this.saveThisTerm();
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: "reCaptcha validation failed, please try again.",
                    variant: 'error'
                })
            );
        }
    }

    saveThisTerm() {
        saveTerm({
            "termString" : JSON.stringify(this.newTerm),
            "isGuest" : isGuest
        })
            .then(result => {
                this.newTerm = result;

                if (this.file) {
                    this.saveImage(this.file);
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Success! The term was successfully ' + this.verb,
                            variant: 'success'
                        })
                    );

                    if (this.isEdit) {
                        this.dispatchEvent(new CustomEvent('savedterm'));
                    } else {
                        this.goToRecord();
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

    saveImage(file) {
        let self = this;
        let reader = new FileReader();
        reader.onloadend = function() {
            let dataURL = reader.result;
            let base64Mark = 'base64,';
            let dataStart = dataURL.indexOf(base64Mark) + base64Mark.length;
            
            let fromPos = 0;
            let toPos = Math.min(dataURL.length, fromPos + self.CHUNK_SIZE);

            dataURL = dataURL.substring(dataStart);
            let base64Data = dataURL.substring(fromPos, toPos);

            saveAttachment({
                "termId" : self.newTerm.termId,
                "fileName" : file.name,
                "base64Data" : base64Data, 
                "contentType" : file.type
            })
                .then(result => {
                    self.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Success! The term was successfully ' + self.verb + ' with the sound file.',
                            variant: 'success'
                        })
                    );

                    if (self.isEdit) {
                        self.dispatchEvent(new CustomEvent('savedterm'));
                    } else {
                        self.goToRecord();
                    }
                })
                .catch(error => {
                    if (error && error.body && error.body.message) {
                        self.dispatchEvent(
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
        };
        reader.readAsDataURL(file);
    }

    goToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.newTerm.termId,
                objectApiName: 'Chinese_Term__c',
                actionName: 'view'
            }
        });
    }
}