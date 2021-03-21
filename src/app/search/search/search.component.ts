import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { Event } from 'src/app/interfaces/event';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  events: Event[];
  searchControl: FormControl = new FormControl();
  index: SearchIndex;
  searchOptions = [];
  result: {
    nbHits: number;
    hits: any[];
  };

  constructor(private router: Router, private SearchService: SearchService) {}

  ngOnInit(): void {}

  setSearchQuery(value: string): void {
    this.searchControl.setValue(value, {
      emitEvent: false,
    });
    console.log(value);
  }

  routeSearch(searchQuery: string): void {
    this.router.navigate(['/search'], {
      queryParamsHandling: 'merge',
      queryParams: { searchQuery },
    });
  }
}
