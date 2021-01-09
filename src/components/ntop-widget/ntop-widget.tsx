/**
 * ntop.org - 2021 (C)
*/
import { Component, Host, Element, h, State, Prop, Watch } from '@stencil/core';
import { Datasource } from '../../types/datasource';
import { DatasourceParamaters } from '../../types/datasource-params';
import { Formatter } from '../../types/formatter';
import { Transformation } from '../../types/transformation';
import { WidgetDataResponse } from '../../types/widget-response';
import PieWidgetFormatter from '../formatters/pie';

const formattersMap = {};
formattersMap["pie"] = PieWidgetFormatter;

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
    @State() datasources: NodeListOf<HTMLNtopDatasourceElement>;

    @State() fetchedData: WidgetDataResponse;

    private selectedFormatter: Formatter;

    componentDidRender() {
        if (this.fetchedData !== undefined) {
            this.selectedFormatter.initChart(this.host.shadowRoot, this.fetchedData.rsp[0].data);
        }
    }

    async componentWillLoad() {

        const self = this; 

        this.selectedFormatter = new formattersMap[this.transformation](parseInt(this.width), parseInt(this.height)); 
        this.datasources = this.host.querySelectorAll('ntop-datasource');

        setTimeout(async () => {
            self.fetchedData = await self.getWidgetData();
        }, 1000)
    } 

    serializeDatasources() {

        const src: Array<Datasource> = new Array();
        this.datasources.forEach(datasource => {
             
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

        // const origin: string = "http://localhost:3000";
        // const endpoint: URL = new URL(this.NTOPNG_ENDPOINT, origin);

        // const request: WidgetRequest = {datasources: this.serializeDatasources(), transformation: Transformation[this.formatter.toUpperCase()]};
        try {
            // const response = await fetch(endpoint.toString(), {method: 'POST', body: JSON.stringify(request), mode: 'no-cors'})
            // return await response.json();
            return JSON.parse(`{"rc":0,"rsp":[{"datasource":{"ds_type":"interface_packet_distro","params":{"ifid":0}},"data":[{"k":"64 <= 128","v":66638},{"k":"512 <= 1024","v":17690},{"k":"256 <= 512","v":16280}]}],"rc_str":"OK","rc_str_hr":"Success"}`);
        }
        catch (e) {
            console.error(e)
            return {};
        }
    }

    renderLoading() {  
        return <div class='loading shine'></div>
    } 

    render() {

        const myStyle = {width: this.width, height: this.height}
        return (
            <Host>
                <div class='ntop-widget-container bg-white' style={myStyle}> 
                    {this.fetchedData === undefined ? this.renderLoading() : this.selectedFormatter.staticRender()}
                </div>
            </Host>
        );
    }

}
