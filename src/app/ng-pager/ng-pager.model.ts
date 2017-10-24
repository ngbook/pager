import {
    ChangeDetectorRef,
    EventEmitter,
} from '@angular/core';

const DEFAULT_PAGE_SIZE = 10;
const PAGER_NUMBER_COUNT_SHOWING = 5; // 分页的按钮最多只显示几个

export interface DataSpan {
    start: number;
    end: number;
}

const OPTIONS_TO_UPDATE = [
    'curPage', 'pageSize', 'total',
    'pageSizeOpts', 'autoStart'
];

export class PageData {
    public pageSizeOpts: any = [5, 10, 20, 50];
    public start = 0; // 从0开始
    public end = DEFAULT_PAGE_SIZE; // end最大为total

    public autoStart = true;

    public totalPage = 0;
    public hasTotalInited = false;
    public pageNos: number[] = []; // 从1开始，当前可见的最多PAGER_NUMBER_COUNT_SHOWING 个页码
    public allPageNos: number[] = []; // 从1开始，所有页码（选择框用）

    public set pageSize(pageSize) {
        // console.log('set pageSize', pageSize);
        if (this._pageSize === pageSize) {
            return;
        }
        this.start = 0;
        this._pageSize = pageSize;
        this.end = this.checkEnd(this._pageSize);
        if (this.updatePageCount()) {
            this.updatePageNos();
        }
        // this.lacks = this.cache.checkCache(
        //     this.start, this.end, this.leastFetch);
        // this.updateList(); // 这里有detectChanges
        this.detectChanges();
    }
    public get pageSize() {
        return this._pageSize;
    }
    public set curPage(curPage) {
        if (this._curPage === curPage) {
            return ;
        }
        this.start = curPage * this._pageSize;
        this.end = this.checkEnd(this.start + this._pageSize);
        this._curPage = curPage;
        // this.lacks = this.cache.checkCache(
        //     this.start, this.end, this.leastFetch);
        this.listChanged();
        this.updatePageNos();
        this.detectChanges();
    }
    public get curPage() {
        return this._curPage;
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
        // this.cache.setTotal(total);
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

    // private cache = new PageCache(); // 用于做缓存控制
    public lacks: DataSpan; // 当前页面还需要加载的数据
    private _pageSize = DEFAULT_PAGE_SIZE;
    private _curPage = 0;
    private _total = 0;
    private changeDetectionRef: ChangeDetectorRef;
    // private pageChange: EventEmitter<any>;
    // private pageSizeChange: EventEmitter<any>;
    // private leastFetch = Math.ceil(
    //     LEAST_FETCHING_PERCENT * this._pageSize);
    // private deleting: number[] = [];
    // private realEnd: number; // 多次删除时，用于辅助判断是否镂空的情况

    constructor( option? ) {
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
        this.lacks = {
            start: 0,
            end: this.end
        };
        if (this.autoStart) {
            this.listChanged();
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
            this.curPage --;
        }
    }
    public goNextPage() {
        if (this._total <= 0) {
            return;
        }
        if (!this.isLastPage()) {
            this.curPage ++;
        }
    }
    public listChanged() {
        if (this.listChange) {
            // let data = this.getList();
            this.listChange.emit({
                lacks: this.lacks,
                // data,
            });
        }
        // 当this.lacks为空时，此时不需要网络请求
        // if (!this.lacks && this.cache.hasData) { // 需要使用内置数据容器时触发
        //     this.updateList();
        //     this.detectChanges();
        // }
    }

    public isLastPage(): boolean {
        return !this.totalPage ||
            this._curPage === this.totalPage - 1;
    }
    // 更新当前可见的页面（PAGER_NUMBER_COUNT_SHOWING 个）
    public updatePageNos() {
        const pages = [];
        let startNum = this._curPage + 1; // startNum数字从1开始
        let endNum = startNum + PAGER_NUMBER_COUNT_SHOWING; // 不包含end
        // console.log(startNum, endNum, this.totalPage);
        if (endNum > this.totalPage) {
            let diff = endNum - this.totalPage;
            endNum = this.totalPage + 1; // 因为end不包含
            startNum -= diff - 1;
            if (startNum <= 0) {
                startNum = 1;
            }
        }
        for (let index = startNum; index < endNum; index ++) {
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
    // public hasData() {
    //     return this.cache.hasData;
    // }
    public reset() {
        this._curPage = this._total = 0;
        this.start = this.end = 0;
        this.totalPage = 0;
        this.hasTotalInited = false;
        this.allPageNos = [];
        this.pageNos = [];
        // this.list = [];
        this.lacks = null;
        // this.cache.reset();
    }
    // public addToList(rows, start?: number) {
    //     // console.log(rows, start, this.cache.getList());
    //     if (!start) {
    //         start = 0;
    //     }
    //     let isFirstAdd = false; // 是不是第一次添加
    //     let list = this.cache.getList();
    //     if (!list || list.length <= 0) {
    //         isFirstAdd = true;
    //         if (this._total === 0 && this.end === 0) {
    //             this.end = this._pageSize; // 临时设置，让list至少有数据
    //         }
    //     }
    //     this.cache.addToList(rows, start);
    //     if (!isFirstAdd && (this.end <= start ||
    //         this.start >= start + rows.length)) { // 当前页没受影响
    //         // console.log('skipped..');
    //         // pass
    //     } else {
    //         this.realEnd = this.end;
    //         this.updateList();
    //     }
    //     // console.log(this.list);
    // }
    // public prepend(arr: any[]) {
    //     if (!arr || arr.length <= 0) {
    //         return;
    //     }
    //     this.cache.prepend(arr);
    //     let isFirstPage = this._curPage === 0;
    //     this.total = this._total + arr.length;
    //     // 如果需要填补数据
    //     if (this.cache.hasData && this.delAware) {
    //         if (isFirstPage) { // 在第一页才更新
    //             // 如果第一页没有填满
    //             if (this.end % this._pageSize !== 0) {
    //                 this.end = this._pageSize;
    //             }
    //             this.updateList();
    //         }
    //     }
    // }
    // public append(arr: any[]) {
    //     if (!arr || arr.length <= 0) {
    //         return;
    //     }
    //     this.cache.append(arr);
    //     let isEmpty = !this._total;
    //     let isLastPage = this.isLastPage();
    //     this.total = this._total + arr.length;
    //     // 如果需要填补数据
    //     if (this.cache.hasData && this.delAware) {
    //         if (isLastPage) { // 在最后一页
    //             // 如果最后一页没有填满
    //             if (this.end % this._pageSize !== 0
    //                 || isEmpty) {
    //                 this.end = this.start + this._pageSize;
    //                 this.updateList();
    //             }
    //         }
    //     }
    // }

    // public delFromList(opt) {
    //     // console.log('deleting...', this.end);
    //     // 如果用到了组件的缓存机制
    //     if (this.cache.hasData) {
    //         // console.log('deleting', opt);
    //         let result: any = this.cache.delFromList(opt);
    //         let index = result.index;
    //         if (index < 0) {
    //             return; // 没删除成功
    //         }
    //         // this.updatePageCount();
    //         let delData = result.data;
    //         let delCnt = result.data.length;
    //         this._total -= delCnt;
    //         if (this.delAware) { // 需要尽量帮用户维持一整页满数据
    //             let end = this.end;
    //             // let start = this.start;
    //             if (delData && delData.length > 0) {
    //                 end -= delCnt; // end要往前减
    //                 if (!this.realEnd) {
    //                     this.realEnd = this.end - delCnt;
    //                 } else {
    //                     this.realEnd -= delCnt;
    //                 }
    //                 // this.updateList();
    //             }
    //             this.deleting.push(index);
    //             let item: any;
    //             let list = this.cache.getList();
    //             if (this.isLastPage()) { // 最后一页，直接删除
    //                 this.end -= delCnt;
    //                 console.log('end: ', this.end);
    //                 if (this.list.length === 0) { // 最后一条
    //                     this.goPrevPage();
    //                 }
    //                 this.updateList();
    //                 // this.detectChanges();
    //             } else { // 不是最后一页，则往后取
    //                 item = list[end]; // end不用再加1
    //                 if (!this.cache.isExist(end)) {
    //                     // console.log(end, this.end, this.realEnd);
    //                     // this.realEnd = end;
    //                     let start = end - 1;
    //                     if (end !== this.realEnd // 用户有快删的行为
    //                         || end === this._total) { // 或者本次是最后一次加载了
    //                         // console.log('用户有暴力倾向');
    //                         // 暴力从头取，而且依然多取一页，让用户随便删
    //                         start = this.start;
    //                     }
    //                     // 多取一页，节省请求
    //                     end = this.checkEnd(this.end + this._pageSize);
    //                     // 后面再没请求了，直接全部重取，
    //                     // 这是为了避免快速删除的情况下，后面再没请求修复数据
    //                     if (end === this._total) {
    //                         start = this.start;
    //                     }
    //                     this.lacks = {
    //                         start, end
    //                     };
    //                     // console.log(this.lacks);
    //                     // this.end -= delCnt;
    //                     this.listChanged(); // 需要加载，但暂不需要更新list
    //                 } else {
    //                     this.updateList();
    //                     this.detectChanges();
    //                 }
    //             }
    //         } else { // 不需要帮用户补充数据
    //             if (delData && delData.length > 0) {
    //                 this.end -= delCnt; // end要往前减
    //                 this.updateList();
    //             }
    //             // 如果删除的这条是当前页中的最后一条，则要切换页面
    //             if (this.list.length === 0) { // 最后一条
    //                 if (this.isLastPage()) { // 最后一页就往前进
    //                     // this.curPage --;
    //                     this.goPrevPage();
    //                 } else { // 否则就往下一页
    //                     this.end = this.checkEnd(
    //                         this.start + this._pageSize);
    //                     this.lacks = this.cache.checkCache(
    //                         this.start, this.end, this.leastFetch);
    //                     // console.log(this.lacks);
    //                     this.listChanged();
    //                 }
    //             }
    //         }
    //         // 每次都检查
    //         if (this.updatePageCount()) {
    //             this.updatePageNos();
    //         }
    //         // this.updateList();
    //     }
    // }
    // 获取特定的范围的数据，这里不校验是否为空
    // public getList(startEnd?: DataSpan) { // 没指定则默认当前页
    //     if (!startEnd) {
    //         startEnd = {
    //             start: this.start,
    //             end: this.end,
    //         };
    //     }
    //     return this.cache.getListOf(startEnd);
    // }

    // private updateList() {
    //     let list = this.getList();
    //     // let len = list.length;
    //     // if (len > 0) {
    //     let len = this.list.length;
    //     this.list.splice(0, len, ...list);
    //     this.detectChanges();
    //     // }
    // }
    // 更新总页数，及页码选择框的数据
    private updatePageCount() {
        // debugger
        let totalPage = Math.ceil(1.0 * this._total / this._pageSize);
        if (totalPage === this.totalPage) {
            return false;
        }
        this.totalPage = totalPage;
        let pages = [];
        for (let index = 1; index <= this.totalPage; index ++) {
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
        // console.log('detect changes');
        if (this.changeDetectionRef) {
            this.changeDetectionRef.markForCheck();
            // this.changeDetectionRef.detectChanges();
        }
    }

}
