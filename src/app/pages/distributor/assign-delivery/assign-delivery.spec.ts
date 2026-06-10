import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDelivery } from './assign-delivery';

describe('AssignDelivery', () => {
  let component: AssignDelivery;
  let fixture: ComponentFixture<AssignDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignDelivery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
