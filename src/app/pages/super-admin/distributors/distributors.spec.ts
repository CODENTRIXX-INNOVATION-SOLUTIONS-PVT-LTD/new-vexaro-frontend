import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Distributors } from './distributors';

describe('Distributors', () => {
  let component: Distributors;
  let fixture: ComponentFixture<Distributors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Distributors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Distributors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
