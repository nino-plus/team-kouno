import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

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
    startTime: ['', [Validators.required]],
    exitTime: [''],
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}

  onCroppedImage(image: string): void {
    this.imageFile = image;
  }

  submit(): void {}
}
