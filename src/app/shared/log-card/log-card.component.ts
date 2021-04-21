import { Component, Input, OnInit } from '@angular/core';
import { LogWithUser } from 'src/app/interfaces/log';

@Component({
  selector: 'app-log-card',
  templateUrl: './log-card.component.html',
  styleUrls: ['./log-card.component.scss'],
})
export class LogCardComponent implements OnInit {
  @Input() log: LogWithUser;

  constructor() {}

  ngOnInit(): void {}
}
