import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Event } from '../interfaces/event';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  async createEvent(
    event: Omit<Event, 'eventId' | 'thumbnailURL' | 'updatedAt'>,
    thumbnailURL: string
  ): Promise<void> {
    const id = this.db.createId();
    const image = await this.setThumbnailToStorage(id, thumbnailURL);
    await this.db.doc<Event>(`events/${id}`).set({
      ...event,
      eventId: id,
      updatedAt: firebase.default.firestore.Timestamp.now(),
      thumbnailURL: image,
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
}
