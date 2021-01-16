import { Component, Prop} from '@stencil/core';

@Component({
  tag: 'ntop-datasource'
})
export class NtopDatasource {
  @Prop({attribute: 'type', mutable: false}) ds_type!: string;
}