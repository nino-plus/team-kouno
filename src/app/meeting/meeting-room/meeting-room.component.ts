import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay, take, tap } from 'rxjs/operators';
import { Room } from 'src/app/interfaces/room';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';

@Component({
  selector: 'app-meeting-room',
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss'],
})
export class MeetingRoomComponent implements OnInit, AfterViewInit {
  @ViewChild('webcamVideo') webcamVideo: HTMLVideoElement;
  @ViewChild('remoteVideo') remoteVideo: HTMLVideoElement;

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

  readonly roomId = this.route.snapshot.paramMap.get('roomId');
  room$: Observable<Room> = this.meetingService.getRoom(this.roomId);
  room: Room;

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private authService: AuthService,
    private meetingService: MeetingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerPeerConnectionListeners();
  }

  ngAfterViewInit(): void {
    this.snapshotRoom().then((room) => {
      this.isOwner = this.authService.uid === room?.ownerId;
      this.publishWebcam().then(() => {
        if (this.isOwner) {
          setTimeout(() => {
            this.createRoom();
          }, 500);
        }
      });
    });
  }

  async snapshotRoom(): Promise<Room> {
    const room = await this.room$.pipe(take(1)).toPromise();
    return room;
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

    // this.webcamVideo.srcObject = this.localStream;
    // this.remoteVideo.srcObject = this.remoteStream;

    this.isPublishWebcam = true;
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
        owenerId: this.authService.uid,
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
          let data = change.doc.data();
          this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

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
}
