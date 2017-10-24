import {
    Component, Input, HostListener,
    OnInit, OnDestroy, Output, EventEmitter,
    ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { DocClickService } from './document-event.service';

@Component({
  selector: 'ng-select',
  templateUrl: './ng-select.component.html',
  styleUrls: ['./ng-select.component.scss'],
})
export class NgSelectComponent implements OnInit, OnDestroy {
    @Input()
    public default;
    @Input()
    public disabled = false;
    @Input()
    public srcKey;
    @Input()
    public width;
    @Input()
    public height;
    @Input()
    public minWidth;
    @Input()
    public maxWordCnt: number;

    @Input('dataSrc')
    public set data(data) {
        if (!data) {
            return;
        }
        const list = this.dataSrc = this.simplyFormatDataSrc(data);
        // 如果没有默认值，则把第一个当默认值
        if (!this.displayName && list && list.length > 0) {
            this.displayName = list[0].name;
        }
    }
    @Input()
    public set selected(key) {
        if (!key || !this.dataSrc) {
            return;
        }
        for (let opt of this.dataSrc) {
            if (opt.value === key) {
                this._selected = opt;
                this.displayName = this.formatName(opt.name);
                break;
            }
        }
    }
    public get selected() {
        return this._selected && this._selected.value || null;
    }
    @Output() // 跟上面对应，给双向绑定用
    public selectedChange: EventEmitter<any> = new EventEmitter();

    @Output()
    change: EventEmitter<any> = new EventEmitter();

    public displayName: string;
    public showOpts = false;
    // 定制button的样式以适应select
    styles = {
        'background': '#fff',
        'min-width.px': 50,
        'padding': 0,
        'text-align': 'center',
    };
    dataSrc: any[];
    private _selected: any;
    private subscriber: Subscription;

    constructor(private docClickService: DocClickService,
        private changeDetectionRef: ChangeDetectorRef) {
    }
    ngOnInit() {
        if (!this.minWidth && this.width) {
            this.minWidth = this.width;
        }
        if (this.default) {
            this.displayName = this.formatName(this.default);
        }
        this.subscriber = this.docClickService.listen((event) => {
            this.showOpts = false;
            // 为了保证这个select组件在各种变化检测策略中都能正常工作，
            // 这里手动添加了变化检测的触发机制
            this.changeDetectionRef.detectChanges();
        });
    }
    ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }
    stopBubble(event: MouseEvent) {
        event.stopPropagation();
    }

    toggleOpts() {
        this.showOpts = !this.showOpts;
    }
    chooseItem(opt) {
        if (this._selected) {
            if (opt.value === this._selected.value) {
                return;
            }
        }
        this._selected = {
            value: opt.value,
            name: opt.name,
        };
        this.displayName = this.formatName(opt.name);
        // console.log(this.showOpts, opt);
        setTimeout(() => {
            this.showOpts = false;
        });
        this.change.emit(opt);
        // this.selectedChange.emit(opt.value);
    }
    optTrack(index, item) {
        return item.value;
    }

    // @Input()
    // public maxHeight: number | string = 200;
    // @Input()
    // public useEffect = true;
    // @Input()
    // public iconCls = 'icon-jui-down2';

    // @Input()
    // public default: string;
    // @Input()
    // public _displayName: string;
    // @Input()
    // public height: number = 30;
    // @Input()
    // public width: number;
    // @Input()
    // public minWidth: number;
    // public ngOnInit() {
    //     this._displayName = this.displayName;
    //     if (this._dataSrc) {
    //         if ( this._selected ) {
    //             let len = this._dataSrc.length;
    //             for ( let i = 0; i < len; i ++ ) {
    //                 let item = this._dataSrc[i];
    //                 if ( item.value === this._selected ) {
    //                     if (!this.displayName && !this.default) {
    //                         this._displayName = this.formatName(item.name);
    //                     }
    //                     this.selectedItem = item;
    //                     break;
    //                 }
    //             }
    //         } else {
    //             if ( this._dataSrc.length > 0 ) {
    //                 if (!this.displayName && !this.default) {
    //                     this._displayName = this.formatName(this._dataSrc[0].name) || '-选择-';
    //                 }
    //                 this._selected = this._dataSrc[0].value || '';
    //             }
    //         }
    //     }
    // }

    private simplyFormatDataSrc(data) {
        if (!data) {
            return null;
        }
        let key = this.srcKey;
        const list = [];
        data.forEach( (item) => {
            if (!item) {
                return;
            }
            let value = item;
            let name = item.name || item.label || item[key] || item;
            if (key) {
                value = item[key];
            } else {
                if (item.id !== undefined) {
                    value = item.id;
                } else if (item.value !== undefined) {
                    value = item.value;
                } else {
                    value = name;
                }
            }
            const result = {
                value,
                name,
                color: item.color
            };
            if (typeof item === 'object') {
                result['data'] = item; // 原值
            }
            // return result;
            list.push(result);
        });
        return list;
    }
    private formatName(name) {
        if (!this.maxWordCnt) {
            return name;
        } else {
            if (name.length > this.maxWordCnt) {
                return name.substr(0, this.maxWordCnt) + '...';
            } else {
                return name;
            }
        }
    }
}
