import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntlComponent } from './intl.component';

describe('IntlComponent', () => {
  let component: IntlComponent;
  let fixture: ComponentFixture<IntlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
