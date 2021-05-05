import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { fade } from 'src/app/animations/animations';
import { InviteWithSender } from 'src/app/intefaces/invite';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-invite-card',
  templateUrl: './invite-card.component.html',
  styleUrls: ['./invite-card.component.scss'],
  animations: [fade],
})
export class InviteCardComponent implements OnInit {
  @Input() invite: InviteWithSender;

  constructor(private router: Router, private soundService: SoundService) {}

  ngOnInit(): void {}

  navigateMeetingRoom(roomId: string) {
    this.router.navigateByUrl(`/meeting/${roomId}`).then(() => {
      this.soundService.callSound.stop();
    });
  }
}
