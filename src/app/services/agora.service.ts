import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

@Injectable({
  providedIn: 'root',
})
export class AgoraService {
  localPlayer = document.getElementById('local-player');
  agoraAppId: string = environment.agora.appId;
  agoraUid: any;
  localTracks = {
    videoTrack: null,
    audioTrack: null,
    screenTrack: null,
    screenAudioTrack: null,
  };
  remoteUsers = {};
  globalAgoraClient: IAgoraRTCClient | null = null;
  isProcessing: boolean;
  constructor(
    private fnc: AngularFireFunctions,
    private router: Router,
    private snackBar: MatSnackBar,
    private db: AngularFirestore
  ) {}

  async joinAgoraChannel(uid: string, channelName: string) {
    const client = this.getClient();
    const callable = this.fnc.httpsCallable('participateChannel');
    await callable({ channelName })
      .toPromise()
      .catch((error) => {
        console.log(error);
        this.router.navigate(['/']);
      });
    if (!uid) {
      throw new Error('channel name is required.');
    }
    const token: any = await this.getToken(channelName);

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      const remoteUserId = user.uid;
      if (mediaType === 'video') {
        // const playerElement = document.createElement('div');

        // document.getElementById('remote-player-list').append(playerElement);
        // playerElement.outerHTML = `
        //   <div id="player-wrapper-${remoteUserId}">
        //     <p class="player-name">remoteUser(${remoteUserId})</p>
        //     <div id="player-${remoteUserId}" class="player"></div>
        //   </div>
        // `;

        const remoteTrack = user.videoTrack;
        remoteTrack.play('local-player');
      }
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    });

    await client.join(this.agoraAppId, channelName, token.token, uid);
  }

  async leaveAgoraChannel(channelId: string): Promise<void> {
    const client = this.getClient();
    await this.unpublishAgora();
    await client.leave();
    await this.leaveFromSession(channelId);
  }

  async publishMicrophone(): Promise<void> {
    const client = this.getClient();

    this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([this.localTracks.audioTrack]);
  }

  async unpublishMicrophone(): Promise<void> {
    const client = this.getClient();

    if (this.localTracks.audioTrack) {
      this.localTracks.audioTrack.close();
      client.unpublish([this.localTracks.audioTrack]);
    }
  }

  async publishVideo(): Promise<void> {
    const client = this.getClient();

    this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    this.localTracks.videoTrack.play('local-player');

    await client.publish([this.localTracks.videoTrack]);
  }

  async unpublishVideo(): Promise<void> {
    const client = this.getClient();

    if (this.localTracks.videoTrack) {
      this.localTracks.videoTrack.close();
      client.unpublish([this.localTracks.videoTrack]);
    }
  }

  async publishScreen(): Promise<void> {
    const client = this.getClient();

    AgoraRTC.createScreenVideoTrack({
      encoderConfig: '1080p_1',
    }).then(async (screenTrack) => {
      this.localTracks.screenTrack = screenTrack;
      this.localTracks.screenTrack.play('local-player');
      await client.publish([this.localTracks.screenTrack]);
    });
  }

  async unpublishScreen(): Promise<void> {
    const client = this.getClient();

    if (this.localTracks.screenTrack) {
      this.localTracks.screenTrack.close();
      client.unpublish([this.localTracks.screenTrack]);
    }
  }

  async getToken(channelName): Promise<string> {
    const callable = this.fnc.httpsCallable('getChannelToken');
    const agoraToken = await callable({ channelName })
      .toPromise()
      .catch((error) => {
        this.router.navigate(['/']);
      });
    if (agoraToken) {
      return agoraToken;
    }
  }

  handleUserUnpublished(user): void {
    const id = user.uid;
    delete this.remoteUsers[id];
    const element = document.getElementById(`player-wrapper-${id}`);
    if (element) {
      element.remove();
    }
  }

  async unpublishAgora(): Promise<void> {
    const client = this.getClient();
    if (client.localTracks.length > 0) {
      client.localTracks.forEach((v) => v.close());
      client.unpublish();
    }
  }

  async leaveFromSession(channelName: string): Promise<void> {
    const callable = this.fnc.httpsCallable('leaveFromSession');
    await callable({ channelName })
      .toPromise()
      .catch((error) => {
        console.log(channelName);
        console.log(error);
        this.router.navigate(['/']);
      });
  }

  getClient(): IAgoraRTCClient {
    if (!this.globalAgoraClient) {
      const newClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      this.globalAgoraClient = newClient;
    }
    return this.globalAgoraClient;
  }

  getParticipants(channelId: string): Observable<User[]> {
    return this.db
      .collection<User>(`channels/${channelId}/participants`)
      .valueChanges();
  }
}
