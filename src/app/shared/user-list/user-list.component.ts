import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users$ = this.userService.getUsers();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private meetingService: MeetingService
  ) {}

  ngOnInit(): void {}

  async call(uid: string) {
    const roomId = await this.meetingService.createEmptyRoom(
      this.authService.uid
    );
    this.meetingService.createInvite(uid, roomId, this.authService.uid);

    this.router.navigate(['meeting', roomId]);
  }
}
