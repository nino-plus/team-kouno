import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {
  buttonText = this.data.buttonText ? this.data.buttonText : 'はい';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      text: string;
      buttonText?: string;
    }
  ) {}

  ngOnInit(): void {}
}
