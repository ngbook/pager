import {
    Component, OnInit, Input, Output,
    EventEmitter, ChangeDetectorRef,
    ChangeDetectionStrategy
} from '@angular/core';
import { PageData } from './ng-pager.model';

@Component({
  selector: 'ng-pager',
  templateUrl: './ng-pager.component.html',
  styleUrls: ['./ng-pager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgPagerComponent implements OnInit {
    // @ViewChildren

    @Input()
    public page: PageData;
    @Input()
    public height = 30;
    @Input()
    public align = 'normal'; // normal, left, right

    @Output()
    public listChange: EventEmitter<any> = new EventEmitter();

    // 是否显示
    @Input()
    public showInfo = true;
    @Input()
    public showJumpTool = true;
    @Input()
    public showTotalPages = true;
    @Input()
    public showPageTool = true;

    @Input()
    public set type(style) {
        this._style = style;
        if (style === 'simple') {
            this.showInfo = false;
            this.showJumpTool = false;
            this.showTotalPages = false;
            this.showPageTool = false;
        }
    }
    itemStyles = {
        'width.px': this.height,
        'height.px': this.height - 2,
        padding: 0
    };

    private _style = 'normal';

    constructor(private changeDetectionRef: ChangeDetectorRef) {
        // pass
    }

    public ngOnInit() {
        this.init();
    }

    // 点击页码
    public selectPage(pageNo: number) {
        if ( this.page.curPage === pageNo - 1 || pageNo < 1 ||
            pageNo > this.page.totalPage ) {
            return;
        }
        this.page.goto(pageNo);

        // this.pageChange.emit(this.page.curPage);
        this.updatePageNos();
    }
    public onPageNoChange(opt) {
        this.page.curPage = opt.value - 1;
        // this.pageChange.emit(this.page.curPage);
        this.updatePageNos();
    }
    public onSizeChange() {
        if (this.page.curPage !== 0) {
            this.page.goFirstPage();
        } else {
            this.page.listChanged();
            // this.listChange.emit(this.page.lacks);
        }
        this.updatePageNos();

        // this.pageSizeChange.emit(this.page.pageSize);
    }
    public goFirstPage() {
        this.page.goFirstPage();
    }
    public goLastPage() {
        this.page.goLastPage();
    }
    public goPrevPage() {
        this.page.goPrevPage();
    }
    public goNextPage() {
        // this.page.curPage ++;
        this.page.goNextPage();
    }

    private updatePageNos() {
        this.page.updatePageNos();
    }

    // 初始化标签
    private init() {
        if (!this.page) {
            this.page = new PageData();
        }
        this.page.setChangeDetector(this.changeDetectionRef);
        this.page.setListChanger(this.listChange);
        // 初始化的时候，触发一次
        this.page.init();
    }

}
