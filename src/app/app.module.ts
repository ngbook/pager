import { BrowserModule } from '@angular/platform-browser';
import {
    NgModule,
    ErrorHandler
} from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { NgPagerModule } from './ng-pager';
import { NgSelectModule } from './ng-select';
import { NgButtonModule } from './ng-button';
import { GetFriendsService } from './services/friends.service';
import { GlobalErrorHandler } from './services/global-error.event';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        NgSelectModule.forRoot(),
        NgButtonModule,
        NgPagerModule,
    ],
    providers: [
        GetFriendsService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
