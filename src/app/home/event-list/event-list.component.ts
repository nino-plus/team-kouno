import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { EventService } from 'src/app/services/event.service';
import { SearchService } from 'src/app/services/search.service';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent implements OnInit {
  @Input() user: User;
  @Input() listType: string;
  listSource: string = 'スポーツ';
  categoryData: string[] = [
    'スポーツ',
    'ミュージック',
    'フード',
    'ビジネス',
    'プログラミング',
    'オールラウンド',
    'ゲーム',
    'アニメ',
    '映画',
    '地域',
  ];

  eventLists$: Observable<Event[]> = this.eventService.getEventsByCategoryName(
    this.listSource
  );

  popularIndex: SearchIndex = this.searchService.index.popularEvents;
  popularEventLists: Event[] = [];

  onliveEventLists$: Observable<Event[]> = this.eventService.getOnliveEvents();

  @ViewChild('popSlides') popSlides: SwiperComponent;

  onliveConfig: SwiperOptions = {
    initialSlide: 1,
    slidesPerView: 5,
    observer: true,
    spaceBetween: 16,
    navigation: {
      nextEl: '.swiper-nav__btn--liv-next',
      prevEl: '.swiper-nav__btn--liv-prev',
    },
    breakpoints: {
      350: {
        slidesPerView: 1,
      },
      720: {
        slidesPerView: 2,
      },
      960: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
      1400: {
        slidesPerView: 5,
      },
    },
  };
  categoryConfig: SwiperOptions = {
    slidesPerView: 5,
    observer: true,
    spaceBetween: 16,
    slidesPerGroup: 6,
    navigation: {
      nextEl: '.swiper-nav__btn--cat-next',
      prevEl: '.swiper-nav__btn--cat-prev',
    },
    breakpoints: {
      350: {
        slidesPerView: 1,
      },
      720: {
        slidesPerView: 2,
      },
      960: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
      1400: {
        slidesPerView: 5,
      },
    },
  };
  popularConfig: SwiperOptions = {
    slidesPerView: 5,
    spaceBetween: 16,
    navigation: {
      nextEl: '.swiper-nav__btn--pop-next',
      prevEl: '.swiper-nav__btn--pop-prev',
    },
    breakpoints: {
      350: {
        slidesPerView: 1,
      },
      720: {
        slidesPerView: 2,
      },
      960: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
      1400: {
        slidesPerView: 5,
      },
    },
    init: false,
  };

  constructor(
    private eventService: EventService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getPopularEvents();
  }

  getPopularEvents() {
    this.popularIndex
      .search('', {
        filters: `exitAt > ${this.eventService.dateNow.toMillis()}`,
      })
      .then((result) => {
        this.popularEventLists.push(...(result.hits.slice(0, 12) as any[]));
      });
  }

  slidePrev(): void {
    for (let i = 0; i < this.popSlides.swiperRef.slides.length / 2; i++) {
      this.popSlides.swiperRef.slidePrev();
    }
    this.popSlides.swiperRef.slidePrev();
    console.log(this.popSlides.swiperRef.slides.length);
  }

  slideNext(): void {
    for (let i = 0; i < this.popSlides.swiperRef.slides.length / 2; i++) {
      this.popSlides.swiperRef.slideNext();
    }
  }

  changeListSource(category: string): void {
    this.listSource = category;
    if (category) {
      this.eventLists$ = this.eventService.getEventsByCategoryName(category);
    }
  }
}
