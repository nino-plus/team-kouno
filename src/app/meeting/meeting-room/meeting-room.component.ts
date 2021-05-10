import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { shareReplay, skip, take } from 'rxjs/operators';
import { Reject } from 'src/app/interfaces/reject';
import { Room } from 'src/app/interfaces/room';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { SoundService } from 'src/app/services/sound.service';
import firebase from 'firebase/app';
import { RejectDialogComponent } from 'src/app/reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-meeting-room',
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss'],
})
export class MeetingRoomComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('webcamVideo') webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo: ElementRef<HTMLVideoElement>;
  localVideo: HTMLElement;

  private subscription = new Subscription();

  readonly servers: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  peerConnection = new RTCPeerConnection(this.servers);
  localStream: MediaStream = null;
  remoteStream: MediaStream = null;

  isPublishWebcam: boolean;
  isCreateRoom: boolean;

  isLocalMute: boolean = true;
  isRemoteMute: boolean;
  isOwner: boolean;

  isPublishVideo: boolean;
  isPublishMicrophone: boolean;

  readonly roomId = this.route.snapshot.paramMap.get('roomId');
  room$: Observable<Room> = this.meetingService.getRoom(this.roomId);
  room: Room;

  myStatus: {
    videoPublish: boolean;
    voicePublish: boolean;
  } = { videoPublish: true, voicePublish: true };

  remoteStatus: {
    videoPublish: boolean;
    voicePublish: boolean;
  };
  rejects$: Observable<Reject[]>;
  dateNow: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private authService: AuthService,
    private meetingService: MeetingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private soundService: SoundService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.registerPeerConnectionListeners();
  }

  ngAfterViewInit(): void {
    this.roomInit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async snapshotRoom(): Promise<Room> {
    const room = await this.room$.pipe(take(1)).toPromise();
    this.isOwner = this.authService.uid === room?.ownerId;
    return room;
  }

  checkToMediaStatus() {
    this.snapshotRoom().then((room) => {
      if (this.isOwner) {
        this.subscription.add(
          this.room$.subscribe((room) => {
            if (this.localStream) {
              this.localStream.getVideoTracks()[0].enabled =
                room.ownerStatus.videoPublish;
              this.localStream.getAudioTracks()[0].enabled =
                room.ownerStatus.voicePublish;
            }
            if (this.remoteStream) {
              this.remoteStream.getVideoTracks()[0].enabled =
                room.guestStatus.videoPublish;
              this.remoteStream.getAudioTracks()[0].enabled =
                room.guestStatus.voicePublish;
            }
            (this.myStatus = room.ownerStatus),
              (this.remoteStatus = room.guestStatus);
          })
        );
      } else {
        this.subscription.add(
          this.room$.subscribe((room) => {
            if (this.remoteStream) {
              this.remoteStream.getVideoTracks()[0].enabled =
                room.ownerStatus.videoPublish;
              this.remoteStream.getAudioTracks()[0].enabled =
                room.ownerStatus.voicePublish;
            }
            if (this.localStream) {
              this.localStream.getVideoTracks()[0].enabled =
                room.guestStatus.videoPublish;
              this.localStream.getAudioTracks()[0].enabled =
                room.guestStatus.voicePublish;
            }
            (this.myStatus = room.guestStatus),
              (this.remoteStatus = room.ownerStatus);
          })
        );
      }
    });
  }

  roomInit() {
    this.snapshotRoom().then((room) => {
      this.publishWebcam().then(() => {
        if (this.isOwner) {
          setTimeout(() => {
            this.createRoom();
          }, 500);
        }
      });

      this.rejects$ = this.meetingService.getRejects(room.ownerId);
      this.subscription.add(
        this.rejects$.pipe(skip(1), shareReplay(1)).subscribe((rejects) => {
          const lastReject = rejects.shift();

          if (lastReject.createdAt.toMillis() >= this.dateNow.toMillis()) {
            this.soundService.callSound.stop();
            this.dialog.open(RejectDialogComponent, {
              data: { lastReject },
            });
          }
        })
      );
    });
  }

  async publishWebcam() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    await this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Pull tracks from remote stream, add to video stream
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    this.isPublishWebcam = true;
    this.isPublishVideo = true;
    this.isPublishMicrophone = true;
  }

  async createRoom() {
    const roomRef = this.db.doc(`rooms/${this.roomId}`)
      .ref as DocumentReference<Room>;
    const answerCandidates = roomRef.collection('answerCandidates');
    const offerCandidates = roomRef.collection('offerCandidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        offerCandidates.add(event.candidate.toJSON());
      }
    };

    // Create offer
    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await this.db.doc(`rooms/${this.roomId}`).set(
      {
        offer,
      },
      { merge: true }
    );

    roomRef.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!this.peerConnection.currentRemoteDescription && data?.answer) {
        const answer = new RTCSessionDescription(data.answer);
        this.peerConnection.setRemoteDescription(answer);
      }
    });

    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          this.checkToMediaStatus();
          this.soundService.callSound.stop();
          let data = change.doc.data();
          this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    this.detectClosed();
    this.isCreateRoom = true;
  }

  async answer() {
    const roomId = this.roomId;
    const roomRef = this.db.doc(`rooms/${roomId}`).ref;
    const roomSnapshot = (await roomRef.get()) as DocumentSnapshot<Room>;
    const answerCandidates = roomRef.collection('answerCandidates');
    const offerCandidates = roomRef.collection('offerCandidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        answerCandidates.add(event.candidate.toJSON());
      }
    };

    const roomData = roomSnapshot.data();

    const offerDescription = roomData.offer;
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );
    const answerDescription = await this.peerConnection.createAnswer();

    await this.peerConnection.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await roomRef.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          this.checkToMediaStatus();
          let data = change.doc.data();
          this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    this.isCreateRoom = true;
    this.detectClosed();
  }

  detectClosed() {
    this.db
      .doc<Room>(`rooms/${this.roomId}`)
      .valueChanges()
      .pipe(shareReplay(1))
      .subscribe((room) => {
        if (!room) {
          this.closeVideoCall();
          this.snackBar.open('通話が終了されました');
        }
      });
  }

  async Hangup() {
    const roomId = this.roomId;
    const roomRef = this.db.doc(`rooms/${roomId}`).ref;

    const offerCandidates = await roomRef.collection('offerCandidates').get();
    offerCandidates.forEach(async (candidate) => {
      await candidate.ref.delete();
    });
    const answerCandidates = await roomRef.collection('answerCandidates').get();
    answerCandidates.forEach(async (candidate) => {
      await candidate.ref.delete();
    });
    await roomRef.delete();

    this.closeVideoCall();
    this.soundService.callSound.stop();
    this.snackBar.open('通話を終了しました');
  }

  closeVideoCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }
    if (this.peerConnection) {
      if (this.peerConnection.iceConnectionState !== 'closed') {
        this.peerConnection.close();
        this.peerConnection = null;
      }
    }

    this.localStream = null;
    this.remoteStream = null;

    this.router.navigate(['/']);
  }

  handleICEConnectionStateChangeEvent(event) {
    switch (this.peerConnection.iceConnectionState) {
      case 'disconnected':
      case 'failed':
        this.closeVideoCall();
        break;
    }
  }

  registerPeerConnectionListeners() {
    this.peerConnection.onicegatheringstatechange = (event) => {
      if (this.peerConnection?.iceGatheringState) {
        console.log(
          `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`
        );
      }
    };

    this.peerConnection.onconnectionstatechange = (event) => {
      if (this.peerConnection?.connectionState) {
        console.log(
          `Connection state change: ${this.peerConnection.connectionState}`
        );
      }
    };

    this.peerConnection.onsignalingstatechange = (event) => {
      if (this.peerConnection?.signalingState) {
        console.log(
          `Signaling state change: ${this.peerConnection.signalingState}`
        );
      }
    };

    this.peerConnection.oniceconnectionstatechange = (event) => {
      this.handleICEConnectionStateChangeEvent(event);
      if (this.peerConnection?.iceConnectionState) {
        console.log(
          `ICE connection state changed: ${this.peerConnection.iceConnectionState}`
        );
      }
    };
  }

  async publishVideo() {
    if (this.isOwner) {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          ownerStatus: {
            videoPublish: true,
          },
        },
        { merge: true }
      );
    } else {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          guestStatus: {
            videoPublish: true,
          },
        },
        { merge: true }
      );
    }

    this.isPublishVideo = true;
    this.myStatus.videoPublish = true;
  }

  async unPublishVideo() {
    console.log('run2');
    if (this.isOwner) {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          ownerStatus: {
            videoPublish: false,
          },
        },
        { merge: true }
      );
    } else {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          guestStatus: {
            videoPublish: false,
          },
        },
        { merge: true }
      );
    }

    this.isPublishVideo = false;
    this.myStatus.videoPublish = false;
  }

  async publishAudio() {
    if (this.isOwner) {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          ownerStatus: {
            voicePublish: true,
          },
        },
        { merge: true }
      );
    } else {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          guestStatus: {
            voicePublish: true,
          },
        },
        { merge: true }
      );
    }

    this.myStatus.voicePublish = true;
  }

  async unPublishAudio() {
    if (this.isOwner) {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          ownerStatus: {
            voicePublish: false,
          },
        },
        { merge: true }
      );
    } else {
      await this.db.doc(`rooms/${this.roomId}`).set(
        {
          guestStatus: {
            voicePublish: false,
          },
        },
        { merge: true }
      );
    }
    this.myStatus.voicePublish = false;
  }
}
