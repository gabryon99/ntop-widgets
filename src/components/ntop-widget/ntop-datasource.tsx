import { Component, Prop} from '@stencil/core';
import { DatasourceType } from '../../types/datasource-type';

@Component({
  tag: 'ntop-datasource'
})
export class NtopDatasource {
  @Prop({attribute: 'type', mutable: false}) ds_type!: DatasourceType;
}