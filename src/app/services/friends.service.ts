import {
    Http, Response,
    Headers, RequestOptions
} from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/empty';

import { RequestBase } from './net-base';

@Injectable()
export class GetFriendsService extends RequestBase {

    request(data): Observable<any> {
        return this.post('people', data);
    }
}
