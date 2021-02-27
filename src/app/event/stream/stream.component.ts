import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AgoraService } from 'src/app/services/agora.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss'],
})
export class StreamComponent implements OnInit {
  uid: string;
  user$: Observable<User> = this.authService.user$;
  channelId$: Observable<string> = this.route.paramMap.pipe(
    map((params) => params.get('channelId'))
  );
  channelId: string;
  players: any;

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

  ngOnInit(): void {
    this.streamInit();
  }

  streamInit() {
    this.channelId = this.route.snapshot.params.channelId;
    this.uid = this.route.snapshot.params.uid;
    this.agoraService.joinAgoraChannel(this.uid, this.channelId);
    this.participants$ = this.agoraService.getParticipants(this.channelId);
    this.players = true;
  }

  async leaveChannel(): Promise<void> {
    this.agoraService.leaveAgoraChannel(this.channelId).then(() => {
      this.snackBar.open('退室しました');
    });
    this.router.navigateByUrl('/');
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
}
