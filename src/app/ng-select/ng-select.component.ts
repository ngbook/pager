import {
    Component, Input, HostListener,
    OnInit, OnDestroy, Output, EventEmitter,
    ChangeDetectorRef, forwardRef,
    ElementRef, ViewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { DocEventService } from './document-event.service';

@Component({
    selector: 'ng-select',
    templateUrl: './ng-select.component.html',
    styleUrls: ['./ng-select.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => NgSelectComponent),
        multi: true
    }],
})
export class NgSelectComponent implements OnInit,
    OnDestroy, ControlValueAccessor {

    @ViewChild('choices', {read: ElementRef})
    choicesWrapper: ElementRef;

    @Input() defaultTxt;
    @Input() disabled = false;
    @Input() maxWordCnt: number;
    @Input() width: number;
    @Input() height = 30;
    @Input() popHeight: number;
    @Input() nameKey: string;
    @Input() valueKey: string;
    @Input() autoHide = true; // 是否监听鼠标划出事件来隐藏选择框
    @Input('dataSrc')
    public set data(data) {
        if (!data) {
            return;
        }
        const list = this.dataSrc = this.formatDataSrc(data);
        this.initDisplayName();
        // 如果没有默认值，则把第一个当默认值
        if (!this.displayName && list && list.length > 0) {
            const defaultItem = list[0];
            this.displayName = defaultItem.name;
            this._selected = defaultItem;
            if (this.emitChangeCallback) {
                this.emitChangeCallback(defaultItem.value);
            }
        }
    }
    public set selected(key) {
        if (!key || !this.dataSrc) {
            return;
        }
        for (let opt of this.dataSrc) {
            if (opt.value === key) {
                this._selected = opt;
                this.displayName = this.formatName(opt.name);
                this.changeDetectionRef.detectChanges();
                break;
            }
        }
    }
    public get selected() {
        return this._selected && this._selected.value || null;
    }
    @Output()
    change: EventEmitter<any> = new EventEmitter();

    public displayName: string;
    public toShowOpts = false;
    public choicesTop = 0;

    public dataSrc: any[];

    private subscriber: Subscription;
    private _selected: any; // 选中项，{name: string, value: any}
    private mouseOutTimer: any;

    // 定义两个空的回调，之后在ControlValueAccessor的函数中会赋值
    private setTouchedCallback: any;
    private emitChangeCallback: any;

    constructor(private docEventService: DocEventService,
        private changeDetectionRef: ChangeDetectorRef) {
    }
    public ngOnInit() {
        this.initDisplayName();
        this.subscriber = this.docEventService.listen((event) => {
            this.toShowOpts = false;
            // 为了保证这个select组件在各种变化检测策略中都能正常工作，
            // 这里手动添加了变化检测的触发机制
            this.changeDetectionRef.detectChanges();
        });
    }
    public ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }
    public stopBubble(event: MouseEvent) {
        event.stopPropagation();
    }

    public toggleOpts(event) {
        this.stopBubble(event);
        this.toShowOpts = !this.toShowOpts;
        if (this.toShowOpts) {
            setTimeout(() => {
                this.adjustPopPos();
            });
        }
    }
    public chooseItem(opt) {
        if (this._selected) {
            if (opt.value === this._selected.value) {
                this.toShowOpts = false;
                return;
            }
        }
        this._selected = opt;
        this.displayName = this.formatName(opt.name);
        this.toShowOpts = false;
        // 反向设置外部绑定的属性或变量
        if (this.emitChangeCallback) {
            this.emitChangeCallback(opt.value);
        }
        // 同时标记成touched状态
        if (this.setTouchedCallback) {
            this.setTouchedCallback();
        }
        // 最后再触发事件输出
        this.change.emit(opt);
    }

    // ControlValueAccessor接口定义的
    // 用于外部绑定的属性变化时，触发本组件内部相关数据更新
    public writeValue(value: any) {
        if (!this._selected || value !== this._selected.value) {
            this.selected = value;
        }
    }
    // ControlValueAccessor接口定义的
    // 本方法为取得emitter，用于向外反馈内部相关属性的变化
    public registerOnChange(fn: any) {
        this.emitChangeCallback = fn;
    }
    // ControlValueAccessor接口定义的
    // 本方法为取得touched状态变化的触发器
    public registerOnTouched(fn: any) {
        this.setTouchedCallback = fn;
    }
    public hideOpts() {
        if (!this.autoHide) {
            return;
        }
        this.mouseOutTimer = setTimeout(() => {
            this.toShowOpts = false;
            this.changeDetectionRef.detectChanges();
        }, 100);
    }
    public enterButton() {
        if (!this.autoHide) {
            return;
        }
        if (this.mouseOutTimer) {
            clearTimeout(this.mouseOutTimer);
            this.mouseOutTimer = null;
        }
    }

    private initDisplayName() {
        if (this.defaultTxt && !this.displayName) {
            this.displayName = this.formatName(this.defaultTxt);
        }
    }
    private formatDataSrc(data) {
        if (!data) {
            return null;
        }
        const nameKey = this.nameKey;
        const valueKey = this.valueKey;
        const list = [];
        data.forEach( (item) => {
            if (!item) {
                return;
            }
            const name = item[nameKey] || item.name || item.label || item;
            const value = item[valueKey] || item.value || item.id || item;
            const result = {
                value, name,
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
    private adjustPopPos() {
        const dom = this.choicesWrapper.nativeElement;
        const offsetHeight = dom.offsetHeight;
        const winSize = this.docEventService.winSize;
        if (winSize.height < offsetHeight) {
            // 窗口的高度本来就小于弹出框高度，直接返回，不用往下判断了
            return;
        }
        const offsetTop = dom.getBoundingClientRect().top;
        if (winSize && offsetHeight
            && offsetTop + offsetHeight > winSize.height) {
            this.choicesTop = -(dom.offsetHeight + this.height);
            this.changeDetectionRef.detectChanges();
        }
    }
}
