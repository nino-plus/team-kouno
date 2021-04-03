import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  snsList = ['google', 'twitter', 'facebook', 'github'];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}
}
