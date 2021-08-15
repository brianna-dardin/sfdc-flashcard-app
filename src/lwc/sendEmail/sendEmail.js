import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import isGuest from '@salesforce/user/isGuest';
import sendEmail from '@salesforce/apex/EmailController.sendEmail';

export default class SendEmail extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track message = '';

    @api formType;
    @api sendToEmails;
    @api submittedText;

    guest = isGuest;
    fireCaptcha = false;
    submitted = false;

    genericOnChange(event) {
        this[event.target.name] = event.target.value;
    }

    handleSubmit(event) {
        if (isGuest) {
            this.fireCaptcha = true;
        } else {
            this.sendThisEmail();
        }
    }

    captchaHandler(event) {
        if (event.detail) {
            this.sendThisEmail();
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

    sendThisEmail() {
        sendEmail({
            "firstName" : this.firstName,
            "lastName" : this.lastName,
            "formType" : this.formType,
            "fromEmail" : this.email,
            "toEmails" : this.sendToEmails,
            "message" : this.message
        })
        .then(result => {
            this.submitted = true;
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