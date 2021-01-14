/**
 * ntop.org - 2021 (C)
*/

import { h } from '@stencil/core';
import Chart, { ChartConfiguration } from 'chart.js';
import { Data } from '../types/data';
import { Formatter } from "../types/formatter";
import { WidgetResponsePayload } from '../types/widget-response';

import {Paired12} from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer.js';

/**
 * Define a new chart formatter for Pie Charts.
 * See: https://www.chartjs.org/docs/latest/charts/doughnut.html
 */
export default class PieWidgetFormatter implements Formatter {

    private chart: Chart;

    constructor(_: any) {
    } 

    initChart(shadowRoot: ShadowRoot, fetchedData: WidgetResponsePayload[]) { 

        const canvas = shadowRoot.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const datasets = new Array();
        const labels: Set<string> = new Set();

        for (const {data, datasource} of fetchedData) {
            
            console.log(data);

            // create a new dataset to add to the pie chart
            const dataset = {data: data.map((d: Data) => d.v), label: datasource.ds_type, backgroundColor: Paired12};
            
            // insert the found label if not contained in the set
            data.forEach((d: Data) => {
                if (!labels.has(d.k)) {
                    labels.add(d.k);
                }
            });

            datasets.push(dataset);
        }

        const config: ChartConfiguration = this.loadConfig(datasets, labels, fetchedData);
        this.chart = new Chart(ctx, config); 
    }

    protected loadConfig(datasets: any[], labels: Set<string>, fetchedData: WidgetResponsePayload[]): Chart.ChartConfiguration {
        return {
            type: 'pie',
            data: {
                datasets: datasets,
                labels: Array.from(labels)
            },
            options: {
                responsive: true,
                legend: {
                    display: false,
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltip, data) {

                            const dataset = data.datasets[tooltip.datasetIndex];
                            const values: number[] = dataset.data as number[];
                            const total: number = values.reduce((previousValue: number, currentValue: number) => {
                                return previousValue + currentValue;
                            }, 0);

                            const label: string = data.labels[tooltip.index] as string;
                            const currentValue: number = dataset.data[tooltip.index] as number;
                            const percentage = ((currentValue / total) * 100).toFixed(2);

                            return `${label}: ${percentage}% (${currentValue})`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: fetchedData[0].datasource.ds_type,
                    position: 'left'
                }
            }
        };
    }

    getChart() {
        return this.chart;
    }

    staticRender(): HTMLElement {
        return <canvas class='pie-chart'></canvas>;
    }
}