import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  date = new Date();
  date2 = Date.now();

  constructor() {}

  ngOnInit(): void {
    console.log(this.date);
    console.log(this.date2);
  }
}
