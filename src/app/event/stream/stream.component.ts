import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AgoraService } from 'src/app/services/agora.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';

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

  participants$: Observable<User[]>;
  event$: Observable<Event>;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private agoraService: AgoraService,
    private router: Router,
    private snackBar: MatSnackBar,
    private eventService: EventService
  ) {}

  ngOnDestroy(): void {
    if (this.isJoin) {
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
  }

  ngOnInit(): void {
    this.streamInit();
  }

  streamInit() {
    this.agoraService.joinAgoraChannel(this.uid, this.eventId).then(() => {
      this.isJoin = true;
    });
    this.participants$ = this.agoraService.getParticipants(this.eventId);
    this.players = true;
    this.event$ = this.eventService.getEvent(this.eventId);
  }

  async leaveChannel(): Promise<void> {
    this.agoraService
      .leaveAgoraChannel(this.eventId)
      .then(() => {
        this.isJoin = false;
        this.snackBar.open('退室しました');
      })
      .finally(() => {
        this.router.navigateByUrl('/');
      });
  }

  async publishAudio(): Promise<void> {
    this.agoraService.publishMicrophone().then(() => {
      this.snackBar.open('音声をオンにしました');
      this.isPublishMicrophone = true;
    });
    this.players = true;
  }

  async unPublishAudio(): Promise<void> {
    this.agoraService.unpublishMicrophone().then(() => {
      this.snackBar.open('音声をミュートしました');
      this.isPublishMicrophone = false;
    });
  }

  async publishVideo(): Promise<void> {
    if (this.isPublishScreen) {
      await this.agoraService
        .unpublishScreen(this.eventId, this.uid)
        .then(() => {
          this.isPublishScreen = false;
        });
    }
    this.agoraService.publishVideo().then(() => {
      this.snackBar.open('カメラをオンにしました');
      this.isPublishVideo = true;
    });
    this.players = true;
  }

  async unPublishVideo(): Promise<void> {
    this.agoraService.unpublishVideo().then(() => {
      this.snackBar.open('カメラをオフにしました');
      this.isPublishVideo = false;
    });
  }

  async publishScreen(): Promise<void> {
    if (this.isPublishVideo) {
      await this.agoraService.unpublishVideo().then(() => {
        this.isPublishVideo = false;
      });
    }
    this.agoraService.publishScreen(this.eventId, this.uid).then(() => {
      this.snackBar.open('画面共有をオンにしました');
      this.isPublishScreen = true;
    });
  }

  async unPublishScreen(): Promise<void> {
    this.agoraService.unpublishScreen(this.eventId, this.uid).then(() => {
      this.snackBar.open('画面共有をオフにしました');
      this.isPublishScreen = false;
    });
  }

  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    if (this.isJoin) {
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
  }
  @HostListener('window:unload')
  unloadHandler() {
    if (this.isJoin) {
      this.agoraService.leaveAgoraChannel(this.eventId);
    }
  }
}
