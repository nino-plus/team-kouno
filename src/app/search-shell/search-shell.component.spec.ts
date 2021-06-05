import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchShellComponent } from './search-shell.component';

describe('SearchShellComponent', () => {
  let component: SearchShellComponent;
  let fixture: ComponentFixture<SearchShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchShellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
