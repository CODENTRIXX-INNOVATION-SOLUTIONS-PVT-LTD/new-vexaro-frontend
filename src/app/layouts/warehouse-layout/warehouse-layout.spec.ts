import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseLayout } from './warehouse-layout';

describe('WarehouseLayout', () => {
  let component: WarehouseLayout;
  let fixture: ComponentFixture<WarehouseLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
