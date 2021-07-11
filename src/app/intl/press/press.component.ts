import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-press',
  templateUrl: './press.component.html',
  styleUrls: ['./press.component.scss'],
})
export class PressComponent implements OnInit {
  constructor(public location: Location) {}

  ngOnInit(): void {}
}
