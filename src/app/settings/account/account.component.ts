import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { fade } from 'src/app/animations/animations';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  animations: [fade],
})
export class AccountComponent implements OnInit {
  isOpen = false;
  user$: Observable<User> = this.authService.user$;
  snsList = ['google', 'twitter', 'facebook', 'github'];
  linkedProviders$: Observable<
    string[]
  > = this.authService.linkedProviders$.pipe(
    tap((providers) => (this.linkedProvidersCount = providers.length))
  );
  linkedProvidersCount: number;

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private dialog: MatDialog,
    public afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {}

  openDeleteDialog(user): void {
    this.dialog
      .open(DeleteDialogComponent, {
        data: { title: '退会しますか？' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.userService.deleteUser(user);
        } else {
          return;
        }
      });
  }

  unlinkAccount(brandName: string): void {
    this.authService.unlinkAccount(brandName);
    this.linkedProvidersCount--;
  }
}
