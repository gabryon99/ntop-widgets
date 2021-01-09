/**
 * ntop.org - 2021 (C)
*/
import { h } from '@stencil/core';
import { Data } from "../../types/data";
import { Formatter } from "../../types/formatter";

class TweenUtility {

    static pieTween(d: d3.layout.pie.Arc<Data>, i: number) {
        
        let s0: number = 0;
        let e0: number = 0;
        const oldPieData = [];
        
        if (oldPieData[i]) {
            s0 = oldPieData[i].startAngle;
            e0 = oldPieData[i].endAngle;
        } 
        else if (!(oldPieData[i]) && oldPieData[i - 1]) { 
            s0 = oldPieData[i - 1].endAngle;
            e0 = oldPieData[i - 1].endAngle;
        } 
        else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
            s0 = oldPieData[oldPieData.length - 1].endAngle;
            e0 = oldPieData[oldPieData.length - 1].endAngle;
        } 
 
        const interpolator = d3.interpolate<any, any>({ startAngle: s0, endAngle: e0 }, { startAngle: d.startAngle, endAngle: d.endAngle });
        
        return function (time: number) {

            const angleInterpolated = interpolator(time);
            const arc = d3.svg.arc().startAngle((d) => d.startAngle).endAngle((d) => d.endAngle).innerRadius(45).outerRadius(100);
            return arc(angleInterpolated as d3.svg.arc.Arc);
        };
    }

    static removePieTween(d: d3.layout.pie.Arc<Data>, _: number) {

        let s0: number = 2 * Math.PI;
        let e0: number = 2 * Math.PI;
        let interpolator = d3.interpolate({ startAngle: d.startAngle, endAngle: d.endAngle }, { startAngle: s0, endAngle: e0 });
        
        return function (time: number) {

            const angleInterpolated = interpolator(time);
            const arc = d3.svg.arc().startAngle((d) => d.startAngle).endAngle((d) => d.endAngle).innerRadius(45).outerRadius(100);
            return arc(angleInterpolated as unknown as d3.svg.arc.Arc);
        };
    }

    static textTween(d: d3.layout.pie.Arc<Data>, i: number) {
        
        let start = 0; 
        let end = (d.startAngle + d.endAngle - Math.PI) / 2;  
        const oldPieData = [];

        if (oldPieData[i]) {
            start = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI) / 2; 
        } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
            start = (oldPieData[i - 1].startAngle + oldPieData[i - 1].endAngle - Math.PI) / 2;
        } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
            start = (oldPieData[oldPieData.length - 1].startAngle + oldPieData[oldPieData.length - 1].endAngle - Math.PI) / 2; 
        }

        let interpolator = d3.interpolateNumber(start, end);

        return function (t) {
            const val: number = interpolator(t);
            const x: number = Math.cos(val) * (114);
            const y: number = Math.sin(val) * (114);
            return `translate(${x}, ${y})`;
        };
    }
}

export default class PieWidgetFormatter implements Formatter {

    private TEXT_OFFSET: number = 14;
    private OUTER_RADIUS: number = 100;
    private INNER_RADIUS: number = 45;
    private TWEEN_DURATION: number = 250;

