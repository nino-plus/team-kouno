import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventstand',
  templateUrl: './eventstand.component.html',
  styleUrls: ['./eventstand.component.scss'],
})
export class EventstandComponent implements OnInit {
  constructor(public location: Location) {}

  ngOnInit(): void {}
}
