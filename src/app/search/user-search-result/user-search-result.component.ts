import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchIndex } from 'functions/node_modules/algoliasearch';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
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
  private page = 0;
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
      console.log(params);

      this.users = [];
      this.searchQuery = params.get('searchQuery' || '');
      console.log(this.searchQuery);
      this.searchUsers();
    });
  }

  searchUsers(): void {
    const searchOptions = { ...this.requestOptions };
    this.uiService.loading = true;
    if (!this.maxPage || this.maxPage > this.page) {
      this.requestOptions.page++;
      this.uiService.loading = true;
      setTimeout(() => {
        this.index
          .search(this.searchQuery, searchOptions)
          .then((result) => {
            this.maxPage = result.nbPages;
            this.result = result;
            this.users.push(...(result.hits as any[]));
          })
          .finally(() => (this.uiService.loading = false));
      });
      console.log(this.users);
    }
  }
}
