/**
 * (C) 2021 - ntop.org
*/

import { DisplayFormatter } from "../types/DisplayFormatter";
import { VERSION } from "../version";

export const COLOR_PALETTE = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"];

export function formatInt(val: number): string {    
    if (val === undefined) return '-';
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function log(message: string) { 
    console.info(`[%cntop-widgets v.${VERSION}%c] :: ${message}`, 'color: #4989ff; font-weight: 800', 'color: white');
}

export function formatLabel(displayFormatter: DisplayFormatter, currentValue: number, total: number) {
    switch (displayFormatter) {
        case DisplayFormatter.NONE:
            return "";
        case DisplayFormatter.PERCENTAGE:
            return ': ' + ((currentValue / total) * 100).toFixed(2) + '%';
        case DisplayFormatter.RAW:
            return ': ' + currentValue;
    }
}