import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Event } from '../interfaces/event';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ReserveUid } from '../interfaces/reserve-uid';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async createEvent(
    event: Omit<Event, 'eventId' | 'thumbnailURL' | 'updatedAt'>,
    thumbnailURL: string
  ): Promise<void> {
    const id = this.db.createId();
    const image = await this.setThumbnailToStorage(id, thumbnailURL);
    await this.db
      .doc<Event>(`events/${id}`)
      .set({
        ...event,
        eventId: id,
        updatedAt: firebase.default.firestore.Timestamp.now(),
        thumbnailURL: image,
      })
      .then(() => {
        this.snackBar.open('イベントを作成しました！');
        this.router.navigateByUrl('/');
      });
  }

  async setThumbnailToStorage(eventId: string, file: string): Promise<string> {
    const result = await this.storage
      .ref(`events/${eventId}`)
      .putString(file, firebase.default.storage.StringFormat.DATA_URL);
    return result.ref.getDownloadURL();
  }

  getEvents(): Observable<Event[]> {
    return this.db.collection<Event>(`events`).valueChanges();
  }

  getEvent(eventId: string): Observable<Event> {
    return this.db.doc<Event>(`events/${eventId}`).valueChanges();
  }

  async updateEvent(
    eventId: string,
    event: Omit<Event, 'eventId' | 'thumbnailURL' | 'updatedAt'>,
    thumbnailURL: string
  ): Promise<void> {
    const image = await this.setThumbnailToStorage(eventId, thumbnailURL);
    await this.db.doc<Event>(`events/${eventId}`).set(
      {
        ...event,
        eventId,
        updatedAt: firebase.default.firestore.Timestamp.now(),
        thumbnailURL: image,
      },
      {
        merge: true,
      }
    );
  }

  async reserveEvent(event: Event, uid: string): Promise<void> {
    this.db
      .doc<ReserveUid>(`events/${event.eventId}/reserveUids/${uid}`)
      .set({
        uid,
        eventId: event.eventId,
      })
      .then(() => this.snackBar.open('イベントを予約しました'))
      .finally(() => this.router.navigateByUrl('/'));
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.db
      .doc<Event>(`events/${eventId}`)
      .delete()
      .then(() => {
        this.snackBar.open('イベントを削除しました');
        this.router.navigateByUrl('/');
      });
  }
}
