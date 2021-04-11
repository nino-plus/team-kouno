import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCardDialogComponent } from './register-card-dialog.component';

describe('RegisterCardDialogComponent', () => {
  let component: RegisterCardDialogComponent;
  let fixture: ComponentFixture<RegisterCardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterCardDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterCardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
