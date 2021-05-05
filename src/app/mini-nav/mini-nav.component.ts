import { Component, OnInit } from '@angular/core';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-mini-nav',
  templateUrl: './mini-nav.component.html',
  styleUrls: ['./mini-nav.component.scss'],
})
export class MiniNavComponent implements OnInit {
  constructor(private uiService: UiService) {}

  ngOnInit(): void {}

  toggleNav(): void {
    this.uiService.sidenavIsOpen = !this.uiService.sidenavIsOpen;
  }
}
