import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgButtonComponent } from './ng-button.component';

@NgModule({
    declarations: [
        NgButtonComponent,
    ],
    imports: [
        CommonModule,
    ],
    exports: [
        NgButtonComponent,
    ],
    providers: [ ],
})
export class NgButtonModule { }
