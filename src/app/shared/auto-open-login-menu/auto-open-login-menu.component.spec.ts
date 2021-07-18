import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoOpenLoginMenuComponent } from './auto-open-login-menu.component';

describe('AutoOpenLoginMenuComponent', () => {
  let component: AutoOpenLoginMenuComponent;
  let fixture: ComponentFixture<AutoOpenLoginMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoOpenLoginMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoOpenLoginMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
