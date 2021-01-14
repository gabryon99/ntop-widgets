/**
 * ntop.org - 2021 (C)
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