import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { fade } from 'src/app/animations/animations';
import { Customer } from 'src/app/interfaces/customer';
import { Product } from 'src/app/interfaces/product';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { CustomerService } from 'src/app/services/customer.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductService } from 'src/app/services/product.service';
import { SoundService } from 'src/app/services/sound.service';
import { UiService } from 'src/app/services/ui.service';
import { UserService } from 'src/app/services/user.service';
import { UserStoreComponent } from 'src/app/shared/user-store/user-store.component';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.scss'],
  animations: [fade],
})
export class WaitingComponent implements OnInit {
  tokens: string[] = [];
  user$: Observable<User> = this.authService.user$.pipe(
    tap((user) => {
      this.customer$ = this.customerService.getCustomer(user.uid);
    })
  );
  targetUid: string = this.route.snapshot.paramMap.get('targetUid');
  targetUser$: Observable<User> = this.userService.getUserData(this.targetUid);
  customer$: Observable<Customer>;
  products$: Observable<Product[]> = this.productService.getActiveProducts(
    this.targetUid
  );
  connectedAccountId$: Observable<string> = this.connectedAccountService
    .getConnectedAccount(this.targetUid)
    .pipe(map((account) => account.connectedAccountId));

  readonly MESSAGE_MAX_LENGTH = 200;
  form = this.fb.group({
    message: [
      'こんにちは！',
      [Validators.required, Validators.maxLength(this.MESSAGE_MAX_LENGTH)],
    ],
  });

  constructor(
    public uiService: UiService,
    private authService: AuthService,
    private meetingService: MeetingService,
    private messagingService: MessagingService,
    private fns: AngularFireFunctions,
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerService,
    private soundService: SoundService,
    private dialog: MatDialog,
    private productService: ProductService,
    private connectedAccountService: ConnectedAccountService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.customer$.subscribe((d) => console.log(d));
    }, 1000);
    this.targetUser$.subscribe((d) => console.log(d.ticketPrice));
  }

  async sendPushMessage(
    tokens: string[],
    user: User,
    roomId: string
  ): Promise<void> {
    const callable = this.fns.httpsCallable('sendPushMessage');
    return callable({
      tokens,
      icon: user.avatarURL,
      name: user.name,
      roomId,
    })
      .toPromise()
      .then(() => {
        this.messagingService.receiveMessage();
      });
  }

  openTicketDialog(user: User, targetUser: User): void {
    this.soundService.openSound.play();
    this.dialog
      .open(UserStoreComponent, {
        data: {
          uid: user.uid,
          targetUser: targetUser,
        },
        width: '300px',
      })
      .afterClosed()
      .subscribe(async (status) => {
        if (status) {
          const ticket = status[0];
          const connectedAccountId = status[1]
          await this.paymentService
            .charge(ticket, connectedAccountId)
            .then(() => this.call(user));
        }
      });
  }

  async call(user: User): Promise<void> {
    const formData = this.form.value;
    const message = formData.message;
    const roomId = this.route.snapshot.paramMap.get('roomId');
    this.meetingService.createInvite(
      this.targetUid,
      roomId,
      this.authService.uid,
      message
    );
    const tokens$ = this.messagingService.getTokens(this.targetUid);
    tokens$.pipe(take(1)).subscribe((tokens) => {
      tokens?.map((token) => this.tokens.push(token?.token));
      this.sendPushMessage(this.tokens, user, roomId);
    });

    this.router.navigate(['meeting', roomId]);
  }
}
