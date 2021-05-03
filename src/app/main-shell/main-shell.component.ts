import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { InviteWithSender } from '../intefaces/invite';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { MeetingService } from '../services/meeting.service';
import { SoundService } from '../services/sound.service';
import firebase from 'firebase/app';
import { MatDialog } from '@angular/material/dialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import { shareReplay, skip, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-main-shell',
  templateUrl: './main-shell.component.html',
  styleUrls: ['./main-shell.component.scss'],
})
export class MainShellComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  user$: Observable<User> = this.authService.user$;
  user: User;

  invites$: Observable<InviteWithSender[]>;
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  constructor(
    private meetingService: MeetingService,
    private soundService: SoundService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.user$
        .pipe(
          switchMap((user) => {
            this.user = user;
            return this.meetingService.getInvites(user.uid);
          }),
          skip(1),
          shareReplay(1)
        )
        .subscribe((invites) => {
          const lastInvite = invites.shift();

          if (lastInvite.createdAt.toMillis() >= this.dateNow.toMillis()) {
            this.soundService.callSound.play();
            console.log(lastInvite);

            this.dialog.open(InviteDialogComponent, {
              data: { lastInvite, user: this.user },
            });
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
