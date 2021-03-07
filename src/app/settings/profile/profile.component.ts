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
  imageFile: string;
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(this.nameMaxLength)]],
    email: ['', [Validators.email]],
    description: ['', [Validators.maxLength(this.descriptionMaxLength)]],
  });

  user$: Observable<User> = this.authService.user$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.user = user;
      this.imageFile = user?.avatarURL;
      this.form.patchValue({
        ...user,
      });
    });
  }

  onCroppedImage(image: string): void {
    this.imageFile = image;
  }

  updateUser(): void {
    this.userService
      .updateUser({
        uid: this.user.uid,
        name: this.form.value.name,
        avatarURL: this.imageFile,
        email: this.form.value.email,
        description: this.form.value.description,
        isPrivate: this.user.isPrivate,
      })
      .then(() => this.snackBar.open('ユーザー情報を更新しました'));
  }
}
