import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import firebase from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, skip, switchMap } from 'rxjs/operators';
import {
  easeSlideForContent,
  easeSlideForSideNav,
} from '../animations/animations';
import { InviteWithSender } from '../intefaces/invite';
import { User } from '../interfaces/user';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import { AuthService } from '../services/auth.service';
import { MeetingService } from '../services/meeting.service';
import { SoundService } from '../services/sound.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-main-shell',
  templateUrl: './main-shell.component.html',
  styleUrls: ['./main-shell.component.scss'],
  animations: [easeSlideForSideNav, easeSlideForContent],
})
export class MainShellComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscription = new Subscription();
  user$: Observable<User> = this.authService.user$;
  user: User;

  invites$: Observable<InviteWithSender[]>;
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  @ViewChild('scrollWrap') scrollWrap: MatSidenavContent;
  @ViewChild(CdkScrollable) scrollable: CdkScrollable;

  constructor(
    private meetingService: MeetingService,
    private soundService: SoundService,
    private dialog: MatDialog,
    private authService: AuthService,
    public uiService: UiService,
    private observer: BreakpointObserver,
    public scroll: ScrollDispatcher
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.user$
        .pipe(
          switchMap((user) => {
            this.user = user;
            return this.meetingService.getInvites(user?.uid);
          }),
          skip(1),
          shareReplay(1)
        )
        .subscribe((invites) => {
          const lastInvite = invites.shift();

          if (lastInvite.createdAt.toMillis() >= this.dateNow.toMillis()) {
            this.soundService.callSound.play();

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

  ngAfterViewInit(): void {
    this.observer.observe(['(max-width: 700px)']).subscribe((res) => {
      setTimeout(() => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
    });

    this.uiService.scrollWrapperElement = this.scrollWrap.getElementRef().nativeElement;
  }
}
