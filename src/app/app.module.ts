import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgPagerModule } from './ng-pager';
import { NgSelectModule } from './ng-select';
import { NgButtonModule } from './ng-button';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        NgSelectModule.forRoot(),
        NgButtonModule,
        NgPagerModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
