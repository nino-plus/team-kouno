import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  user: User;
  isOpen = false;

  constructor(
    public userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
