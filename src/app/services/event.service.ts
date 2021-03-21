import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Event, EventWithOwner } from '../interfaces/event';
import * as firebase from 'firebase';
import { combineLatest, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ReserveUid } from '../interfaces/reserve-uid';
import { switchMap, map, take, filter } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  dateNow: firebase.default.firestore.Timestamp = firebase.default.firestore.Timestamp.now();

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private snackBar: MatSnackBar,
    private router: Router,
    private userService: UserService
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

  getFutureEvents(): Observable<Event[]> {
    return this.db
      .collection<Event>(`events`, (ref) =>
        ref.where('exitAt', '>=', this.dateNow).orderBy('exitAt', 'asc')
      )
      .valueChanges();
  }

  getPastEvents(): Observable<Event[]> {
    return this.db
      .collection<Event>(`events`, (ref) =>
        ref.where('exitAt', '<', this.dateNow).orderBy('exitAt', 'asc')
      )
      .valueChanges();
  }

  getEvent(eventId: string): Observable<Event> {
    return this.db.doc<Event>(`events/${eventId}`).valueChanges();
  }

  getReservedUsers(eventId: string): Observable<User[]> {
    return this.db
      .collection<ReserveUid>(`events/${eventId}/reserveUids`)
      .valueChanges()
      .pipe(
        switchMap((datas) => {
          if (datas.length) {
            return combineLatest(
              datas.map((data) => this.userService.getUserData(data.uid))
            );
          } else {
            return of(null);
          }
        })
      );
  }

  getReaservedUids(eventId: string): Observable<string[]> {
    return this.db
      .collection<ReserveUid>(`events/${eventId}/reserveUids`)
      .valueChanges()
      .pipe(
        map((uids) => {
          return uids.map((data) => data.uid);
        })
      );
  }

  async updateEvent(
    eventId: string,
    event: Omit<Event, 'eventId' | 'thumbnailURL' | 'updatedAt'>,
    thumbnailURL: string
  ): Promise<void> {
    const image = await this.setThumbnailToStorage(eventId, thumbnailURL);
    await this.db
      .doc<Event>(`events/${eventId}`)
      .set(
        {
          ...event,
          eventId,
          updatedAt: firebase.default.firestore.Timestamp.now(),
          thumbnailURL: image,
        },
        {
          merge: true,
        }
      )
      .then(() => this.snackBar.open('イベントを更新しました'))
      .finally(() => this.router.navigateByUrl('/'));
  }

  async updateScreenFlag(
    eventId: string,
    state: boolean,
    uid?: string
  ): Promise<void> {
    if (state) {
      await this.db
        .doc<Event>(`events/${eventId}`)
        .update({ isShareScreen: state, screenOwnerUid: uid });
    } else {
      await this.db
        .doc<Event>(`events/${eventId}`)
        .update({ isShareScreen: state, screenOwnerUid: null });
    }
  }

  getScreenOwnerId(eventId: string): Promise<string> {
    return this.db
      .doc<Event>(`events/${eventId}`)
      .valueChanges()
      .pipe(
        take(1),
        map((event) => event.screenOwnerUid)
      )
      .toPromise();
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

  async cancelReserve(event: Event, uid: string): Promise<void> {
    this.db
      .doc<ReserveUid>(`events/${event.eventId}/reserveUids/${uid}`)
      .delete()
      .then(() => this.snackBar.open('予約をキャンセルしました'))
      .finally(() => this.router.navigateByUrl('/'));
  }

  getReservedEvents(uid: string): Observable<Event[]> {
    if (!uid) {
      return of(null);
    }
    return this.db
      .collectionGroup<ReserveUid>('reserveUids', (ref) =>
        ref.where('uid', '==', uid)
      )
      .valueChanges()
      .pipe(
        switchMap((reserveDatas) => {
          if (reserveDatas.length) {
            return combineLatest(
              reserveDatas.map((data) => this.getEvent(data.eventId))
            );
          } else {
            return of(null);
          }
        })
      );
  }

  getFutureReservedEvents(uid: string): Observable<Event[]> {
    const allEvents = this.getReservedEvents(uid);
    return allEvents.pipe(
      map((events) => events.filter((event) => event?.exitAt > this.dateNow)),
      filter((events) => events && events.length > 0)
    );
  }

  getPastReservedEvents(uid: string): Observable<Event[]> {
    const allEvents = this.getReservedEvents(uid);
    return allEvents.pipe(
      map((events) => events.filter((event) => event?.exitAt < this.dateNow)),
      filter((events) => events && events.length > 0)
    );
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

  getVideoPublishUserIds(eventId: string): Observable<string[]> {
    return this.db
      .collection<User>(`events/${eventId}/videoPublishUsers`)
      .valueChanges()
      .pipe(map((users: User[]) => users.map((user) => user.uid)));
  }

  getEventWithOwner(eventId: string): Observable<EventWithOwner> {
    return this.db
      .doc<Event>(`events/${eventId}`)
      .valueChanges()
      .pipe(
        switchMap((event) => {
          const user$ = this.userService.getUserData(event.ownerId);
          return combineLatest([of(event), user$]);
        }),
        map(([event, user]) => {
          return { ...event, user };
        })
      );
  }

  getOwnerEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Event>('events', (ref) =>
        ref.where('ownerId', '==', uid).orderBy('startAt', 'asc')
      )
      .valueChanges();
  }
}
