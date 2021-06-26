import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchHeaderComponent } from './user-search-header.component';

describe('UserSearchHeaderComponent', () => {
  let component: UserSearchHeaderComponent;
  let fixture: ComponentFixture<UserSearchHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSearchHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
