import {
    ChangeDetectorRef,
    EventEmitter,
} from '@angular/core';

const DEFAULT_PAGE_SIZE = 10;
const PAGER_NUMBER_COUNT_SHOWING = 5; // 分页的按钮最多只显示几个
const CUR_PAGE_POS = 2; // 从0开始，不能超过PAGER_NUMBER_COUNT_SHOWING

export interface DataSpan {
    start: number;
    end: number;
}

const OPTIONS_TO_UPDATE = [
    'curPage', 'pageSize', 'total',
    'pageSizeOpts', 'autoStart'
];

export class PageData {
    public start = 0; // 从0开始
    public end = DEFAULT_PAGE_SIZE; // end最大为total
    public pageSizeOpts: any = [5, 10, 20, 50];

    public set curPage(curPage) {
        if (this._curPage === curPage) {
            return;
        }
        this.start = curPage * this._pageSize;
        this.end = this.checkEnd(this.start + this._pageSize);
        this._curPage = curPage;
        this.listChanged();
        this.updatePageNos();
        this.detectChanges();
    }
    public get curPage() {
        return this._curPage;
    }
    public set pageSize(pageSize) {
        console.log('set pageSize', this._pageSize, pageSize);
        if (this._pageSize === pageSize) {
            return;
        }
        this._curPage = 0;
        this.start = 0;
        this._pageSize = pageSize;
        this.end = this.checkEnd(this._pageSize);
        if (this.updatePageCount()) {
            this.updatePageNos();
        }
        this.detectChanges();
        this.listChanged();
    }
    public get pageSize() {
        return this._pageSize;
    }
    public set total(total) {
        if (this._total === total) {
            return;
        }
        this.hasTotalInited = true;
        this._total = total;
        if (!this.end) {
            this.end = this._pageSize;
        }
        if (this.end > total) {
            this.end = total;
        }
        if (this.updatePageCount()) {
            this.updatePageNos(); // 自带detectChanges
        } else {
            this.detectChanges();
        }
    }
    public get total() {
        return this._total;
    }
    private listChange: EventEmitter<any>;

    // 记录真实值
    private _pageSize = DEFAULT_PAGE_SIZE;
    private _curPage = 0;
    private _total = 0;

    // 其它属性
    public pageNos: number[] = []; // 从1开始，当前可见的最多
                            // PAGER_NUMBER_COUNT_SHOWING 个页码
    public totalPage = 0;
    public allPageNos: number[] = []; // 从1开始，所有页码（选择框用）
    public hasTotalInited = false;
    public autoStart = true;
    private changeDetectionRef: ChangeDetectorRef;

    constructor(option?) {
        if (option) {
            OPTIONS_TO_UPDATE.forEach((opt) => {
                if (option[opt] !== undefined) {
                    this[opt] = option[opt];
                }
            });
        }
        this.detectChanges();
    }
    public init() {
        if (this.autoStart) {
            this.run();
        }
    }
    public goto(pageNo) {
        this.curPage = pageNo - 1;
    }
    public goFirstPage() {
        if (this._curPage === 0) {
            return;
        }
        this.curPage = 0;
        this.updatePageNos();
    }
    public goLastPage() {
        if (this.totalPage <= 0) {
            return;
        }
        let lastPage = this.totalPage - 1;
        if (this._curPage === lastPage) {
            return;
        }
        this.curPage = lastPage;
        this.updatePageNos();
    }
    public goPrevPage() {
        if (this._curPage > 0) {
            this.curPage--;
        }
    }
    public goNextPage() {
        if (this._total <= 0) {
            return;
        }
        if (!this.isLastPage()) {
            this.curPage++;
        }
    }
    public isLastPage(): boolean {
        return !this.totalPage ||
            this._curPage === this.totalPage - 1;
    }

    public listChanged() {
        if (this.listChange) {
            this.listChange.emit({
                lacks: {
                    start: this.start,
                    end: this.end,
                },
            });
        }
    }

    // 更新当前的页码列表（PAGER_NUMBER_COUNT_SHOWING 个）
    public updatePageNos() {
        const pages = [];
        // startNum数字从_curPage + 1开始，往前移CUR_PAGE_POS个位置
        let startNum = (this._curPage + 1) - CUR_PAGE_POS;
        if (startNum < 1) { // 最小为1
            startNum = 1;
        }
        let endNum = startNum + PAGER_NUMBER_COUNT_SHOWING;
        // console.log(startNum, endNum, this.totalPage);
        if (endNum > this.totalPage) {
            let diff = endNum - this.totalPage;
            endNum = this.totalPage + 1; // 因为end不包含
            startNum -= diff - 1;
            if (startNum <= 0) {
                startNum = 1;
            }
        }
        for (let index = startNum; index < endNum; index++) {
            pages.push(index);
        }
        this.pageNos = pages;
        this.detectChanges();
    }
    public setChangeDetector(changeDetectionRef) {
        this.changeDetectionRef = changeDetectionRef;
    }
    public setListChanger(listChange: EventEmitter<any>) {
        this.listChange = listChange;
    }
    public reset() {
        this._curPage = this._total = 0;
        this._pageSize = DEFAULT_PAGE_SIZE;
        this.start = this.end = 0;
        this.totalPage = 0;
        this.hasTotalInited = false;
        this.allPageNos = [];
        this.pageNos = [];
    }
    public run() {
        this.listChanged();
    }
    // 更新总页数，及页码选择框的数据
    private updatePageCount() {
        let totalPage = Math.ceil(1.0 * this._total / this._pageSize);
        if (totalPage === this.totalPage) {
            return false;
        }
        this.totalPage = totalPage;
        let pages = [];
        for (let index = 1; index <= this.totalPage; index++) {
            pages.push(index);
        }
        this.allPageNos = pages;
        return true;
    }
    // 检查end是否溢出
    private checkEnd(end: number) {
        if (this._total <= 0) {
            return end;
        }
        if (end > this._total) {
            return this._total;
        }
        return end;
    }
    private detectChanges() {
        if (this.changeDetectionRef) {
            this.changeDetectionRef.detectChanges();
        }
    }

}
