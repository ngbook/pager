import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgPagerComponent } from './ng-pager.component';
import { NgSelectModule } from '../ng-select';
import { NgButtonModule } from '../ng-button';

@NgModule({
    declarations: [
        NgPagerComponent
    ],
    imports: [
        CommonModule,
        NgButtonModule,
        NgSelectModule,
    ],
    exports: [
        NgPagerComponent,
    ],
})
export class NgPagerModule {
}
