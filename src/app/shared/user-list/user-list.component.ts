import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users$ = this.userService.getUsers();

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {}

  call(uid: string) {
    this.router.navigate(['meeting']);
  }
}
