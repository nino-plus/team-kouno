import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { flatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import { Log, LogWithUser } from '../interfaces/log';
import { User } from '../interfaces/user';
import { UserFollowService } from './user-follow.service';
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
        const logs$: Observable<Log[][]> = combineLatest(
          followings.map((follow: User) => this.getLogs(follow.uid))
        );
        return combineLatest([logs$, of(followings)]);
      }),
      mergeMap(([logsArray, users]) => {
        if (logsArray?.length) {
          return logsArray.map((logs: Log[]) => {
            return logs.map((log: Log) => {
              return {
                ...log,
                user: users.find((user: User) => log.uid === user?.uid),
              };
            });
          });
        } else {
          return [];
        }
      })
    );
  }
}
