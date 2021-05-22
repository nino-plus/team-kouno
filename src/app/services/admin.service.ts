import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  isMaintenanceMode$: Observable<boolean> = this.db
    .doc(`system/maintenance`)
    .valueChanges()
    .pipe(
      map((data: any) => data?.status),
      shareReplay(1)
    );

  constructor(private db: AngularFirestore) {}
}
