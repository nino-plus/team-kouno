import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import * as firebase from 'firebase';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
})
export class EventFormComponent implements OnInit {
  readonly NAME_MAX_LENGTH = 20;
  readonly DESCRIPTION_MAX_LENGTH = 200;
  readonly PASS_MIN_LENGTH = 6;
  oldImageUrl = '';
  imageFile: string;
  isProcessing: boolean;
  uid: string;

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
    { value: '音楽' },
    { value: 'フード' },
    { value: 'ビジネス' },
    { value: 'プログラミング' },
    { value: 'アウトドア' },
    { value: '健康' },
    { value: '政治経済' },
    { value: 'モノづくり' },
    { value: '総合' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe((user: User) => {
      this.uid = user.uid;
    });
  }

  onCroppedImage(image: string): void {
    this.imageFile = image;
  }

  async submit(): Promise<void> {
    this.isProcessing = true;
    const formData = this.form.value;
    console.log(formData);
    const eventData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      ownerId: this.uid,
      participantCount: 0,
      startAt: formData.startAt,
      exitAt: formData.exitAt,
      createdAt: firebase.default.firestore.Timestamp.now(),
    };

    if (this.imageFile !== undefined) {
      await this.eventService
        .createEvent(eventData, this.imageFile)
        .then(() => {
          this.snackBar.open('イベントを作成しました！');
          this.router.navigateByUrl('/');
        })
        .finally(() => (this.isProcessing = false));
    } else {
      const defaultImage = 'assets/images/default-image.jpg';
      await this.eventService
        .createEvent(eventData, defaultImage)
        .then(() => {
          this.snackBar.open('イベントを作成しました！');
          this.router.navigateByUrl('/');
        })
        .finally(() => (this.isProcessing = false));
    }
  }
}
