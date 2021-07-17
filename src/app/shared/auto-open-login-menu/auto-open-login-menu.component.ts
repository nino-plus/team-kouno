import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auto-open-login-menu',
  templateUrl: './auto-open-login-menu.component.html',
  styleUrls: ['./auto-open-login-menu.component.scss'],
})
export class AutoOpenLoginMenuComponent implements OnInit {
  timedOutCloser;

  constructor() {}
  ngOnInit(): void {}

  mouseEnter(trigger) {
    if (this.timedOutCloser) {
      clearTimeout(this.timedOutCloser);
    }
    trigger.openMenu();
  }

  mouseLeave(trigger) {
    this.timedOutCloser = setTimeout(() => {
      trigger.closeMenu();
    }, 50);
  }
}
