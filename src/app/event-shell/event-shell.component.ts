import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import {
  easeSlideForContent,
  easeSlideForSideNav,
} from '../animations/animations';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-event-shell',
  templateUrl: './event-shell.component.html',
  styleUrls: ['./event-shell.component.scss'],
  animations: [easeSlideForContent, easeSlideForSideNav],
})
export class EventShellComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(
    public uiService: UiService,
    private observer: BreakpointObserver
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.observer.observe(['(max-width: 700px)']).subscribe((res) => {
      setTimeout(() => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
    });
  }
}
