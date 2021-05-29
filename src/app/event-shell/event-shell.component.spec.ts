import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventShellComponent } from './event-shell.component';

describe('EventShellComponent', () => {
  let component: EventShellComponent;
  let fixture: ComponentFixture<EventShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventShellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
