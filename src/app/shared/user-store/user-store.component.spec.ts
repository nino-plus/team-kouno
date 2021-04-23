import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStoreComponent } from './user-store.component';

describe('UserStoreComponent', () => {
  let component: UserStoreComponent;
  let fixture: ComponentFixture<UserStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
