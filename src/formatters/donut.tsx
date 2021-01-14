/**
 * ntop.org - 2021 (C)
*/

import Chart from 'chart.js';
import { WidgetResponsePayload } from '../types/widget-response';

import PieWidgetFormatter from './pie';

/**
 * Define a new chart formatter for Donut Charts.
 * See: https://www.chartjs.org/docs/latest/charts/doughnut.html
 */
export default class DonutWidgetFormatter extends PieWidgetFormatter {

    /* Override the chart type. The pie and donut chart are the same. */
    protected loadConfig(datasets: any[], labels: Set<string>, fetchedData: WidgetResponsePayload[]): Chart.ChartConfiguration {
        const config = super.loadConfig(datasets, labels, fetchedData);
        config.type = 'doughnut';
        return config;
    }
}