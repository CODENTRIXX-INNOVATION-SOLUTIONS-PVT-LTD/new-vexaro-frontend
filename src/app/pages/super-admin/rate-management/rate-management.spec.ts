import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateManagement } from './rate-management';

describe('RateManagement', () => {
  let component: RateManagement;
  let fixture: ComponentFixture<RateManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
