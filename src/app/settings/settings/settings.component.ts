import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { fade } from 'src/app/animations/animations';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [fade],
})
export class SettingsComponent implements OnInit {
  readonly nameMaxLength = 20;
  user: User;

  user$: Observable<User> = this.authService.user$;
  constructor(
    private authService: AuthService,
    public connectedAccountService: ConnectedAccountService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.user = user;
    });
  }
}
