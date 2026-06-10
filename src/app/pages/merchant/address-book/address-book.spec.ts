import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressBook } from './address-book';

describe('AddressBook', () => {
  let component: AddressBook;
  let fixture: ComponentFixture<AddressBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressBook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressBook);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
