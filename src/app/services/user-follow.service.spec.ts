import { TestBed } from '@angular/core/testing';

import { UserFollowService } from './user-follow.service';

describe('UserFollowService', () => {
  let service: UserFollowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserFollowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
