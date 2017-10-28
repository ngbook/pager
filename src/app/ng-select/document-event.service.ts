import { Injectable, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/interval';

@Injectable()
export class DocClickService {
    docClickObserver: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) document: any) {
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
