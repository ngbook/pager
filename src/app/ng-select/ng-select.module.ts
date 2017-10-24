import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgSelectComponent } from './ng-select.component';
import { NgButtonModule } from '../ng-button';
import { DocClickService } from './document-event.service';

@NgModule({
    declarations: [
        NgSelectComponent,
    ],
    imports: [
        CommonModule,
        NgButtonModule,
    ],
    exports: [
        NgSelectComponent,
    ],
    providers: [
        DocClickService
    ],
})
export class NgSelectModule {
    public static forRoot() {
        return {
            ngModule: NgSelectModule,
            providers: [ DocClickService ]
        };
    }
}

export { NgSelectComponent };
