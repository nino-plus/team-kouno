import { TestBed } from '@angular/core/testing';

import { ConnectedAccountGuard } from './connected-account.guard';

describe('ConnectedAccountGuard', () => {
  let guard: ConnectedAccountGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ConnectedAccountGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
