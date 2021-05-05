import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent implements OnInit {
  constructor(public authService: AuthService, private uiService: UiService) {}

  ngOnInit(): void {}

  toggleNav(): void {
    this.uiService.sidenavIsOpen = !this.uiService.sidenavIsOpen;
  }
}
