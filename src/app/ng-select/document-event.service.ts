import { Injectable, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/interval';

@Injectable()
export class DocEventService {
    public _winSize: {width: number, height: number};
    private docClickObserver: Observable<MouseEvent>;

    constructor(@Inject(DOCUMENT) private document: any) {
        this.docClickObserver = Observable
            .fromEvent<MouseEvent>(document, 'click')
            .debounceTime<MouseEvent>(200); // 延迟200毫秒，多次点击只触发一次
    }

    get winSize() {
        if (!this._winSize) {
            // 初始化window宽高
            this.initWinSize();
        }
        return this._winSize;
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
            this._winSize = {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        }
    }
}
