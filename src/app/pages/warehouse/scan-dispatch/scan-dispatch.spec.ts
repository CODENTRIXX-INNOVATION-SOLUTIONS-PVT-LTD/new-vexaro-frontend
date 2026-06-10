import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanDispatch } from './scan-dispatch';

describe('ScanDispatch', () => {
  let component: ScanDispatch;
  let fixture: ComponentFixture<ScanDispatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanDispatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanDispatch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
