import { Component, ElementRef, HostListener, AfterViewInit, ViewChild, signal } from '@angular/core';

interface Step {
  index: string;
  step: string;
  title: string;
  body: string;
  tag: string;
}

@Component({
  selector: 'app-workflow',
  standalone: true,
  templateUrl: './workflow.html'
})
export class Workflow implements AfterViewInit {
  @ViewChild('section') sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('track') trackRef!: ElementRef<HTMLElement>;

  translateX = signal(0);
  sectionHeight = signal('100vh');
  private maxShift = 0;

  readonly steps: Step[] = [
    {
      index: '01',
      step: 'Step 1',
      title: 'Book',
      body: 'Capture warehouse, consignee, parcel dimensions, payment type and carrier preference in one form.',
      tag: 'Workflow 01'
    },
    {
      index: '02',
      step: 'Step 2',
      title: 'Track',
      body: 'Follow each AWB through pickup, hub, transit, delivery attempts and RTO with real-time event streams.',
      tag: 'Workflow 02'
    },
    {
      index: '03',
      step: 'Step 3',
      title: 'Deliver',
      body: 'Coordinate runs, scans and customer updates from a calm, command-style operations dashboard.',
      tag: 'Workflow 03'
    },
    {
      index: '04',
      step: 'Step 4',
      title: 'Reconcile',
      body: 'Keep wallets, COD, surcharges and distributor margins aligned with every shipment event.',
      tag: 'Workflow 04'
    }
  ];

  ngAfterViewInit(): void {
    // give layout a tick to settle
    setTimeout(() => this.measure(), 50);
  }

  @HostListener('window:resize')
  measure(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) return;
    this.maxShift = Math.max(track.scrollWidth - window.innerWidth, 0);
    this.sectionHeight.set(`calc(100vh + ${this.maxShift}px)`);
    this.onScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const section = this.sectionRef?.nativeElement;
    if (!section || this.maxShift === 0) return;

    const rect = section.getBoundingClientRect();
    const scrollableHeight = section.offsetHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;

    const progress = Math.min(Math.max(-rect.top / scrollableHeight, 0), 1);
    this.translateX.set(-progress * this.maxShift);
  }
}
