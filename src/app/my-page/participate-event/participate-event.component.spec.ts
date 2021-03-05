import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipateEventComponent } from './participate-event.component';

describe('ParticipateEventComponent', () => {
  let component: ParticipateEventComponent;
  let fixture: ComponentFixture<ParticipateEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipateEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipateEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
