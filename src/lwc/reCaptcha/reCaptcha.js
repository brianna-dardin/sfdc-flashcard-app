import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import verifyCaptcha from '@salesforce/apex/CaptchaController.verifyCaptcha';

export default class ReCaptcha extends LightningElement {
    fireCaptcha = false;
    @api get fire() {
        return this.fireCaptcha;
    }
    set fire(value) {
        this.setAttribute('fire', value);
        this.fireCaptcha = value;

        if (this.fireCaptcha) {
            document.dispatchEvent(new Event("grecaptchaExecute"));
        }
    }

    renderedCallback() {
        let divElement = this.template.querySelector('[data-id=recaptchaInvisible]');
        let payload = { element: divElement, badge: 'bottomright' };
        document.dispatchEvent(new CustomEvent("grecaptchaRender", { "detail" : payload }));
    }

    connectedCallback() {
        this._onCaptcha = this.onCaptcha.bind(this);
        document.addEventListener("grecaptchaVerified", this._onCaptcha);
    }

    onCaptcha(event) {
        verifyCaptcha({
            "token" : event.detail.response
        })
            .then(result => {
                this.dispatchEvent(new CustomEvent('captcharesult', { detail: result }));
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