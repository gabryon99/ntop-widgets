/**
 * (C) 2021 - ntop.org
*/

import { Component, Host, Element, h, State, Prop, Method } from '@stencil/core';
import { Datasource } from '../../types/datasource';
import { DatasourceParamaters } from '../../types/datasource-params';
import { Formatter } from '../../types/formatter';
import { Transformation } from '../../types/transformation';
import { WidgetDataResponse } from '../../types/widget-response';
import { FormatterMap } from '../../formatters/formatter-map';
import { WidgetRequest } from '../../types/widget-request';

const WIDGETS_UNKNOWN_DATASOURCE_TYPE: number = -51;

declare global {

    // extend the Window interface
    interface Window {
        __NTOPNG_ORIGIN__: string;
    }
}

@Component({
    tag: 'ntop-widget',
    styleUrl: 'ntop-widget.css',
    shadow: true,
})
export abstract class NtopWidget {

    private NTOPNG_ENDPOINT: string = "/lua/rest/v1/get/widget/data.lua";

    @Prop() update: number = 1000;
    @Prop() transformation!: Transformation;
    @Prop() width!: string;
    @Prop() height!: string;

    @Element() host: HTMLNtopWidgetElement;
    @State() fetchedData: WidgetDataResponse;

    /**
     * The selected formatter to style the widget.
     */
    private _selectedFormatter: Formatter;
    /**
     * A flag indicating if a formatter has been initialized by the widget.
     */
    private _formatterInitialized: boolean = false;

    private _intervalId: NodeJS.Timeout;

    componentDidRender() {
        
        if (this.fetchedData !== undefined && !this._formatterInitialized) {

            if (this.fetchedData.rc === WIDGETS_UNKNOWN_DATASOURCE_TYPE) return;

            this._selectedFormatter.init(this.host.shadowRoot, this.fetchedData.rsp);
            this._formatterInitialized = true;
        }
        else if (this.fetchedData !== undefined && this._formatterInitialized) {
            this._selectedFormatter.update(this.host.shadowRoot, this.fetchedData.rsp);
        }
    }

    async componentWillLoad() {
        this._selectedFormatter = new FormatterMap[this.transformation]({width: parseInt(this.width), height: parseInt(this.height)}); 
        await this.updateWidget();
    } 

    private async updateWidget() {

        this.fetchedData = await this.getWidgetData();

        if (this.update >= 0 && this.fetchedData.rc !== WIDGETS_UNKNOWN_DATASOURCE_TYPE) {
            // update the chart
            this._intervalId = setInterval(async () => { this.fetchedData = await this.getWidgetData(); }, this.update);
            return;
        }
        
    }

    @Method()
    public async forceUpdate() {

        // if there is an interval timer then stops it's execution
        if (this._intervalId !== undefined) {
            clearTimeout(this._intervalId);
        }
        // update the widget
        await this.updateWidget();
    }

    /**
     * Serialize the contained <ntop-datasource> into an array of Datasources
     * to be send to the ntopng instance.
     */
    private serializeDatasources() {

        const src: Array<Datasource> = new Array();
        const datasources = this.host.querySelectorAll('ntop-datasource');
        datasources.forEach(datasource => {
             
            const params: DatasourceParamaters = {};
            for (let i = 0; i < datasource.attributes.length; i++) {
                
                const attribute = datasource.attributes.item(i);
                if (attribute.name.startsWith("params-")) {
                    const name = attribute.name.replace("params-", "");
                    params[name] = attribute.nodeValue.toString();
                }
            }

            src.push({ds_type: datasource.ds_type, params: params});
        });

        return src;
    }

    private async getWidgetData() {

        // use global origin or current origin
        const origin: string = window.__NTOPNG_ORIGIN__ || location.origin;
        const endpoint: URL = new URL(this.NTOPNG_ENDPOINT, origin);

        const request: WidgetRequest = {datasources: this.serializeDatasources(), transformation: this.transformation};

        try {
            const response = await fetch(endpoint.toString(), {method: 'POST', body: JSON.stringify(request), headers: {'Content-Type': 'application/json; charset=utf-8'}});
            return await response.json();
        }
        catch (e) {
            console.error(e);
            return undefined;
        }
    }

    /**
     * Render a loading screen for the widget when is fetching the data.
     */
    private renderLoading() {  
        return <div class='loading shine'></div>
    } 

    private renderErrorScreen() {
        return <div class='error'>Error: unknown datasource type!</div>
    }

    render() {

        const myStyle = {width: this.width, height: this.height};
        const view = (this.fetchedData === undefined) ? 
            this.renderLoading() : (this.fetchedData.rc === WIDGETS_UNKNOWN_DATASOURCE_TYPE) ? 
                this.renderErrorScreen() : this._selectedFormatter.staticRender();

        return (
            <Host>
                <slot></slot>
                <div class='ntop-widget-container bg-white' style={myStyle}> 
                    {view}
                </div>
            </Host>
        );
    }

}
