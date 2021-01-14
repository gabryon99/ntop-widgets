/**
 * (C) 2021 - ntop.org
*/

import {DatasourceType} from './datasource-type';
import {DatasourceParamaters} from './datasource-params';

export interface Datasource {
    ds_type: DatasourceType;
    params?: DatasourceParamaters;
}
