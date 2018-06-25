import { Injectable, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';

@Injectable()
export class DocEventService {
    private docClickObserver: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) private document: any) {
        this.docClickObserver = Observable
            .fromEvent<MouseEvent>(document, 'click')
            .debounceTime<MouseEvent>(200); // 延迟200毫秒，多次点击只触发一次
    }

    get winSize() {
        return this.initWinSize();
    }

    public listen(callback) {
        if (callback) {
            return this.docClickObserver.subscribe((event) => {
                callback(event);
            });
        }
        return null;
    }

    private initWinSize() {
        if (!!window) {
            return {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        } else {
            return null;
        }
    }
}
