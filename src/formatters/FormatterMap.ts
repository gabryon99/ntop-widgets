/**
 * (C) 2021 - ntop.org
*/

import StackedBarWidgetFormatter from "./charts/StackedBarWidgetFormatter";
import DonutWidgetFormatter from "./charts/DonutWidgetFormatter";
import PieWidgetFormatter from "./charts/PieWidgetFormatter";
import { MixedChartWidgetFormatter } from "./charts/MixedChartWidgetFormatter";

/**
 * The FormatterMap contains a list of constructor
 * of the available formatters.
 */
export const FormatterMap = {
    PIE: PieWidgetFormatter,
    DONUT: DonutWidgetFormatter,
    STACKEDBAR: StackedBarWidgetFormatter,
    MIXED: MixedChartWidgetFormatter
}