import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/app';
import { QuillConfig, QuillToolbarConfig } from 'ngx-quill';
import { Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectedAccountService } from 'src/app/services/connected-account.service';
import { EventService } from 'src/app/services/event.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductService } from 'src/app/services/product.service';
import 'quill-emoji/dist/quill-emoji.js';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  readonly NAME_MAX_LENGTH = 36;
  readonly DESCRIPTION_MAX_LENGTH = 4000;
  readonly PASS_MIN_LENGTH = 6;
  oldImageUrl = '';
  imageFile: string;
  isImageError: boolean = true;
  isProcessing: boolean;
  user$: Observable<User> = this.authService.user$.pipe(
    tap((user) => {
      this.connectedAccountId$ = this.connectedAccountService
        .getConnectedAccount(user.uid)
        .pipe(
          map((account) => {
            if (account) {
              return account.connectedAccountId;
            }
          })
        );
    })
  );
  eventId: string;
  event: Event;
  event$: Observable<Event> = this.route.paramMap.pipe(
    switchMap((params) => {
      this.eventId = params.get('eventId');
      return this.eventService.getEvent(this.eventId);
    })
  );
  connectedAccountId$: Observable<string>;
  activeProducts = [];

  form = this.fb.group({
    name: [
      '',
      [Validators.required, Validators.maxLength(this.NAME_MAX_LENGTH)],
    ],
    description: [
      '',
      [Validators.required, Validators.maxLength(this.DESCRIPTION_MAX_LENGTH)],
    ],
    category: ['', [Validators.required]],
    startAt: ['', [Validators.required]],
    exitAt: [''],
    headcountLimit: ['', [Validators.required]],
    ticketPrice: [
      '',
      [Validators.pattern(/\d+/), Validators.min(0), Validators.max(1000000)],
    ],
  });

  categoryGroup = [
    { value: 'スポーツ' },
    { value: 'ミュージック' },
    { value: 'フード' },
    { value: 'ビジネス' },
    { value: 'プログラミング' },
    { value: 'ゲーム' },
    { value: 'アニメ' },
    { value: 'アイドル' },
    { value: '映画' },
    { value: '漫画' },
    { value: '政治経済' },
    { value: 'ジェンダー' },
    { value: '地域' },
    { value: 'オールラウンド' },
  ];

  modules = {
    'emoji-shortname': true,
    'emoji-toolbar': true,
    toolbar: [
      ['emoji'],
      ['bold', { color: [] }, { background: [] }],
      [{ header: [1, 2, 3, false] }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  constructor(
    public connectedAccountService: ConnectedAccountService,
    private fb: FormBuilder,
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private productService: ProductService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.event$.subscribe((event) => {
      this.event = event;

      if (this.event) {
        this.oldImageUrl = event.thumbnailURL;

        this.form.patchValue({
          name: event.name,
          description: event.description,
          category: event.category,
          ownerId: event.ownerId,
          startAt: event.startAt.toDate(),
          exitAt: event.exitAt.toDate(),
          ticketPrice: event.price,
          headcountLimit: event.headcountLimit,
        });
      }
    });
  }

  onSelectionChanged = (event) => {
    if (event.oldRange == null) {
      this.onFocus(event);
    }
    if (event.range == null) {
      this.onBlur(event);
    }
  };

  onFocus(event) {
    event.editor.theme.modules.toolbar.container.style.border =
      '2px solid #1bcbe0';
    event.editor.theme.options.container.style.border = '2px solid #1bcbe0';
    event.editor.theme.options.container.style.borderTop = 0;
  }

  onBlur(event) {
    event.editor.theme.modules.toolbar.container.style.border =
      '1px solid rgba(255, 255, 255, 0.3)';
    event.editor.theme.options.container.style.border =
      '1px solid rgba(255, 255, 255, 0.3)';
  }

  onCroppedImage(image: string): void {
    this.imageFile = image;
    if (!this.event) {
      this.isImageError = false;
    }
  }

  async submit(uid: string): Promise<void> {
    this.isProcessing = true;
    const formData = this.form.value;
    const eventData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      ownerId: uid,
      participantCount: this.event ? this.event.participantCount : 0,
      reserveUserCount: this.event ? this.event.reserveUserCount : 0,
      startAt: formData.startAt,
      exitAt: formData.exitAt,
      createdAt: firebase.firestore.Timestamp.now(),
      price: formData.ticketPrice,
      headcountLimit: formData.headcountLimit,
    };

    if (this.form.controls.ticketPrice.dirty) {
      this.getEventProducts();

      await this.paymentService
        .createStripeProductAndPrice(
          this.form.controls.ticketPrice.value,
          this.eventId
        )
        .then(() => this.deleteOldProducts())
        .catch((error) => {
          this.snackbar.open('チケット料金の設定に失敗しました');
          throw new Error(error.message);
        });
    }

    if (!this.event) {
      let newEventId = '';
      await this.eventService
        .createEvent(eventData, this.imageFile, uid)
        .then((eventId) => (newEventId = eventId));

      if (this.form.controls.ticketPrice.dirty) {
        this.getEventProducts();

        await this.paymentService
          .createStripeProductAndPrice(
            this.form.controls.ticketPrice.value,
            newEventId
          )
          .then(() => this.deleteOldProducts())
          .catch((error) => {
            this.snackbar.open('チケット料金の設定に失敗しました');
          })
          .finally(() => (this.isProcessing = false));
      }
    } else {
      if (this.form.controls.ticketPrice.dirty) {
        this.getEventProducts();

        await this.paymentService
          .createStripeProductAndPrice(
            this.form.controls.ticketPrice.value,
            this.eventId
          )
          .then(() => this.deleteOldProducts())
          .catch((error) => {
            this.snackbar.open('チケット料金の設定に失敗しました');
            throw new Error(error.message);
          });
      }

      if (this.imageFile !== undefined) {
        await this.eventService
          .updateEvent(this.eventId, eventData, this.imageFile)
          .finally(() => (this.isProcessing = false));
      } else {
        await this.eventService
          .updateEvent(this.eventId, eventData)
          .finally(() => (this.isProcessing = false));
      }
    }
  }

  getEventProducts(): void {
    this.productService
      .getEventProduct(this.eventId)
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

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.form.dirty) {
      $event.preventDefault();
      $event.returnValue = '作業中の内容が失われますがよろしいですか？';
    }
  }
}
