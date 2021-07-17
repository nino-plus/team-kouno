import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  snsList = ['google', 'twitter', 'facebook', 'github'];
  isChecked: boolean = false;
  isAgree: boolean = true;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}

  onChange(): void {
    this.isChecked = !this.isChecked;
  }

  onError(): void {
    this.isAgree = false;
  }
}
