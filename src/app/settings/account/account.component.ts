import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
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
  user: User;
  user$: Observable<User> = this.authService.user$;
  snsList = ['google', 'twitter', 'facebook', 'github'];
  linkedProviders$: Observable<string[]> = this.authService.linkedProviders$;

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private dialog: MatDialog,
    public afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {}

  openDeleteDialog(): void {
    this.dialog
      .open(DeleteDialogComponent, {
        data: { title: '退会しますか？' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.userService.deleteUser(this.user);
        } else {
          return;
        }
      });
  }
}
