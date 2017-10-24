import { Injectable, HostListener } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/interval';

@Injectable()
export class DocClickService {
    docClickObserver: Observable<MouseEvent>;

    constructor() {
        this.docClickObserver = Observable
            .fromEvent<MouseEvent>(document, 'click')
            .debounceTime<MouseEvent>(200); // 延迟200毫秒，多次点击只触发一次
    }

    listen(callback) {
        if (callback) {
            return this.docClickObserver.subscribe((event) => {
                callback(event);
            });
        }
        return null;
    }
}
