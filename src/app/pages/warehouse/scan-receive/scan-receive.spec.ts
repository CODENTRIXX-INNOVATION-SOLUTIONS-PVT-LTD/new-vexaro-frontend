import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanReceive } from './scan-receive';

describe('ScanReceive', () => {
  let component: ScanReceive;
  let fixture: ComponentFixture<ScanReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanReceive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanReceive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
