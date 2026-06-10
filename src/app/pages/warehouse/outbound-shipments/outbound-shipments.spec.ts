import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundShipments } from './outbound-shipments';

describe('OutboundShipments', () => {
  let component: OutboundShipments;
  let fixture: ComponentFixture<OutboundShipments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutboundShipments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutboundShipments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
