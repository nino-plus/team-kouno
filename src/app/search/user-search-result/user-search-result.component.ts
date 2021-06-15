import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { Observable } from 'rxjs';
import { fade } from 'src/app/animations/animations';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-user-search-result',
  templateUrl: './user-search-result.component.html',
  styleUrls: ['./user-search-result.component.scss'],
  animations: [fade],
})
export class UserSearchResultComponent implements OnInit {
  user$: Observable<User> = this.authService.user$;
  uid: string;
  users: User[];

  index: SearchIndex = this.searchService.index.users;
  @Input() result: {
    nbHits: number;
    hits: any[];
  };
  searchQuery: string;
  private maxPage: number;
  private requestOptions = {
    page: 0,
    hitsPerPage: 6,
  };

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private authService: AuthService,
    public uiService: UiService
  ) {}

  ngOnInit(): void {
    this.user$.subscribe((user) => {
      this.uid = user.uid;
    });
    this.route.queryParamMap.subscribe((params) => {
      this.users = [];
      this.searchQuery = params.get('searchQuery' || '');
      if (this.searchQuery) {
        this.requestOptions.page = 0;
        this.searchUsers();
      }
    });
  }

  searchUsers(): void {
    const searchOptions = { ...this.requestOptions };
    if (!this.maxPage || this.maxPage > this.requestOptions.page) {
      this.uiService.loading = true;
      setTimeout(() => {
        this.index
          .search(this.searchQuery, searchOptions)
          .then((result) => {
            this.maxPage = result.nbPages;
            this.result = result;
            this.users.push(...(result.hits as any[]));
          })
          .then(() => this.requestOptions.page++)
          .finally(() => (this.uiService.loading = false));
      });
    }
  }
}
