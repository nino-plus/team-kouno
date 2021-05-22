import { Component, Input, OnInit } from '@angular/core';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { Observable } from 'rxjs';
import { Event } from 'src/app/interfaces/event';
import { User } from 'src/app/interfaces/user';
import { EventService } from 'src/app/services/event.service';
import { SearchService } from 'src/app/services/search.service';

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
        this.popularEventLists.push(...(result.hits.slice(0, 6) as any[]));
      });
  }

  changeListSource(category: string): void {
    this.listSource = category;
    if (category) {
      this.eventLists$ = this.eventService.getEventsByCategoryName(category);
    }
  }
}
