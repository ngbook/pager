import { Component, OnInit } from '@angular/core';
import { PageData } from './ng-pager/ng-pager.model';
import { GetFriendsService } from './services/friends.service';

import { People } from './people.model';
import 'rxjs/add/operator/finally';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    testChoices1 = [
        { value: 1, name: '选项一' },
        { value: 2, name: '选项二' },
        { value: 3, name: '选项三' },
        { value: 4, name: '选项四非常非常非常非常长' },
        { value: 5, name: '选项五非常非常非常非常长' },
        { value: 6, name: '选项六非常非常非常非常长' },
        { value: 7, name: '选项七非常非常非常非常长' },
    ];
    testChoices2 = ['选项一', '选项二', '选项三'];
    testChoices3 = [
        { value: 1, name: '选项一', color: '#0f0' },
        { value: 2, name: '选项二', color: 'pink' },
        { value: 3, name: '选项三', color: '#00f' },
    ];
    page = new PageData({
        // autoStart: false // 设置为false时要手动触发，解开下面的page.run()注释即可
    });
    dataList: People[];
    showLoading = false;
    selected = 3;

    constructor(private friendService: GetFriendsService) { }
    ngOnInit() {
        setTimeout(() => {
            this.selected = 2;
            // this.page.run();
        }, 5000);
    }
    optChanged(opt) {
        console.log(opt);
    }
    defaultClick() {
        alert('这是默认的按钮的响应事件');
    }

    pageChanged(data) {
        if (this.dataList) {
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
                    // console.log(body);
                    // 如果返回的数据格式跟People接口或类的定义有出入，
                    //      则这里要做一次数据的格式化
                    this.dataList = body.list;
                    this.page.total = body.total;
                }
            });
        }
    }
}
