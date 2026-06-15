import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantCreatedSuccess } from './merchant-created-success';

describe('MerchantCreatedSuccess', () => {
  let component: MerchantCreatedSuccess;
  let fixture: ComponentFixture<MerchantCreatedSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantCreatedSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MerchantCreatedSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
