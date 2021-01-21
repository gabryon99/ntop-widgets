/**
 * (C) 2021 - ntop.org
*/

import { h } from '@stencil/core';
import Chart, { ChartConfiguration } from 'chart.js';
import { NtopWidget } from '../../components/ntop-widget/ntop-widget';
import { DisplayFormatter } from '../../types/DisplayFormatter';
import { Formatter } from '../../types/Formatter';
import { COLOR_PALETTE, formatInt } from '../../utils/utils';

export class MixedChartWidgetFormatter implements Formatter {

    private _chart: Chart;
    private _parentWidget: NtopWidget;
    private _shadowRoot: ShadowRoot;

    constructor(widget: NtopWidget) {
        this._parentWidget = widget;
    } 

    init(shadowRoot: ShadowRoot) {
        
        const mixedChartContainer: HTMLDivElement = shadowRoot.querySelector('.mixed-chart');
        mixedChartContainer.style.width = this._parentWidget.width;
        mixedChartContainer.style.height = this._parentWidget.height;

        const canvas: HTMLCanvasElement = shadowRoot.getElementById('chart') as HTMLCanvasElement;    
        const ctx = canvas.getContext('2d');

        const {datasets, labels} = this.buildDatasets();

        const config: ChartConfiguration = this.loadConfig(datasets, labels);
        this._chart = new Chart(ctx, config);
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

    staticRender() {
        return [<div class='mixed-chart'><canvas id='chart'></canvas></div>];
    }

    private buildDatasets() {

        const datasources = this._parentWidget._fetchedData.rsp;
        const firstDatasource = datasources[0];

        let index = 0;

        const datasets = datasources.map(payload => {

            const i = index++;
            const total = payload.data.values.reduce((prev, curr) => prev + curr);
            const ntopDatasource = this._parentWidget._containedDatasources[i];
            const style = ntopDatasource.styles as any;

            const dataset: any = {
                label: payload.data.label, 
                type: ntopDatasource.type, 
                data: payload.data.values.map(value => {
                    if (this._parentWidget.displayFormatter === DisplayFormatter.PERCENTAGE) {
                        return (value / total) * 100;
                    }
                    return value;
                }),
            }

            if (style.fill !== undefined && !style.fill) {
                dataset.borderColor = COLOR_PALETTE[i];
            }
            else {
                dataset.backgroundColor = COLOR_PALETTE[i]; 
            }

            return Object.assign(ntopDatasource.styles, dataset);
        });

        return {datasets: datasets, labels: firstDatasource.data.keys};
    }

    private loadConfig(datasets: any[], labels: string[]): ChartConfiguration {
        const self = this;
        return {
            type: 'line',
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                title: {
                    display: false,
                },
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
                    yAxes: [{
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

}