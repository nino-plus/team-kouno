import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent implements OnInit {
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
