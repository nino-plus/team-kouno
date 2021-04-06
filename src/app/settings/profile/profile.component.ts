import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  readonly nameMaxLength = 20;
  readonly descriptionMaxLength = 200;
  user: User;
  oldImageFile: string;
  newImageFile: string;
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(this.nameMaxLength)]],
    email: ['', [Validators.email]],
    description: ['', [Validators.maxLength(this.descriptionMaxLength)]],
  });

  user$: Observable<User> = this.authService.user$;
  isProcessing: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.user = user;
      this.oldImageFile = user?.avatarURL;
      this.form.patchValue({
        ...user,
      });
    });
    console.log(this.newImageFile);
  }

  onCroppedImage(image: string): void {
    this.newImageFile = image;
    console.log(this.newImageFile);
  }

  async updateUser(): Promise<void> {
    this.isProcessing = true;
    const formData = {
      ...this.form.value,
    };
    if (this.newImageFile !== undefined) {
      const value: User = {
        ...formData,
        uid: this.user.uid,
      };
      await this.userService
        .updateAvatar(this.user.uid, this.newImageFile)
        .then(() => {
          this.userService
            .updateUser(value)
            .then(() => (this.isProcessing = false))
            .then(() => this.snackBar.open('ユーザー情報を更新しました'));
        });
    } else {
      await this.userService
        .updateUser(formData)
        .then(() => (this.isProcessing = false))
        .then(() => this.snackBar.open('ユーザー情報を更新しました'));
    }
  }
}
