
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RequestBase } from './net-base';

@Injectable()
export class GetFriendsService extends RequestBase {

    request(data): Observable<any> {
        return this.post('people', data);
    }
}
