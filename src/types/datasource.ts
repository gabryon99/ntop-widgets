/**
 * (C) 2021 - ntop.org
*/

import {DatasourceParamaters} from './datasource-params';

export interface Datasource {
    ds_type: string;
    params?: DatasourceParamaters;
}
