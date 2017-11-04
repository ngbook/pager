import {
    Component, OnInit, Input, Output,
    EventEmitter, ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { PageData } from './ng-pager.model';

@Component({
    selector: 'ng-pager',
    templateUrl: './ng-pager.component.html',
    styleUrls: ['./ng-pager.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgPagerComponent implements OnInit {

    @Input()
    public page: PageData;
    @Input()
    public height = 30;
    @Input()
    public align = 'normal'; // normal, left, right

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
    public set type(newType) {
        if (newType === 'simple') {
            this.showInfo = false;
            this.showJumpTool = false;
            this.showTotalPages = false;
            this.showPageTool = false;
        }
    }

    @Output()
    public listChange: EventEmitter<any> = new EventEmitter();

    public itemStyles = {
        padding: 0
    };

    constructor(private changeDetectionRef: ChangeDetectorRef) {
        // pass
    }

    public ngOnInit() {
        if (!this.page) {
            this.page = new PageData();
        }
        this.page.setChangeDetector(this.changeDetectionRef);
        this.page.setListChanger(this.listChange);
        // 初始化的时候，触发一次
        this.page.init();
    }

    // 通过页码下拉框修改当前页面
    public onPageNoChange(opt) {
        this.page.curPage = opt.value - 1;
    }
    // 点击页码
    public selectPage(pageNo: number) {
        if (this.page.curPage === pageNo - 1 || pageNo < 1 ||
            pageNo > this.page.totalPage) {
            return;
        }
        this.page.goto(pageNo);
    }
    // 跳到第一页
    public goFirstPage() {
        this.page.goFirstPage();
    }
    // 跳到最后一页
    public goLastPage() {
        this.page.goLastPage();
    }
    // 往前跳一页
    public goPrevPage() {
        this.page.goPrevPage();
    }
    // 往后跳一页
    public goNextPage() {
        this.page.goNextPage();
    }

}
