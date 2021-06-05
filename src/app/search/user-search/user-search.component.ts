import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
})
export class UserSearchComponent implements OnInit {
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
  }

  routeSearch(searchQuery: string): void {
    this.router.navigate(['/search'], {
      queryParamsHandling: 'merge',
      queryParams: { searchQuery },
    });
  }
}
