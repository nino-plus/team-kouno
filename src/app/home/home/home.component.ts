import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user$: Observable<User> = this.authService.user$;

  channelControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(30),
  ]);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  joinChannel(uid: string): void {
    const channelId = this.channelControl.value;
    this.router.navigateByUrl(`/event/${channelId}/${uid}`);
  }
}
