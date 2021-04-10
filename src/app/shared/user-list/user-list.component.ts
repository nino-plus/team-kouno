import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { fade } from 'src/app/animations/animations';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  animations: [fade],
})
export class UserListComponent implements OnInit {
  allUsers$: Observable<User[]> = this.userService.getPublicUsers();
  onlineUsers$: Observable<User[]> = this.userService.getOnlinePublicUsers();
  followings$: Observable<User[]>;
  user$: Observable<User> = this.authService.user$;
  uid: string;
  listSource: string = 'all';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  changeListSource(type: string): void {
    this.listSource = type;

    if (type == 'follow') {
      this.followings$ = this.userService.getFollowings(this.uid);
    }
  }
}
