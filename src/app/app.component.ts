import { Component } from '@angular/core';
import { PageData } from './ng-pager/ng-pager.model';
import { GetFriendsService } from './services/friends.service';

import 'rxjs/add/operator/finally';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public page = new PageData({
        // 设置为false时要手动触发，适当的时候调用page.run()即可
        // autoStart: false
    });
    public showLoading = false;

    constructor(private friendService: GetFriendsService) { }

    public pageChanged(data) {
        const list = this.page.list;
        if (list && list.length > 0) {
            // 有数据的时候再进行刷新，避免这个错误：
            // ExpressionChangedAfterItHasBeenCheckedError
            this.showLoading = true;
        }
        const lacks = data && data.lacks;
        // console.log(lacks);
        if (lacks) {
            this.friendService.request({
                start: lacks.start,
                pageSize: lacks.end - lacks.start
            }).finally(() => {
                this.showLoading = false;
            }).subscribe((rsp) => {
                const body = rsp && rsp.body && rsp.body.data;
                if (body) {
                    this.page.addToCache(body.list, body.start, body.total);
                }
            });
        } else {
            this.showLoading = false;
        }
    }
}
