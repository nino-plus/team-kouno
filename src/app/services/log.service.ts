import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import firestore from 'firebase/app';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Log, LogWithUser } from '../interfaces/log';
import { User } from '../interfaces/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private db: AngularFirestore, private userService: UserService) {}

  getFeedsWithUser(
    uid: string,
    startAt?: QueryDocumentSnapshot<firestore.firestore.DocumentData>
  ): Observable<{
    logsData: LogWithUser[];
    lastDoc: firestore.firestore.DocumentSnapshot<firestore.firestore.DocumentData>;
  }> {
    let lastDoc: firestore.firestore.QueryDocumentSnapshot<firestore.firestore.DocumentData>;
    return this.db
      .collection<Log>(`users/${uid}/feeds`, (ref) => {
        if (startAt) {
          return ref.orderBy('createdAt', 'desc').startAfter(startAt).limit(8);
        } else {
          return ref.orderBy('createdAt', 'desc').limit(8);
        }
      })
      .get()
      .pipe(
        map((result) => result.docs),
        switchMap((docs) => {
          lastDoc = docs[docs.length - 1];
          if (docs.length) {
            const unduplicatedUids: string[] = Array.from(
              new Set(docs.map((doc) => doc.data().uid))
            );
            const users$: Observable<User[]> = combineLatest(
              unduplicatedUids.map((uid) => this.userService.getUserData(uid))
            );
            return combineLatest([of(docs), users$]);
          } else {
            return of([]);
          }
        }),
        map(([logs, users]) => {
          if (logs?.length) {
            return logs.map((log) => {
              return {
                ...log.data(),
                user: users.find((user: User) => log.data().uid === user?.uid),
              };
            });
          } else {
            return [];
          }
        }),
        map((logWithUser) => {
          return {
            logsData: [...logWithUser],
            lastDoc,
          };
        })
      );
  }

  // getLogsWithUser(uid: string): Observable<LogWithUser[]> {
  //   const followings$ = this.userService.getFollowings(uid);
  //   return followings$.pipe(
  //     switchMap((followings: User[]) => {
  //       const logs$: Observable<Log[]> = combineLatest(
  //         followings?.map((follow: User) => this.getLogs(follow.uid))
  //       ).pipe(
  //         map((logs) => {
  //           return [].concat(...logs).sort((a, b) => {
  //             if (a.createdAt < b.createdAt) {
  //               return 1;
  //             } else {
  //               return -1;
  //             }
  //           });
  //         })
  //       );
  //       return combineLatest([logs$, followings$]);
  //     }),
  //     map(([logs, users]) => {
  //       if (logs?.length) {
  //         return logs.map((log) => {
  //           return {
  //             ...log,
  //             user: users.find((user: User) => log.uid === user?.uid),
  //           };
  //         });
  //       } else {
  //         return [];
  //       }
  //     })
  //   );
  // }
}
