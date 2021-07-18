import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  date = new Date();
  date2 = Date.now();

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    console.log(this.date);
    console.log(this.date2);
  }
}
