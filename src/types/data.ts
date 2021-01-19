/**
 * (C) 2021 - ntop.org
*/

/**
 * Define a tuple containing a key (k), a value (v) and an
 * URL for the resource.
 */
export interface Data {
    k: string;
    v: number;
    url?: string;
}