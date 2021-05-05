import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  snsList = ['google', 'twitter', 'facebook', 'github'];
  isLargeScreen: boolean = this.uiService.isLargeScreen();

  constructor(public authService: AuthService, public uiService: UiService) {}

  ngOnInit(): void {}
}