    private width: number;
    private height: number;
 
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    } 

    initChart(shadowRoot: ShadowRoot, fetchedData: Data[]) { 

    console.log(shadowRoot.querySelectorAll(".pie-chart"))

        const $chartContainer: HTMLElement = shadowRoot.querySelector('.pie-chart');
        const pieChart = this.generatePieChart();
        const computedData = pieChart(fetchedData);
        const container = d3.select($chartContainer).append("svg:svg").attr("width", this.width).attr("height", this.height);

        // Arc Group
        const arcGroup = container.append("svg:g").attr("class", "arc").attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);
        // Label Group
        const labelGroup = container.append("svg:g").attr("class", "label-group").attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

        this.generatePaths(arcGroup, computedData);
        this.generateLines(labelGroup, computedData); 
        this.generateValueLabels(labelGroup, computedData);
        this.generateNameLabels(labelGroup, computedData);
    }

    staticRender(): HTMLElement {
        return <div class='pie-chart'></div>
    }

    private generateNameLabels(labelGroup: d3.Selection<any>, fetchedData: d3.layout.pie.Arc<Data>[]) {
         
        const self = this;
        const nameLabels = labelGroup
            .selectAll("text.units")
            .data(fetchedData)
            .attr("dy", function (d) {
                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                    return 17; 
                } else {
                    return 5;
                }
            }) 
            .attr("text-anchor", function (d) { 
                if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
                    return "beginning";
                }
                return "end";
            })
            .text((d) => d.data.k);

        nameLabels
            .enter()
            .append("svg:text")
            .attr("class", "units")
            .attr("transform", function (d) {
                const x: number = Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (self.OUTER_RADIUS + self.TEXT_OFFSET);
                const y: number = Math.sin(((d.startAngle + d.endAngle - Math.PI) / 2)) * (self.OUTER_RADIUS + self.TEXT_OFFSET);
                return `translate(${x}, ${y})`;
            })
            .attr("dy", function (d) {
                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                    return 17;
                } else {
                    return 5;
                }
            }) 
            .attr("text-anchor", function (d) {
                if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
                    return "beginning";
                }
                return "end";
            })
            .text((d) => d.data.k);

        nameLabels.transition().duration(this.TWEEN_DURATION).attrTween("transform", TweenUtility.textTween); 
 
        nameLabels.exit().remove();
    }

    private generatePaths(arcGroup: d3.Selection<any>, fetchedData: d3.layout.pie.Arc<Data>[]) {
        
        const colors = d3.scale.category20();
        const newPaths = arcGroup.selectAll("path").data(fetchedData);
        newPaths
            .enter()
            .append("svg:path")
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", (_, i) => colors(i.toString()))
            .transition()
            .duration(this.TWEEN_DURATION)
            .attrTween("d", TweenUtility.pieTween);
        newPaths
            .transition()
            .duration(this.TWEEN_DURATION)
            .attrTween("d", TweenUtility.pieTween);
        newPaths
            .exit()
            .transition()
            .duration(this.TWEEN_DURATION)
            .attrTween("d", TweenUtility.removePieTween)
            .remove();
    }

    private generateLines(labelGroup: d3.Selection<any>, fetchedData: d3.layout.pie.Arc<Data>[]) {
        
        const lines = labelGroup
            .selectAll("line").data(fetchedData);
        lines
            .enter() 
            .append("svg:line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", -this.OUTER_RADIUS - 3)
            .attr("y2", -this.OUTER_RADIUS - 8)
            .attr("stroke", "gray")
            .attr("transform", function (d) {
                return `rotate(${(d.startAngle + d.endAngle) / 2 * (180 / Math.PI)})`;
            });

        lines
            .transition()
            .duration(this.TWEEN_DURATION)
            .attr("transform", function (d) {
                return `rotate(${(d.startAngle + d.endAngle) / 2 * (180 / Math.PI)})`;
            });

        lines.exit().remove();
    }

    private generateValueLabels(labelGroup, data: d3.layout.pie.Arc<Data>[]) {

        const self: PieWidgetFormatter = this;
        const totalValue: number = data.map(d => d.data.v).reduce((prev, v) => prev + v);

        const valueLabels = labelGroup
            .selectAll("text.value")
            .data(data)
            .attr("dy", function (d) {
                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                    return 5;
                } else {
                    return -7;
                }
            })
            .attr("text-anchor", function (d) {
                if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
                    return "beginning";
                }
                return "end";
            })
            .text(function (d) {
                const percentage = (d.value / totalValue) * 100;
                return percentage.toFixed(1) + "%";
            });

        valueLabels
            .enter()
            .append("svg:text")
            .attr("class", "value")
            .attr("transform", function (d) {
                const x: number = Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (self.OUTER_RADIUS + self.TEXT_OFFSET);
                const y: number = Math.sin(((d.startAngle + d.endAngle - Math.PI) / 2)) * (self.OUTER_RADIUS + self.TEXT_OFFSET);
                return `translate(${x}, ${y})`;
            })
            .attr("dy", function (d) { 
                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                    return 5; 
                } else {
                    return -7;
                }
            })
            .attr("text-anchor", function (d) {
                if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                    return "beginning";
                }
                return "end";
            })
            .text(function (d) {
                const percentage = (d.value / totalValue) * 100;
                return percentage.toFixed(1) + "%";
            });

        valueLabels.transition().duration(this.TWEEN_DURATION).attrTween("transform", TweenUtility.textTween);

        valueLabels.exit().remove();
    }

    private generatePieChart() {
        return d3.layout.pie<Data>().value((d: Data) => d.v);
    }

}