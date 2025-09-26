import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Enrichment } from './enrichment';

describe('Enrichment', () => {
  let component: Enrichment;
  let fixture: ComponentFixture<Enrichment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enrichment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Enrichment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
