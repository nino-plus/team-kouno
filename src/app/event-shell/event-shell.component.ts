import { Component, OnInit } from '@angular/core';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-event-shell',
  templateUrl: './event-shell.component.html',
  styleUrls: ['./event-shell.component.scss'],
})
export class EventShellComponent implements OnInit {
  constructor(public uiService: UiService) {}

  ngOnInit(): void {}
}
