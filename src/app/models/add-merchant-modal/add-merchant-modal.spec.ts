import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMerchantModal } from './add-merchant-modal';

describe('AddMerchantModal', () => {
  let component: AddMerchantModal;
  let fixture: ComponentFixture<AddMerchantModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMerchantModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMerchantModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
