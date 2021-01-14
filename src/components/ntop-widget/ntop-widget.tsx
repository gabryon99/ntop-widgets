/**
 * (C) 2021 - ntop.org
*/

import { Component, Host, Element, h, State, Prop } from '@stencil/core';
import { Datasource } from '../../types/datasource';
import { DatasourceParamaters } from '../../types/datasource-params';
import { Formatter } from '../../types/formatter';
import { Transformation } from '../../types/transformation';
import { WidgetDataResponse } from '../../types/widget-response';
import { FormatterMap } from '../../formatters/formatter-map';
import { WidgetRequest } from '../../types/widget-request';

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
    @Prop() width: string;
    @Prop() height: string;

    @Element() host: HTMLNtopWidgetElement;
    @State() fetchedData: WidgetDataResponse;

    /**
     * The selected formatter to style the widget.
     */
    private selectedFormatter: Formatter;
    /**
     * A flag indicating if a formatter has been initialized by the widget.
     */
    private formatterInitialized: boolean = false;

    componentDidRender() {
        
        if (this.fetchedData !== undefined && !this.formatterInitialized) {
            this.selectedFormatter.init(this.host.shadowRoot, this.fetchedData.rsp);
            this.formatterInitialized = true;
        }

        if (this.fetchedData !== undefined && this.formatterInitialized) {
            this.selectedFormatter.update(this.host.shadowRoot, this.fetchedData.rsp);
        }
    }

    async componentWillLoad() {

        this.selectedFormatter = new FormatterMap[this.transformation]({width: parseInt(this.width), height: parseInt(this.height)}); 
        this.fetchedData = await this.getWidgetData();
        
        if (this.update >= 0) {
            // update the chart
            setInterval(async () => {
                this.fetchedData = await this.getWidgetData();
            }, this.update);
        }
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

    async getWidgetData() {

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
    renderLoading() {  
        return <div class='loading shine'></div>
    } 

    render() {

        const myStyle = {width: this.width, height: this.height};

        return (
            <Host>
                <slot></slot>
                <div class='ntop-widget-container bg-white' style={myStyle}> 
                    {this.fetchedData === undefined ? this.renderLoading() : this.selectedFormatter.staticRender()}
                </div>
            </Host>
        );
    }

}
