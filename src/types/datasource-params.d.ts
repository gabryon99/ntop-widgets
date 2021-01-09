/**
 * ntop.org - 2021 (C)
*/

/**
 * Interface used as base for paramaters to send to the datasources
 */
export interface DatasourceParamaters {}

/**
 * Simple interface containing an interface ID
 */
export interface InterfaceParamater extends DatasourceParamaters {
    ifid: number;
}
