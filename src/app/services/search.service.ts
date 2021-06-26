import { Injectable } from '@angular/core';
import algoliasearch from 'algoliasearch';
import { environment } from 'src/environments/environment';

const searchClient = algoliasearch(
  environment.algolia.appId,
  environment.algolia.searchKey
);

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  index = {
    events: searchClient.initIndex('events'),
    popularEvents: searchClient.initIndex('popular'),
    users: searchClient.initIndex('users'),
  };

  constructor() {}
}
