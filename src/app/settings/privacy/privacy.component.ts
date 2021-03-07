import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit {
  isPrivate: boolean;
  user$: Observable<User> = this.authService.user$;

  form: FormGroup = this.fb.group({
    isPrivate: [false],
  });

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.isPrivate = user.isPrivate;
      this.form.patchValue({ ...user });
    });
  }

  setPrivacy(uid: string): void {
    const value = this.form.value;
    this.userService.updateIsPrivate(uid, value.isPrivate);
  }
}
