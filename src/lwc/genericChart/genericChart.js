import { LightningElement, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ChartJS from '@salesforce/resourceUrl/ChartJS';
import GlobalCSS from '@salesforce/resourceUrl/GlobalCSS';

export default class GenericChart extends LightningElement {
    @api chartConfig;
    init = false;
    showGraph = false;

    renderedCallback() {
        if (this.init) {
            return;
        }

        Promise.all([
            loadScript(this, ChartJS + '/Chart.min.js'),
            loadStyle(this, ChartJS + '/Chart.min.css'),
            loadStyle(this, GlobalCSS)
        ]).then(() => {
                this.init = true;
                
                if (this.chartConfig) {
                    let newConfig = JSON.parse(JSON.stringify(this.chartConfig));
                    newConfig.options.responsive = true;
                    newConfig.options.maintainAspectRatio = false;
                    this.drawGraph(newConfig);
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    drawGraph(newConfig) {
        window.Chart.platform.disableCSSInjection = true;

        const canvas = document.createElement('canvas');
        this.template.querySelector('div.chart').appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let chart = new window.Chart(ctx, newConfig);
        this.showGraph = true;
    }
}