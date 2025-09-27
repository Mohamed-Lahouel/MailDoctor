import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedinSearch } from './linkedinsearch';


describe('LinkedinSearch', () => {
  let component: LinkedinSearch;
  let fixture: ComponentFixture<LinkedinSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedinSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedinSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
