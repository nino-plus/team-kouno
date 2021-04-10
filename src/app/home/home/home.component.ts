import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { Event } from 'src/app/interfaces/event';
import { EventService } from 'src/app/services/event.service';
import SwiperCore, {
  Autoplay,
  Thumbs,
  Swiper,
  EffectFade,
  Navigation,
  Pagination,
} from 'swiper/core';

SwiperCore.use([Autoplay, Thumbs, EffectFade, Navigation, Pagination]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user$: Observable<User> = this.authService.user$;
  events$: Observable<Event[]> = this.eventService.getFutureEvents();
  spEvents$: Observable<Event[]> = this.eventService.getSpecialEvents();

  galleryThumbs = new Swiper('.gallery-thumbs');
  galleryTops = new Swiper('.gallery-top');

  constructor(
    private authService: AuthService,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {}

  joinChannel(eventId: string, uid: string): void {
    this.router.navigateByUrl(`/event/${eventId}/${uid}`);
  }
}
