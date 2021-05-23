import {
  AfterContentInit,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  Controller,
  SwiperOptions,
} from 'swiper/core';
import { SwiperComponent } from 'swiper/angular';

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
export class HomeComponent implements OnInit, AfterViewInit {
  user$: Observable<User> = this.authService.user$;
  events$: Observable<Event[]> = this.eventService.getFutureEvents();
  spEvents$: Observable<Event[]> = this.eventService.getSpecialEvents();

  @ViewChild('galleryTop') galleryTop: SwiperComponent;
  @ViewChild('galleryThumbs') galleryThumbs: SwiperComponent;

  topConfig: SwiperOptions = {
    effect: 'fade',
    loop: true,
    loopAdditionalSlides: 8,
    loopedSlides: 8,
    slidesPerView: 8,
    autoplay: {
      delay: 9000,
    },
    navigation: true,
    pagination: {
      clickable: true,
      el: '.pagination',
      bulletElement: 'span',
    },
    loopPreventsSlide: true,
    observer: true,
  };

  thumbsConfig: SwiperOptions = {
    slidesPerView: 8,
    loop: true,
    loopAdditionalSlides: 8,
    loopPreventsSlide: true,
    loopedSlides: 8,
    autoplay: {
      delay: 9000,
    },
    centeredSlides: true,
    slideToClickedSlide: true,
    navigation: {
      nextEl: '.navigation__icon--next',
      prevEl: '.navigation__icon--prev',
    },
    grabCursor: true,
    observer: true,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.galleryTop.swiperRef.controller.control = this.galleryThumbs.swiperRef;
      this.galleryThumbs.swiperRef.controller.control = this.galleryTop.swiperRef;
    }, 3000);
  }

  joinChannel(eventId: string, uid: string): void {
    this.router.navigateByUrl(`/event/${eventId}/${uid}`);
  }
}
