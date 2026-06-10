import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundShipments } from './inbound-shipments';

describe('InboundShipments', () => {
  let component: InboundShipments;
  let fixture: ComponentFixture<InboundShipments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InboundShipments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboundShipments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
