import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  readonly NAME_MAX_LENGTH = 20;
  readonly DESCRIPTION_MAX_LENGTH = 200;
  readonly PASS_MIN_LENGTH = 6;
  oldImageUrl = '';
  imageFile: string;
  isProcessing: boolean;
  uid: string;
  eventId: string;
  event: Event;
  event$: Observable<Event> = this.route.paramMap.pipe(
    switchMap((params) => {
      this.eventId = params.get('eventId');
      return this.eventService.getEvent(this.eventId);
    })
  );

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
  });

  categoryGroup = [
    { value: 'スポーツ' },
    { value: 'ミュージック' },
    { value: 'フード' },
    { value: 'ビジネス' },
    { value: 'プログラミング' },
    { value: 'ゲーム' },
    { value: 'アニメ' },
    { value: 'アイドルØ' },
    { value: '映画' },
    { value: '漫画' },
    { value: '政治経済' },
    { value: 'ジェンダー' },
    { value: '地域' },
    { value: 'オールラウンド' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe((user: User) => {
      this.uid = user.uid;
    });
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
        });
      }
    });
  }

  onCroppedImage(image: string): void {
    this.imageFile = image;
  }

  async submit(): Promise<void> {
    this.isProcessing = true;
    const formData = this.form.value;
    const eventData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      ownerId: this.uid,
      participantCount: this.event ? this.event.participantCount : 0,
      reserveUserCount: this.event ? this.event.reserveUserCount : 0,
      startAt: formData.startAt,
      exitAt: formData.exitAt,
      createdAt: firebase.firestore.Timestamp.now(),
    };

    if (!this.event) {
      if (this.imageFile !== undefined) {
        await this.eventService
          .createEvent(eventData, this.imageFile, this.uid)
          .finally(() => (this.isProcessing = false));
      } else {
        const defaultImage = 'assets/images/default-image.jpg';
        await this.eventService
          .createEvent(eventData, defaultImage, this.uid)
          .finally(() => (this.isProcessing = false));
      }
    } else {
      if (this.imageFile !== undefined) {
        await this.eventService
          .updateEvent(this.eventId, eventData, this.imageFile)
          .finally(() => (this.isProcessing = false));
      } else {
        const defaultImage = 'assets/images/default-image.jpg';
        await this.eventService
          .updateEvent(this.eventId, eventData, defaultImage)
          .finally(() => (this.isProcessing = false));
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
