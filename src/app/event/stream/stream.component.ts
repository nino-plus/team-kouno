import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AgoraService } from 'src/app/services/agora.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { ShareScreenInfoDialogComponent } from 'src/app/shared/share-screen-info-dialog/share-screen-info-dialog.component';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit, OnDestroy {
  @Input() uid: string;
  @Input() eventId: string;
  user$: Observable<User> = this.authService.user$;
  players: any;

  isJoin: boolean;
  isProcessing: boolean;
  isPublishVideo: boolean;
  isPublishMicrophone: boolean;
  isPublishScreen: boolean;

  isShareScreen$: Observable<boolean>;
  participants$: Observable<User[]>;
  event$: Observable<Event>;
  videoPublishUserIds: string[];
  videoPublishUserIds$: Observable<string[]>;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private agoraService: AgoraService,
    private router: Router,
    private snackBar: MatSnackBar,
    private eventService: EventService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    if (this.isJoin) {
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
  }

  ngOnInit(): void {
    this.streamInit();
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
  }

  async leaveChannel(): Promise<void> {
    this.isProcessing = true;
    this.isJoin = false;
    this.agoraService
      .leaveAgoraChannel(this.eventId)
      .then(() => {
        this.isProcessing = false;
        this.snackBar.open('退室しました');
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

  @HostListener('window:unload', ['$event'])
  unloadHandler($event: any): void {
    if (this.isJoin) {
      $event.preventDefault();
      $event.returnValue = false;
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler($event: any): void {
    if (this.isJoin) {
      $event.preventDefault();
      $event.returnValue = false;
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
  }
}
