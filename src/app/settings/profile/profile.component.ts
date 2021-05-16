import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  readonly nameMaxLength = 20;
  readonly descriptionMaxLength = 200;
  user: User;
  oldImageFile: string;
  newImageFile: string;
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(this.nameMaxLength)]],
    email: ['', [Validators.email]],
    description: ['', [Validators.maxLength(this.descriptionMaxLength)]],
    ticketPrice: [
      '',
      [Validators.pattern(/\d+/), Validators.min(0), Validators.max(1000000)],
    ],
  });

  user$: Observable<User> = this.authService.user$;
  connectedAccountId$: Observable<string>;
  activeProducts = [];
  isProcessing: boolean;

  constructor(
    public connectedAccountService: ConnectedAccountService,
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.user = user;
      this.oldImageFile = user?.avatarURL;
      this.form.patchValue({
        ...user,
      });
      this.connectedAccountId$ = this.connectedAccountService
        .getConnectedAccount(user.uid)
        .pipe(
          map((account) => {
            if (account) {
              return account.connectedAccountId;
            }
          })
        );
    });
  }

  onCroppedImage(image: string): void {
    this.newImageFile = image;
    console.log(this.newImageFile);
  }

  async updateUser(): Promise<void> {
    this.isProcessing = true;
    if (this.form.controls.ticketPrice.dirty) {
      this.getOneOnOneProducts();

      await this.paymentService
        .createStripeProductAndPrice(this.form.controls.ticketPrice.value)
        .then(() => this.deleteOldProducts())
        .catch((error) => {
          this.snackBar.open('チケット料金の設定に失敗しました');
          throw new Error(error.message);
        });
    }

    const formData = {
      ...this.form.value,
    };
    if (this.newImageFile !== undefined) {
      const value: User = {
        ...formData,
        uid: this.user.uid,
      };
      await this.userService
        .updateAvatar(this.user.uid, this.newImageFile)
        .then(() => {
          this.userService
            .updateUser(value)
            .then(() => (this.isProcessing = false))
            .then(() => this.snackBar.open('ユーザー情報を更新しました'));
        });
    } else {
      const value: User = {
        ...formData,
        uid: this.user.uid,
      };
      await this.userService
        .updateUser(value)
        .then(() => (this.isProcessing = false))
        .then(() => this.snackBar.open('ユーザー情報を更新しました'));
    }
  }

  getOneOnOneProducts(): void {
    this.productService
      .getOneOnOneProducts(this.authService.uid)
      .pipe(take(1))
      .toPromise()
      .then((products) => {
        products.forEach((product) => this.activeProducts.push(product));
      });
  }

  deleteOldProducts(): void {
    if (this.activeProducts.length) {
      for (const product of this.activeProducts) {
        this.paymentService.deleteStripePrice(product);
      }
    }
  }
}
