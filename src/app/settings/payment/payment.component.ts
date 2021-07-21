import { Component, OnInit } from '@angular/core';
import { ConnectedAccount } from '@interfaces/connected-account';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  connectAccount$: Observable<ConnectedAccount> = this.connectAccountService.getConnectedAccount(
    this.authService.uid
  );

  constructor(
    private authService: AuthService,
    private connectAccountService: ConnectedAccountService
  ) {}

  ngOnInit(): void {}
}
