import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedDeliveries } from './failed-deliveries';

describe('FailedDeliveries', () => {
  let component: FailedDeliveries;
  let fixture: ComponentFixture<FailedDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FailedDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailedDeliveries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
