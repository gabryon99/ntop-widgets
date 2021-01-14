/**
 * ntop.org - 2021 (C)
*/
export interface Formatter { 
    /**
     * Return the JSX formatted.
     */
    staticRender: () => HTMLElement; 
    /**
     * Initialize the chart with the data provided.
     */
    initChart: (shadowRoot: ShadowRoot, data: any) => void;
}
