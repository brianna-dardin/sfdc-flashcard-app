import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import isGuest from '@salesforce/user/isGuest';
import getMyTermLevels from '@salesforce/apex/ChineseTermController.getMyTermLevels';

export default class AllTermLevels extends LightningElement {
    init = false;
    showGraph;
    levels = [];
    chartConfig;

    renderedCallback() {
        if (this.init) {
            return;
        }

        this.init = true;
        this.getData();
    }

    getData() {
        getMyTermLevels({
            isGuest : isGuest,
            onlyActive : true
        })
            .then(result => {
                this.levels = result;
                if (this.levels.length > 0) {
                    this.setupGraphConfig();
                } else {
                    this.showGraph = false;
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
        for (let i = 0; i < this.levels.length; i++) {
            labels.push(this.levels[i].level.toString());
            data.push(this.levels[i].amount);
        }

        if (labels.length > 0 && data.length > 0) {
            this.chartConfig = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 102, 163, 0.2)',
                            'rgba(201, 203, 207, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(186, 71, 117)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
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
                        text: 'Number of Terms Per Level'
                    }
                }
            }
        }

        this.showGraph = true;
    }
}