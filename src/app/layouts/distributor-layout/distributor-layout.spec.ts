import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributorLayout } from './distributor-layout';

describe('DistributorLayout', () => {
  let component: DistributorLayout;
  let fixture: ComponentFixture<DistributorLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributorLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistributorLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
