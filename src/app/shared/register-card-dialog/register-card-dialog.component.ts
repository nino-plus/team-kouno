import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StripeCardElement, Stripe as StripeClient } from '@stripe/stripe-js';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
  selector: 'app-register-card-dialog',
  templateUrl: './register-card-dialog.component.html',
  styleUrls: ['./register-card-dialog.component.scss'],
})
export class RegisterCardDialogComponent implements OnInit {
  @ViewChild('cardElement') private cardElementRef: ElementRef;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(254)],
    ],
  });

  cardElement: StripeCardElement;
  stripeClient: StripeClient;
  isComplete: boolean;

  constructor(
    private fb: FormBuilder,
    public stripeService: StripeService,
    private snackBar: MatSnackBar
  ) {}

  async buildForm(): Promise<void> {
    const stripeClient = await this.stripeService.getStripeClient();
    const elements = stripeClient.elements();
    this.cardElement = elements.create('card');
    this.cardElement.mount(this.cardElementRef.nativeElement);
  }

  createCard(): void {
    if (this.form.valid) {
      this.stripeService.setPaymentMethod(
        this.stripeClient,
        this.cardElement,
        this.form.value.name,
        this.form.value.email
      );
    }
  }

  ngOnInit(): void {}
}
