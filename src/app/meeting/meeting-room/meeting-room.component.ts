import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {
  AngularFirestore,
  DocumentReference,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { promise } from 'selenium-webdriver';
import { Room } from 'src/app/interfaces/room';
import { AuthService } from 'src/app/services/auth.service';

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

  readonly peerConnection = new RTCPeerConnection(this.servers);
  localStream = null;
  remoteStream = null;

  isPublishWebcam: boolean;
  isCreateRoom: boolean;

  form = new FormControl('');

  isLocalMute: boolean = true;
  isRemoteMute: boolean;

  readonly roomId = this.route.snapshot.paramMap.get('roomId');

  get formValue() {
    return this.form.value as FormControl;
  }

  constructor(
    private db: AngularFirestore,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerPeerConnectionListeners();
  }

  ngAfterViewInit(): void {
    this.authService.uid;
    this.publishWebcam().then(() => {
      setTimeout(() => {
        this.createRoom();
      }, 500);
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

    await this.db.doc(`rooms/${this.roomId}`).set({
      roomId: this.roomId,
      offer,
    });

    roomRef.onSnapshot((snapshot) => {
      console.log('Got updated room:', snapshot.data());
      const data = snapshot.data();
      if (!this.peerConnection.currentRemoteDescription && data?.answer) {
        console.log('Set remote description: ', data.answer);
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

    // this.db
    //   .collection(`rooms/${this.roomId}/answerCandidates`)
    //   .snapshotChanges()
    //   .pipe(
    //     tap((changes) => {
    //       changes.forEach((change) => {
    //         if (change.payload.type === 'added') {
    //           const candidate = new RTCIceCandidate(change.payload.doc.data());
    //           this.peerConnection.addIceCandidate(candidate);
    //         }
    //       });
    //     })
    //   );

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

    // this.db
    //   .collection(`rooms/${roomId}/offerCandidates`)
    //   .snapshotChanges()
    //   .pipe(
    //     tap((changes) => {
    //       changes.forEach((change) => {
    //         if (change.payload.type === 'added') {
    //           let data = change.payload.doc.data();
    //           this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
    //         }
    //       });
    //     })
    //   );

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === 'added') {
          let data = change.doc.data();
          this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  Hangup() {}

  registerPeerConnectionListeners() {
    this.peerConnection.onicegatheringstatechange = (event) => {
      console.log(
        `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`
      );
    };

    this.peerConnection.onconnectionstatechange = (event) => {
      console.log(
        `Connection state change: ${this.peerConnection.connectionState}`
      );
    };

    this.peerConnection.onsignalingstatechange = (event) => {
      console.log(
        `Signaling state change: ${this.peerConnection.signalingState}`
      );
    };

    this.peerConnection.oniceconnectionstatechange = (event) => {
      console.log(
        `ICE connection state changed: ${this.peerConnection.iceConnectionState}`
      );
    };
  }
}
