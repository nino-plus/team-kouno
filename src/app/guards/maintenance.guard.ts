import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceGuard implements CanActivate, CanLoad {
  isNotMaintenance$ = this.adminService.isMaintenanceMode$.pipe(
    tap((status) => {
      if (status) {
        this.router.navigate(['maintenance']);
      }
    }),
    map((status) => !status)
  );

  constructor(private adminService: AdminService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.isNotMaintenance$;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.isNotMaintenance$.pipe(take(1));
  }
}
