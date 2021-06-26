import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-search-header',
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss'],
})
export class SearchHeaderComponent implements OnInit {
  snsList = ['google', 'twitter', 'facebook', 'github'];
  isLargeScreen: boolean = this.uiService.isLargeScreen();

  constructor(public authService: AuthService, public uiService: UiService) {}

  ngOnInit(): void {}
}
