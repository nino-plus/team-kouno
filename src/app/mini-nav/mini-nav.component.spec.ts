import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniNavComponent } from './mini-nav.component';

describe('MiniNavComponent', () => {
  let component: MiniNavComponent;
  let fixture: ComponentFixture<MiniNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
