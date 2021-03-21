import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnfollowDialogComponent } from './unfollow-dialog.component';

describe('UnfollowDialogComponent', () => {
  let component: UnfollowDialogComponent;
  let fixture: ComponentFixture<UnfollowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnfollowDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnfollowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
