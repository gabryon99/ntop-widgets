/**
 * ntop.org - 2021 (C)
*/

import {Transformation} from './transformation';
import {Datasource} from './datasource';

export interface WidgetRequest {
    /**
     * The transformation to apply to the data fetched from the datasources
     */
    transformation: Transformation;
    /**
     * The datasources requested
     */
    datasources: Datasource[];
    /**
     * The csrf to use to make the request.
     */
    csrf?: string;
}
