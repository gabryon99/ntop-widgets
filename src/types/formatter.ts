/**
 * (C) 2021 - ntop.org
*/
export interface Formatter { 
    /**
     * Return the JSX formatted.
     */
    staticRender: () => HTMLElement; 
    /**
     * Initialize the formatter with the data provided.
     */
    init: (shadowRoot: ShadowRoot, data: any) => void;
    /**
     * Update the formatter with the data provided.
     */
    update: (shadowRoot: ShadowRoot, data: any) => void;
}
