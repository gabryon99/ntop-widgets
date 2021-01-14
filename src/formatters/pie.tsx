/**
 * ntop.org - 2021 (C)
*/

import { h } from '@stencil/core';
import Chart, { ChartConfiguration } from 'chart.js';
import { Data } from '../types/data';
import { Formatter } from "../types/formatter";
import { WidgetResponsePayload } from '../types/widget-response';

/**
 * Define a new chart formatter for Pie Charts.
 * See: https://www.chartjs.org/docs/latest/charts/doughnut.html
 */
export default class PieWidgetFormatter implements Formatter {

    private chart: Chart;

    constructor(_: number, __: number) {
    } 

    initChart(shadowRoot: ShadowRoot, fetchedData: WidgetResponsePayload[]) { 

        const canvas = shadowRoot.querySelector('canvas');
        console.log(shadowRoot);
        const chartColors = {"red":"rgb(255, 99, 132)","orange":"rgb(255, 159, 64)","yellow":"rgb(255, 205, 86)","green":"rgb(75, 192, 192)","blue":"rgb(54, 162, 235)","purple":"rgb(153, 102, 255)","grey":"rgb(201, 203, 207)"}
        const ctx = canvas.getContext('2d');
        const datasets = new Array();
        const labels: Set<string> = new Set();

        for (const {data, datasource} of fetchedData) {

            const colors = [
                chartColors.red,
                chartColors.orange,
                chartColors.yellow,
                chartColors.green,
                chartColors.blue,
            ];
            
            // create a new dataset to add to the pie chart
            const dataset = {data: data.map((d: Data) => d.v), backgroundColor: colors, label: datasource.ds_type};
            
            // insert the found label if not contained in the set
            data.forEach((d: Data) => {
                if (!labels.has(d.k)) {
                    labels.add(d.k);
                }
            });

            datasets.push(dataset);
        }

        const config: ChartConfiguration = {
            type: 'pie',
            data: {
                datasets: datasets,
				labels: Array.from(labels)
            },
            options: {
                responsive: true,
                tooltips: {
                    callbacks: {
                        label: function(tooltip, data) {
                            
                            const dataset = data.datasets[tooltip.datasetIndex];
                            const values: number[] = dataset.data as number[];
                            const total: number = values.reduce((previousValue: number, currentValue: number) => {
                                return previousValue + currentValue;
                            }, 0);
              
                            const currentValue: number = dataset.data[tooltip.index] as number;
                            const percentage = ((currentValue / total) * 100).toFixed(2);
              
                            return `${percentage}%`;
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

        this.chart = new Chart(ctx, config); 
    }

    getChart() {
        return this.chart;
    }

    staticRender(): HTMLElement {
        return <canvas class='pie-chart'></canvas>;
    }
}