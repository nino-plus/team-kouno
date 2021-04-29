import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Log, LogWithUser } from '../interfaces/log';
import { User } from '../interfaces/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private db: AngularFirestore, private userService: UserService) {}

  getLogs(uid: string): Observable<Log[]> {
    return this.db
      .collectionGroup<Log>(`logs`, (ref) =>
        ref.where('uid', '==', uid).orderBy('createdAt', 'desc')
      )
      .valueChanges();
  }

  getLogsWithUser(uid: string): Observable<LogWithUser[]> {
    const followings$ = this.userService.getFollowings(uid);
    return followings$.pipe(
      switchMap((followings: User[]) => {
        const logs$: Observable<Log[]> = combineLatest(
          followings?.map((follow: User) => this.getLogs(follow.uid))
        ).pipe(
          map((logs) => {
            return [].concat(...logs);
          })
        );
        return combineLatest([logs$, followings$]);
      }),
      map(([logs, users]) => {
        if (logs?.length) {
          return logs.map((log) => {
            return {
              ...log,
              user: users.find((user: User) => log.uid === user?.uid),
            };
          });
        } else {
          return [];
        }
      })
    );
  }
}
