import { BrowserModule } from '@angular/platform-browser';
import {
    NgModule,
    ErrorHandler
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
        HttpClientModule,
        FormsModule,
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
