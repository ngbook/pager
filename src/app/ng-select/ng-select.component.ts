import {
    Component, Input, HostListener,
    OnInit, OnDestroy, Output, EventEmitter,
    ChangeDetectorRef, forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgModel } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { DocClickService } from './document-event.service';

const noop = () => { };

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
    @Input() defaultTxt;
    @Input() disabled = false;
    @Input() width: number;
    @Input() height: number;
    @Input() maxWordCnt: number;
    @Input() popHeight: number;
    @Input() nameKey: string;
    @Input() valueKey: string;
    @Input() autoHide = false; // 是否监听鼠标划出事件来隐藏选择框
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
            this.onChangeCallback(defaultItem.value);
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

    public dataSrc: any[];

    // Placeholders for the callbacks which are later provided
    // by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    private subscriber: Subscription;
    private _selected: any; // 选中项，{name: string, value: any}
    private mouseOutTimer: any;

    constructor(private docClickService: DocClickService,
        private changeDetectionRef: ChangeDetectorRef) {
    }
    ngOnInit() {
        this.initDisplayName();
        this.subscriber = this.docClickService.listen((event) => {
            this.toShowOpts = false;
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
    public stopBubble(event: MouseEvent) {
        event.stopPropagation();
    }

    public toggleOpts(event) {
        this.stopBubble(event);
        this.toShowOpts = !this.toShowOpts;
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
        // 触发事件输出
        this.change.emit(opt);
        this.onChangeCallback(opt.value);
    }

    // 自定义blur，触发组件状态变成touched，在本示例中不是必须
    onBlur() {
        this.onTouchedCallback();
    }
    // ControlValueAccessor接口定义
    // 用于外部绑定的属性变化时，触发本组件内部相关数据更新
    writeValue(value: any) {
        if (!this._selected || value !== this._selected.value) {
            this.selected = value;
        }
    }
    // ControlValueAccessor接口定义
    // 本方法为取得emitter，用于向外反馈内部相关属性的变化
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }
    // ControlValueAccessor接口定义
    // 本方法为取得touched状态变化的触发器，在本示例中不是必须
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
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
}
