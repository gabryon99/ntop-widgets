/**
* (C) 2021 - ntop.org
*/

import Chart from "chart.js";

import { h } from "@stencil/core";
import { ChartConfiguration } from "chart.js";
import { NtopWidget } from "../../components/ntop-widget/ntop-widget";
import { DisplayFormatter } from "../../types/DisplayFormatter";
import { Formatter } from "../../types/Formatter";
import { COLOR_PALETTE, formatInt } from "../../utils/utils";
import { Datasource } from "../../types/Datasource";
import { WidgetRestResponse } from "../../types/WidgetRestResponse";

/**
* Define a new chart formatter for Bar Charts.
* See: https://www.chartjs.org/docs/latest/charts/bar.html
*/
export default class StackedBarWidgetFormatter implements Formatter {

    private _parentWidget: NtopWidget;
    private _chart: Chart;
    private _shadowRoot: ShadowRoot;

    constructor(widget: NtopWidget) {
        this._parentWidget = widget;
    } 
    
    init(shadowRoot: ShadowRoot) {
        
        this._shadowRoot = shadowRoot;

        const barContainer: HTMLDivElement = shadowRoot.querySelector('.bar-container');
        barContainer.style.width = this._parentWidget.width;
        barContainer.style.height = this._parentWidget.height;

        const canvas: HTMLCanvasElement = shadowRoot.getElementById('chart') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        const {datasets, labels} = this.buildDatasets();
        const config: ChartConfiguration = this.loadConfig(datasets, labels);

        this._chart = new Chart(ctx, config); 
    }

    private buildDatasets() {
        
        const datasources = this._parentWidget._fetchedData.rsp;
        const firstDatasource = datasources[0];

        let index = 0;

        const datasets = datasources.map(payload => {
            const total = payload.data.values.reduce((prev, curr) => prev + curr);
            return {label: payload.data.label, backgroundColor: COLOR_PALETTE[index++], data: payload.data.values.map(value => {
                if (this._parentWidget.displayFormatter === DisplayFormatter.PERCENTAGE) {
                    return (value / total) * 100;
                }
                return value;
            })}
        });

        return {datasets: datasets, labels: firstDatasource.data.keys};
    }

    update() {
        
        if (this._chart === undefined) {
            throw new Error("The chart has not been initialized!");
        }

        const {datasets, labels} = this.buildDatasets();

        this._chart.data.datasets = datasets;
        this._chart.data.labels = labels;

        this._chart.update({duration: 0, easing: 'easeInOutCubic'});
    }

    protected loadConfig(datasets: Array<any>, labels: Array<string>): ChartConfiguration {

        const self = this;
        const formattedDatasets = this.formatDataByDisplay(datasets);

        return {
            type: 'bar',
            data: {
                datasets: formattedDatasets,
                labels: labels
            },
            options: {
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom'
                },
                tooltips: {
                    displayColors: true,
                    callbacks: {
                        label: function(tooltip, data) {
                            
                            let suffix: string;
                            const label = data.datasets[tooltip.datasetIndex].label || '';
                            const value = parseInt(tooltip.value);
                            
                            if (value !== NaN) {
                                if (self._parentWidget.displayFormatter === DisplayFormatter.PERCENTAGE) {
                                    suffix = `: (${parseFloat(tooltip.value).toFixed(2)}%)`;
                                }
                                else {
                                    suffix = `: (${formatInt(value)})`;
                                }
                            }

                            return `${label}${suffix}`;
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {display: false,}, stacked: true
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            callback: function(value) {
                                
                                let tick: string;

                                if (self._parentWidget.displayFormatter === DisplayFormatter.PERCENTAGE) {
                                    tick = `${value}%`;
                                }
                                else {
                                    tick = formatInt(value as number);
                                }

                                return tick;
                            }
                        }
                    }]
                }
            }
        }
    }

    staticRender() {
        return [<div class='bar-container'><canvas id='chart'></canvas></div>]
    }

    private formatDataByDisplay(datasets: Array<any>): Array<any> {

        for (let dataset of datasets) {

            const total = dataset.data.reduce((prev, curr) => prev + curr);
            switch (this._parentWidget.displayFormatter) {
                case DisplayFormatter.NONE:
                case DisplayFormatter.RAW: {
                    break;
                }
                case DisplayFormatter.PERCENTAGE: {
                    dataset.data = dataset.data.map(value => ((100 * value) / total));
                    break;
                }
            }

        }

        return datasets;
    }

}
