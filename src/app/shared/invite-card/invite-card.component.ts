import { Component, Input, OnInit } from '@angular/core';
import { fade } from 'src/app/animations/animations';
import { InviteWithSender } from 'src/app/intefaces/invite';

@Component({
  selector: 'app-invite-card',
  templateUrl: './invite-card.component.html',
  styleUrls: ['./invite-card.component.scss'],
  animations: [fade],
})
export class InviteCardComponent implements OnInit {
  @Input() invite: InviteWithSender;

  constructor() {}

  ngOnInit(): void {}
}
