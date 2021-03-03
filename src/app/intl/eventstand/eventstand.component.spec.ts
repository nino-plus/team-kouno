import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventstandComponent } from './eventstand.component';

describe('EventstandComponent', () => {
  let component: EventstandComponent;
  let fixture: ComponentFixture<EventstandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventstandComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventstandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
