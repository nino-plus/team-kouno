import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-unfollow-dialog',
  templateUrl: './unfollow-dialog.component.html',
  styleUrls: ['./unfollow-dialog.component.scss']
})
export class UnfollowDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string
  ) { }

  ngOnInit(): void {
  }

}
