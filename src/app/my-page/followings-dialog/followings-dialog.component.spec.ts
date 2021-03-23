import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingsDialogComponent } from './followings-dialog.component';

describe('FollowingsDialogComponent', () => {
  let component: FollowingsDialogComponent;
  let fixture: ComponentFixture<FollowingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FollowingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
