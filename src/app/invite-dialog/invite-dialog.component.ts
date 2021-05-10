import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InviteWithSender } from '../intefaces/invite';
import { SoundService } from '../services/sound.service';
import firebase from 'firebase/app';
import { User } from '../interfaces/user';

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
      user: User;
    },
    private router: Router,
    private soundService: SoundService,
    private db: AngularFirestore
  ) {}

  ngOnInit(): void {}

  stopCall(): void {
    this.soundService.callSound.stop();
    const id = this.db.createId();
    const senderUid = this.data.lastInvite.senderUid;

    this.db.doc(`users/${senderUid}/rejects/${id}`).set({
      createdAt: firebase.firestore.Timestamp.now(),
      uid: this.data.user.uid,
      avatarURL: this.data.user.avatarURL,
      name: this.data.user.name,
    });
  }

  navigateMeetingRoom(): void {
    this.router
      .navigateByUrl(`/meeting/${this.data.lastInvite.roomId}`)
      .then(() => {
        this.soundService.callSound.stop();
      });
  }
}
