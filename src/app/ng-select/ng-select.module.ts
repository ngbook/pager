import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgSelectComponent } from './ng-select.component';
import { NgButtonModule } from '../ng-button';
import { DocEventService } from './document-event.service';

@NgModule({
    declarations: [
        NgSelectComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgButtonModule,
    ],
    exports: [
        NgSelectComponent,
    ],
    providers: [
        DocEventService,
    ],
})
export class NgSelectModule {
    public static forRoot() {
        return {
            ngModule: NgSelectModule,
            providers: [ DocEventService ]
        };
    }
}

export { NgSelectComponent };
