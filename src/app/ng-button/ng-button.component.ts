import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ng-button',
  templateUrl: './ng-button.component.html',
  styleUrls: ['./ng-button.component.scss'],
//   encapsulation: ViewEncapsulation.None
})
export class NgButtonComponent implements OnInit {
    @Input()
    styles = '';
    @Input()
    disabled = false;

    constructor() { }

    ngOnInit() {
    }

}
