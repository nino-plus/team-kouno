import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRoomComponent } from './event-room.component';

describe('EventRoomComponent', () => {
  let component: EventRoomComponent;
  let fixture: ComponentFixture<EventRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
