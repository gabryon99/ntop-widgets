/**
 * (C) 2021 - ntop.org
*/

import { h } from '@stencil/core';
import Chart, { ChartConfiguration } from 'chart.js';
import { Data } from '../types/data';
import { Formatter } from "../types/formatter";
import { WidgetResponsePayload } from '../types/widget-response';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DisplayFormatter } from "../types/display-formatter";

/**
 * Define a new chart formatter for Pie Charts.
 * See: https://www.chartjs.org/docs/latest/charts/doughnut.html
 */
export default class PieWidgetFormatter implements Formatter {

    private chart: Chart;
    private _fetchedData: WidgetResponsePayload[];

    private params: any;

    constructor(params: any) {
        this.params = params;
    } 

    public init(shadowRoot: ShadowRoot, fetchedData: WidgetResponsePayload[]) { 

        const widgetContainer = shadowRoot.querySelector('.ntop-widget-container');
        
        const pieContainer: HTMLDivElement = shadowRoot.querySelector('.pie-container');
        pieContainer.style.width = this.params.width;
        pieContainer.style.height = this.params.height;

        const canvas = document.createElement('canvas');    
        // insert pie canvas inside the pie-container
        pieContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');
  
        const {datasets, labels} = this.buildDatasets(fetchedData);
        this._fetchedData = fetchedData;

        const config: ChartConfiguration = this.loadConfig(datasets, labels);
        this.chart = new Chart(ctx, config); 

        // create the legend container along with the legend 
        const legendContainer = document.createElement("div");
        legendContainer.classList.add('legend');
        legendContainer.innerHTML = this.chart.generateLegend() as string;

        // add the container inside the shadow root
        widgetContainer.appendChild(legendContainer);
        widgetContainer.appendChild(pieContainer);
    }

    private buildDatasets(fetchedData: WidgetResponsePayload[]) {

        let labels: string[] = [];
        const datasets = new Array();

        for (let { data, datasource } of fetchedData) {

            // create the array color using the colorHash function
            labels = data.map(d => d.k);
            const bgColors = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"];

            // create a new dataset to add to the pie chart
            const dataset = { data: data.map((d: Data) => d.v), label: datasource.ds_type, backgroundColor: bgColors };
            datasets.push(dataset);
        }

        return {datasets: datasets, labels: labels};
    }

    public update(shadowRoot: ShadowRoot, fetchedData: WidgetResponsePayload[]) {

        const {datasets, labels} = this.buildDatasets(fetchedData);
        this._fetchedData = fetchedData;

        this.chart.data.datasets = datasets;
        this.chart.data.labels = labels;

        const legendContainer = shadowRoot.querySelector('.legend');
        legendContainer.innerHTML = this.chart.generateLegend() as string;
        shadowRoot.querySelector('div.ntop-widget-container').prepend(legendContainer);

        this.chart.update({
            duration: 0,
            easing: 'easeInOutCubic'
        });
    }

    protected loadConfig(datasets: any[], labels: string[]): Chart.ChartConfiguration {
        const self = this;
        return {
            type: 'pie',
            plugins: [ChartDataLabels],
            data: {
                datasets: datasets,
                labels: Array.from(labels)
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 16,
                        bottom: 16
                    }
                },
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                onClick: function(event) {

                    const activePoint = self.chart.getElementAtEvent(event) as any[];
                    if (activePoint[0] !== undefined) {
                        
                        const data: Data = self._fetchedData[activePoint[0]._datasetIndex].data[activePoint[0]._index];
                        if (data.url !== undefined) {
                            location.href = data.url;
                        }
                    }

                },
                legend: {
                    display: false,
                },
                legendCallback: function(chart) { 

                    let MAX_LABELS = 5;
                    const colors = chart.config.data.datasets[0].backgroundColor;
                    const labels = chart.config.data.labels;
                    const values = chart.data.datasets[0].data as number[];
                    const total = values.reduce((prev, curr) => prev + curr);

                    const text = new Array<string>(); 

                    if (labels.length < MAX_LABELS) {
                        MAX_LABELS = labels.length;
                    }

                    text.push('<ul class="pie-legend">'); 

                    for (let i = 0; i < MAX_LABELS; i++) { 

                        let value;

                        switch (self.params.displayFormatter) {
                            case DisplayFormatter.NONE:
                                value = "";
                                break;
                            case DisplayFormatter.PERCENTAGE:
                                value = ` (<b>${((values[i] / total) * 100).toFixed(2)}%</b>)`;
                                break;
                            case DisplayFormatter.RAW:
                                value = ` (<b>${values[i]}</b>)`;
                                break
                        }

                        text.push('<li>');
                        text.push(`<span class='circle' style='background-color: ${colors[i]}'></span> ${labels[i]}${value}`)
                        text.push('</li>'); 
                    } 
                    text.push('</ul>');

                    return text.join(''); 
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltip, data) {

                            const dataset = data.datasets[tooltip.datasetIndex];
                            const values: number[] = dataset.data as number[];
                            const total: number = values.reduce((previousValue: number, currentValue: number) => {
                                return previousValue + currentValue;
                            });

                            const label: string = data.labels[tooltip.index] as string;
                            const currentValue: number = dataset.data[tooltip.index] as number;

                            let value;

                            switch (self.params.displayFormatter) {
                                case DisplayFormatter.NONE:
                                    value = "";
                                    break;
                                case DisplayFormatter.PERCENTAGE:
                                    value = ': ' + ((currentValue / total) * 100).toFixed(2) + '%';
                                    break;
                                case DisplayFormatter.RAW:
                                    value = ': ' + currentValue;
                                    break
                            }

                            return `${label}${value}`;
                        }
                    }
                },
                title: {
                    display: false,
                }
            }
        };
    }

    public getChart() {
        return this.chart;
    }

    public staticRender(): HTMLElement {
        return (<div class='pie-container'></div>);
    }
}