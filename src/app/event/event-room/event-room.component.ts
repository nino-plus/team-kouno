import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Event, EventWithOwner } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AgoraService } from 'src/app/services/agora.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { SoundService } from 'src/app/services/sound.service';
import { UiService } from 'src/app/services/ui.service';
import { ShareScreenInfoDialogComponent } from 'src/app/shared/share-screen-info-dialog/share-screen-info-dialog.component';

@Component({
  selector: 'app-event-room',
  templateUrl: './event-room.component.html',
  styleUrls: ['./event-room.component.scss'],
})
export class EventRoomComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('target') target: ElementRef;
  readonly subscription = new Subscription();
  eventId: string;
  user$: Observable<User> = this.authService.user$;
  eventWithOwner$: Observable<EventWithOwner>;
  uid: string;
  isOpen = true;

  players: any;

  isJoin: boolean = true;
  isProcessing: boolean;
  isPublishVideo: boolean;
  isPublishMicrophone: boolean;
  isPublishScreen: boolean;
  isPcScreen = this.uiService.isLargeScreen();

  isShareScreen$: Observable<boolean>;
  participants$: Observable<User[]>;
  participants: User[];
  event$: Observable<Event>;
  videoPublishUserIds: string[];
  videoPublishUserIds$: Observable<string[]>;
  participantCount$: Observable<number>;
  participantCount: number;

  roomChildren: User[][];
  scrollWidth: number = 0;
  leftPosition: number = 0;

  isFullScreen: boolean;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private eventService: EventService,
    private agoraService: AgoraService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public uiService: UiService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.params.channelId;
    this.uid = this.route.snapshot.params.uid;
    this.eventWithOwner$ = this.eventService.getEventWithOwner(this.eventId);
    this.streamInit();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.uiService.scrollWidth = this.target.nativeElement.offsetWidth;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.isJoin) {
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
    this.subscription.unsubscribe();
  }

  streamInit(): void {
    this.isProcessing = true;
    this.agoraService.joinAgoraChannel(this.uid, this.eventId).then(() => {
      this.isJoin = true;
      this.isProcessing = false;
    });
    this.participants$ = this.agoraService.getParticipants(this.eventId);
    this.players = true;
    this.event$ = this.eventService.getEvent(this.eventId);
    this.videoPublishUserIds$ = this.eventService.getVideoPublishUserIds(
      this.eventId
    );
    if (this.isJoin) {
      this.participantCount$ = this.eventService.getParticipantCount(
        this.eventId
      );

      this.subscription.add(
        this.participants$.subscribe((participants) => {
          this.participants = participants;
          this.roomChildren = this.sliceParticipants(this.participants);

          this.participantCount$.pipe(shareReplay(1)).subscribe((num) => {
            this.participantCount = num;
          });

          if (participants.length > this.participantCount) {
            this.soundService.joinSound.play();
          }
          if (participants.length < this.participantCount) {
            this.soundService.exitSound.play();
          }
        })
      );
    }
  }

  sliceParticipants([...participants]: User[]): User[][] {
    return participants.reduce(
      (acc, value, index) =>
        index % 20 ? acc : [...acc, participants.slice(index, index + 20)],
      []
    );
  }

  scrollRight(): void {
    this.target.nativeElement.scrollLeft += this.uiService.scrollWidth + 24;
    this.leftPosition = this.target.nativeElement.scrollLeft +=
      this.uiService.scrollWidth + 24;
  }

  scrollLeft(): void {
    this.target.nativeElement.scrollLeft -= this.uiService.scrollWidth + 24;
    this.leftPosition = this.target.nativeElement.scrollLeft -=
      this.uiService.scrollWidth + 24;
  }

  goFullscreen(): void {
    const channel = document.getElementById('channel');
    this.uiService.scrollWidth = window.innerWidth;
    channel.requestFullscreen();
    this.isFullScreen = true;
  }

  exitFullscreen(): void {
    document.exitFullscreen();
    this.isFullScreen = false;
  }

  async leaveChannel(): Promise<void> {
    this.isProcessing = true;
    this.isJoin = false;
    this.agoraService
      .leaveAgoraChannel(this.eventId)
      .then(() => {
        this.isProcessing = false;
        this.snackBar.open('退室しました');
        this.soundService.exitSound.play();
      })
      .finally(() => {
        this.router.navigateByUrl('/');
      });
  }

  async publishAudio(): Promise<void> {
    this.isProcessing = true;
    this.agoraService.publishMicrophone().then(() => {
      this.isPublishMicrophone = true;
      this.isProcessing = false;
    });
    this.players = true;
  }

  async unPublishAudio(): Promise<void> {
    this.isProcessing = true;
    this.agoraService.unpublishMicrophone().then(() => {
      this.isPublishMicrophone = false;
      this.isProcessing = false;
    });
  }

  async publishVideo(): Promise<void> {
    this.isProcessing = true;
    if (this.isPublishScreen) {
      await this.agoraService
        .unpublishScreen(this.eventId, this.uid)
        .then(() => {
          this.isPublishScreen = false;
        });
    }
    await this.agoraService.publishMicrophone().then(() => {
      this.isPublishMicrophone = true;
    });
    this.agoraService.publishVideo(this.eventId).then(() => {
      this.isPublishVideo = true;
      this.isProcessing = false;
    });
    this.players = true;
  }

  async unPublishVideo(): Promise<void> {
    this.isProcessing = true;
    this.agoraService.unpublishVideo(this.eventId).then(() => {
      this.isPublishVideo = false;
      this.isProcessing = false;
    });
  }

  async publishScreen(): Promise<void> {
    this.isProcessing = true;
    if (this.isPublishVideo) {
      await this.agoraService.unpublishVideo(this.eventId).then(() => {
        this.isPublishVideo = false;
      });
    }
    this.agoraService.publishScreen(this.eventId, this.uid).then((isError) => {
      if (isError) {
        this.dialog.open(ShareScreenInfoDialogComponent);
      } else {
        this.isPublishScreen = true;
      }
      this.isProcessing = false;
    });
  }

  async unPublishScreen(): Promise<void> {
    this.isProcessing = true;
    this.agoraService.unpublishScreen(this.eventId, this.uid).then(() => {
      this.isPublishScreen = false;
      this.isProcessing = false;
    });
  }

  // @HostListener('window:unload', ['$event'])
  // unloadHandler($event: any): void {
  //   if (this.isJoin) {
  //     $event.preventDefault();
  //     $event.returnValue = false;
  //     this.agoraService.leaveAgoraChannel(this.eventId);
  //   }
  // }

  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler($event: any): void {
  //   if (this.isJoin) {
  //     $event.preventDefault();
  //     $event.returnValue = false;
  //     this.agoraService.leaveAgoraChannel(this.eventId);
  //   }
  // }
}
