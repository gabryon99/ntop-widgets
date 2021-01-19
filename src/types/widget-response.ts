/**
 * (C) 2021 - ntop.org
*/

import { Data } from "./data";
import { Datasource } from "./datasource";

interface NtopngRestV1Response {
    /* The payload contained inside the REST response */
    rsp: Object | Array<Object>;
    /* A short description about the status of the REST request */
    rc_str_hr: string;
    /* A human-readable name for the response code */
    rc_str: string;
    /* Return Code of the REST response */
    rc: number;
}

/**
 * The payload contained inside the REST response
 */
export interface WidgetResponsePayload {
    /**
     * An array of data fetched from the request datasource
     */
    data: Data[];
    /**
     * The datasource associated to the `data`
     */
    datasource: Datasource;
}

export interface WidgetDataResponse extends NtopngRestV1Response {
    rsp: WidgetResponsePayload[];
}