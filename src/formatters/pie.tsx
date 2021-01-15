/**
 * (C) 2021 - ntop.org
*/

import { h } from '@stencil/core';
import Chart, { ChartConfiguration } from 'chart.js';
import { Data } from '../types/data';
import { Formatter } from "../types/formatter";
import { WidgetResponsePayload } from '../types/widget-response';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import ColorHash from 'color-hash';

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

        const canvas = shadowRoot.querySelector('canvas');
        canvas.width = this.params.width;
        canvas.height = this.params.height;
        
        const ctx = canvas.getContext('2d');
  
        const {datasets, labels} = this.buildDatasets(fetchedData);
        this._fetchedData = fetchedData;

        const config: ChartConfiguration = this.loadConfig(datasets, labels);
        this.chart = new Chart(ctx, config); 
    }

    private buildDatasets(fetchedData: WidgetResponsePayload[]) {

        const datasets = new Array();
        const labels: Set<string> = new Set();

        const colorHash = new ColorHash({saturation: 0.75});

        for (let { data, datasource } of fetchedData) {

            // insert the found label if not contained in the set
            data.forEach((d: Data) => {
                if (labels.has(d.k)) return;
                labels.add(d.k);
            });
            
            // create the array color using the colorHash function
            const colors = Array.from(labels).map(label => colorHash.hex(label));

            // create a new dataset to add to the pie chart
            const dataset = { data: data.map((d: Data) => d.v), label: datasource.ds_type, backgroundColor: colors };
            datasets.push(dataset);
        }

        return {datasets: datasets, labels: labels};
    }

    public update(_: ShadowRoot, fetchedData: WidgetResponsePayload[]) {

        const {datasets, labels} = this.buildDatasets(fetchedData);
        this._fetchedData = fetchedData;

        this.chart.data.datasets = datasets;
        this.chart.data.labels = Array.from(labels);
        this.chart.update();
    }

    protected loadConfig(datasets: any[], labels: Set<string>): Chart.ChartConfiguration {
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
                aspectRatio: 1,
                layout: {
                    padding: 50
                },
                plugins: {
                    datalabels: {
                        color: 'black',
                        anchor: 'end',
                        align: 'end',
                        formatter: function(value, context) {
                            
                            const values = context.chart.data.datasets[context.datasetIndex].data as number[];
                            const total = values.reduce((prev, curr) => prev + curr);
                            const percentage = ((value / total) * 100).toFixed(2);
                            const label = context.chart.data.labels[context.dataIndex];

                            return `${label} (${percentage}%)`;
                        }
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
                    position: 'bottom',
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
                            const percentage = ((currentValue / total) * 100).toFixed(2);

                            return `${label}: ${percentage}%`;
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
        return <canvas class='pie-chart'></canvas>;
    }
}