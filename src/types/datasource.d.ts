/**
 * ntop.org - 2021 (C)
*/

import {DatasourceType} from './datasource-type';
import {DatasourceParamaters} from './datasource-params';

export interface Datasource {
    ds_type: DatasourceType;
    params?: DatasourceParamaters;
}
