import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectedAccountService } from '../services/connected-account.service';

@Injectable({
  providedIn: 'root',
})
export class ConnectedAccountGuard implements CanActivate {
  constructor(private connectedAccountService: ConnectedAccountService) {}

  canActivate(): Observable<boolean> {
    return this.connectedAccountService.connectedAccountId$.pipe(
      map((account) => !!account)
    );
  }
}
