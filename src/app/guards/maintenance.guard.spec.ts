import { TestBed } from '@angular/core/testing';

import { MaintenanceGuard } from './maintenance.guard';

describe('MaintenanceGuard', () => {
  let guard: MaintenanceGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MaintenanceGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
