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
    @Input()
    public popHeight;

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

    toggleOpts(event) {
        // console.log('toggle');
        this.stopBubble(event);
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
        // 先selectedChange，再change
        this.selectedChange.emit(opt.value);
        this.change.emit(opt);
    }
    optTrack(index, item) {
        return item.value;
    }

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
