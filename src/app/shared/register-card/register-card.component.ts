import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StripeCardElement, Stripe as StripeClient } from '@stripe/stripe-js';
import { CustomerService } from 'src/app/services/customer.service';
import { PaymentService } from 'src/app/services/payment.service';
import Stripe from 'stripe';

@Component({
  selector: 'app-register-card',
  templateUrl: './register-card.component.html',
  styleUrls: ['./register-card.component.scss'],
})
export class RegisterCardComponent implements OnInit {
  @ViewChild('cardElement') private cardElementRef: ElementRef;
  mocks = ['4242424242424242'];
  errorMocks = ['4000000000000069'];
  loading = true;
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
  });
  isComplete: boolean;
  cardElement: StripeCardElement;
  methods: Stripe.PaymentMethod[];
  inProgress: boolean;
  stripeClient: StripeClient;

  constructor(
    private fb: FormBuilder,
    public paymentService: PaymentService,
    public customerService: CustomerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getCards();
  }

  /**
   * カード一覧を取得
   */
  getCards(): void {
    this.paymentService.getPaymentMethods().then((methods) => {
      this.methods = methods.data;
      this.loading = false;
    });
  }

  async buildForm(): Promise<void> {
    this.stripeClient = await this.paymentService.getStripeClient();
    const elements = this.stripeClient.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount(this.cardElementRef.nativeElement);
    this.cardElement.on(
      'change',
      (event) => (this.isComplete = event.complete)
    );
  }

  /**
   * カードを作成
   */
  createCard(): void {
    if (this.form.valid) {
      this.inProgress = true;
      this.snackBar.open('カードを登録しています', null, {
        duration: null,
      });
      this.paymentService
        .setPaymentMethod(
          this.stripeClient,
          this.cardElement,
          this.form.value.name,
          this.form.value.email
        )
        .then(() => {
          this.snackBar.open('カードを登録しました');
          this.getCards();
        })
        .catch((error: Error) => {
          console.error(error.message);
          switch (error.message) {
            case 'expired_card':
              this.snackBar.open('カードの有効期限が切れています');
              break;
            default:
              this.snackBar.open('登録に失敗しました');
          }
        })
        .finally(() => {
          this.loading = false;
          this.cardElement.clear();
        });
    }
  }

  /**
   * 編集するカードをフォームの初期値にセット
   */
  setCardToForm(paymentMethod: Stripe.PaymentMethod): void {
    this.form.patchValue({
      name: paymentMethod.billing_details.name,
      email: paymentMethod.billing_details.email,
    });
    this.cardElement.clear();
  }

  /**
   * カードの削除
   */
  deleteStripePaymentMethod(id: string): void {
    const progress = this.snackBar.open('カードを削除しています', null, {
      duration: null,
    });
    this.loading = true;
    this.paymentService
      .deleteStripePaymentMethod(id)
      .then(() => {
        this.snackBar.open('カードを削除しました');
        this.getCards();
      })
      .catch(() => {
        this.snackBar.open('カードの削除に失敗しました');
      })
      .finally(() => {
        progress.dismiss();
        this.loading = false;
      });
  }
}
