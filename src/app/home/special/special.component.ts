import { Component, Input, OnInit } from '@angular/core';
import { Event } from 'src/app/interfaces/event';

@Component({
  selector: 'app-special',
  templateUrl: './special.component.html',
  styleUrls: ['./special.component.scss'],
})
export class SpecialComponent implements OnInit {
  @Input() event: Event;
  constructor() {}

  ngOnInit(): void {}
}
