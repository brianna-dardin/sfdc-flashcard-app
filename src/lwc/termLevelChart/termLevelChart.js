import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTermFlashcards from '@salesforce/apex/ChineseTermController.getTermFlashcards';

export default class TermLevelChart extends LightningElement {
    @api recordId;
    init = false;
    showGraph = false;
    flashcards = [];
    chartConfig;

    renderedCallback() {
        if (this.init) {
            return;
        }

        if (this.recordId) {
            this.init = true;
            this.getData();
        }
    }

    getData() {
        getTermFlashcards({
            termId : this.recordId
        })
            .then(result => {
                this.flashcards = result;
                if (this.flashcards.length > 1) {
                    this.setupGraphConfig();
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

    setupGraphConfig() {
        let labels = [];
        let data = [];
        for (let i = 0; i < this.flashcards.length; i++) {
            labels.push(this.flashcards[i].completedDate);
            data.push(this.flashcards[i].level);
        }

        if (labels.length > 0 && data.length > 0) {
            this.chartConfig = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                precision: 0
                            }
                        }]
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: true
                    },
                    cutoutPercentage: 75,
                    title: {
                        display: true,
                        text: 'Level Change Over Time'
                    }
                }
            }
        }

        this.showGraph = true;
    }
}