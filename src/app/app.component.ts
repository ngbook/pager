import { Component, OnInit } from '@angular/core';
import { PageData } from './ng-pager/ng-pager.model';

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
    page = new PageData();
    page2 = new PageData();

    ngOnInit() {
        this.page.total = 100;
    }
    optChanged(opt) {
        console.log(opt);
    }
    defaultClick() {
        alert('这是默认的按钮的响应事件');
    }

    pageChanged(data) {
        console.log(data);
    }
}
