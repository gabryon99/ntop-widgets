/**
 * ntop.org - 2021 (C)
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
    // expand the Window interface
    interface Window {
        __NTOPNG_WIDGET_CSRF__: string;
    }
}

@Component({
    tag: 'ntop-widget',
    styleUrl: 'ntop-widget.css',
    shadow: true,
})
export abstract class NtopWidget {

    private NTOPNG_ENDPOINT: string = "/lua/rest/v1/get/widget/data.lua";

    @Prop() transformation!: Transformation;
    @Prop() width: string;
    @Prop() height: string;

    @Element() host: HTMLNtopWidgetElement;
    @State() fetchedData: WidgetDataResponse;

    private selectedFormatter: Formatter;

    componentDidRender() {
        if (this.fetchedData !== undefined) {
            this.selectedFormatter.initChart(this.host.shadowRoot, this.fetchedData.rsp);
        }
    }

    async componentWillLoad() {
        this.selectedFormatter = new FormatterMap[this.transformation](parseInt(this.width), parseInt(this.height)); 
        this.fetchedData = await this.getWidgetData();
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

        const origin: string = "http://localhost:3000";
        const endpoint: URL = new URL(this.NTOPNG_ENDPOINT, origin);

        const request: WidgetRequest = {datasources: this.serializeDatasources(), transformation: this.transformation};
        if (window.__NTOPNG_WIDGET_CSRF__ !== undefined) {
            request.csrf = window.__NTOPNG_WIDGET_CSRF__;
        }

        try {
            const response = await fetch(endpoint.toString(), {method: 'POST', body: JSON.stringify(request), headers: {'Content-Type': 'application/json; charset=utf-8'}});
            return await response.json();
            // return JSON.parse(`{"rc":0,"rsp":[{"datasource":{"ds_type":"interface_packet_distro","params":{"ifid":0}},"data":[{"k":"64 <= 128","v":66638},{"k":"512 <= 1024","v":17690},{"k":"256 <= 512","v":16280}]}],"rc_str":"OK","rc_str_hr":"Success"}`);
        }
        catch (e) {
            console.error(e)
            return {};
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
