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
import { User } from 'src/app/interfaces/user';
import { AgoraService } from 'src/app/services/agora.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit, OnDestroy {
  @Input() uid: string;
  @Input() eventId: string;
  user$: Observable<User> = this.authService.user$;
  channelId$: Observable<string> = this.route.paramMap.pipe(
    map((params) => params.get('channelId'))
  );
  players: any;

  isJoin: boolean;
  isProcessing: boolean;
  isPublishVideo: boolean;
  isPublishMicrophone: boolean;
  isPublishScreen: boolean;

  participants$: Observable<User[]>;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private agoraService: AgoraService,
    private router: Router,
    private snackBar: MatSnackBar
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
    this.agoraService.publishScreen().then(() => {
      this.snackBar.open('画面共有をオンにしました');
      this.isPublishScreen = true;
    });
  }

  async unPublishScreen(): Promise<void> {
    this.agoraService.unpublishScreen().then(() => {
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
