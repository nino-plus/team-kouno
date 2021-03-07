import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareScreenInfoDialogComponent } from './share-screen-info-dialog.component';

describe('ShareScreenInfoDialogComponent', () => {
  let component: ShareScreenInfoDialogComponent;
  let fixture: ComponentFixture<ShareScreenInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareScreenInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareScreenInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
