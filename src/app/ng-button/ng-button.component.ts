import { Component, OnInit, Input } from '@angular/core';

interface StyleType {
    [key: string]: number | string;
}

@Component({
    selector: 'ng-button',
    templateUrl: './ng-button.component.html',
    styleUrls: ['./ng-button.component.scss'],
    // encapsulation: ViewEncapsulation.None
})
export class NgButtonComponent implements OnInit {
    @Input()
    set styles(data: StyleType) {
        if (!data) {
            return;
        }
        this._styles = { ...this._styles, ...data };
    }
    get styles() {
        console.log('get styles', this._styles);
        return this._styles;
    }
    @Input()
    width: number;
    @Input()
    height: number;
    @Input()
    minWidth: number;
    @Input()
    disabled = false;

    _styles: STYLE_TYPE = {
        'width.px': 50,
        'text-align': 'center',
        // padding: 0,
    };

    constructor() { }

    ngOnInit() {
    }

}
