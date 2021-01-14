/**
 * (C) 2021 - ntop.org
*/

import DonutWidgetFormatter from "./donut";
import PieWidgetFormatter from "./pie";

/**
 * The FormatterMap contains a list of constructor
 * of the available formatters.
 */
export const FormatterMap = {
    pie: PieWidgetFormatter,
    donut: DonutWidgetFormatter
}