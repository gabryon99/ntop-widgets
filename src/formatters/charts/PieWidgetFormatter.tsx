/**
 * (C) 2021 - ntop.org
*/

import { h } from '@stencil/core';
import Chart, { ChartConfiguration } from 'chart.js';
import { Formatter } from "../../types/Formatter";
import { WidgetResponsePayload } from '../../types/WidgetRestResponse';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DisplayFormatter } from "../../types/DisplayFormatter";
import { NtopWidget } from '../../components/ntop-widget/ntop-widget';
import { COLOR_PALETTE } from '../../utils/utils';

/**
 * Define a new chart formatter for Pie Charts.
 * See: https://www.chartjs.org/docs/latest/charts/doughnut.html
 */
export default class PieWidgetFormatter implements Formatter {

    private _chart: Chart;
    private _parentWidget: NtopWidget;
    private _shadowRoot: ShadowRoot;

    constructor(widget: NtopWidget) {
        this._parentWidget = widget;
    } 

    public init(shadowRoot: ShadowRoot) { 

        this._shadowRoot = shadowRoot;

        const canvas: HTMLCanvasElement = shadowRoot.getElementById('chart') as HTMLCanvasElement;    
        const ctx = canvas.getContext('2d');
        
        const pieContainer: HTMLDivElement = shadowRoot.querySelector('.pie-container');
        pieContainer.style.width = this._parentWidget.width;
        pieContainer.style.height = this._parentWidget.height;
  
        const {datasets, labels} = this.buildDatasets();

        const config: ChartConfiguration = this.loadConfig(datasets, labels);
        this._chart = new Chart(ctx, config); 

        // create the legend container along with the legend 
        const legendContainer = shadowRoot.querySelector(".legend");
        legendContainer.innerHTML = this._chart.generateLegend() as string;
    }

    private buildDatasets() {

        const restResponse = this._parentWidget._fetchedData.rsp;
        const firstDatasource = restResponse[0];

        const labels = firstDatasource.data.keys;
        const datasets = [{
            data: firstDatasource.data.values,
            label: firstDatasource.data.label,
            backgroundColor: COLOR_PALETTE
        }];

        return {datasets: datasets, labels: labels};
    }

    public update() {

        if (this._chart === undefined) {
            throw new Error("The chart has not been initialized!");
        }

        const {datasets, labels} = this.buildDatasets();

        this._chart.data.datasets = datasets;
        this._chart.data.labels = labels;

        const legendContainer = this._shadowRoot.querySelector('.legend');
        legendContainer.innerHTML = this._chart.generateLegend() as string;

        this._chart.update({duration: 0, easing: 'easeInOutCubic'});
    }

    protected loadConfig(datasets: any[], labels: string[]): Chart.ChartConfiguration {
        const self = this;
        return {
            type: 'pie',
            plugins: [ChartDataLabels],
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                responsive: true,
                animation: {
                    animateScale: true,
                    animateRotate: false
                },
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

                    const activePoint = self._chart.getElementAtEvent(event) as any[];
                    if (activePoint[0] !== undefined) {
                        
                        //const data: Data = self._fetchedData[activePoint[0]._datasetIndex].data[activePoint[0]._index];
                        //if (data.url !== undefined) {
                        //    location.href = data.url;
                        //}
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

                        switch (self._parentWidget.displayFormatter) {
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

                            switch (self._parentWidget.displayFormatter) {
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

    public get chart() { return this._chart; }

    public staticRender() {
        return [<div class='legend'></div>, <div class='pie-container'><canvas id='chart'></canvas></div>];
    }
}