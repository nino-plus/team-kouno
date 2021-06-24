import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, {
  Autoplay,
  Controller,
  EffectFade,
  Navigation,
  Pagination,
  SwiperOptions,
  Thumbs,
} from 'swiper/core';

SwiperCore.use([
  Autoplay,
  Thumbs,
  EffectFade,
  Navigation,
  Pagination,
  Controller,
]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user$: Observable<User> = this.authService.user$;
  events$: Observable<Event[]> = this.eventService.getFutureEvents();
  spEvents$: Observable<Event[]> = this.eventService.getSpecialEvents();

  @ViewChild('tops', { static: false }) tops: SwiperComponent;

  topConfig: SwiperOptions = {
    loop: true,
    loopAdditionalSlides: 3,
    loopPreventsSlide: true,
    loopedSlides: 8,
    slidesPerView: 2,
    autoplay: {
      delay: 6000,
      disableOnInteraction: false,
    },
    speed: 600,
    navigation: {
      nextEl: '.navigation--next',
      prevEl: '.navigation--prev',
    },
    pagination: {
      clickable: true,
      el: '.pagination',
      type: 'bullets',
    },
    resizeObserver: true,
    roundLengths: true,
    spaceBetween: 24,
    centeredSlides: true,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 0,
      },
      700: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
    },
  };

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
