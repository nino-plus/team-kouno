import { TestBed } from '@angular/core/testing';

import { ConnectedAccountService } from './connected-account.service';

describe('ConnectedAccountService', () => {
  let service: ConnectedAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectedAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
