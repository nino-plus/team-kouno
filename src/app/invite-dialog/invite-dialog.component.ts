import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InviteWithSender } from '../intefaces/invite';
import { SoundService } from '../services/sound.service';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss'],
})
export class InviteDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lastInvite: InviteWithSender;
    },
    private router: Router,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {}

  stopCall(): void {
    this.soundService.callSound.stop();
  }

  navigateMeetingRoom(): void {
    this.router
      .navigateByUrl(`/meeting/${this.data.lastInvite.roomId}`)
      .then(() => {
        this.soundService.callSound.stop();
      });
  }
}
