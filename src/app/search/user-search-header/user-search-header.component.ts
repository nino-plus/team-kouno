import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-user-search-header',
  templateUrl: './user-search-header.component.html',
  styleUrls: ['./user-search-header.component.scss'],
})
export class UserSearchHeaderComponent implements OnInit {
  snsList = ['google', 'twitter', 'facebook', 'github'];
  isLargeScreen: boolean = this.uiService.isLargeScreen();

  constructor(public authService: AuthService, public uiService: UiService) {}

  ngOnInit(): void {}
}
