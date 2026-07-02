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
  private measured = false;

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
    // Try an early measure; if the track has no width yet the lazy path in
    // onScroll() will pick it up the first time the user actually scrolls.
    requestAnimationFrame(() => {
      setTimeout(() => this.measure(), 100);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.measured = false;
    this.measure();
  }

  private measure(): void {
    const track = this.trackRef?.nativeElement;
    if (!track) return;
    const shift = Math.max(track.scrollWidth - window.innerWidth, 0);
    if (shift === 0) return; // layout not ready yet — will retry in onScroll
    this.maxShift = shift;
    this.sectionHeight.set(`calc(100vh + ${this.maxShift}px)`);
    this.measured = true;
    this.onScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    // Lazy measure: if maxShift is still 0, try again now
    if (!this.measured) {
      this.measure();
      if (!this.measured) return;
    }

    const section = this.sectionRef?.nativeElement;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    // rect.top goes from 0 (section just hit the top) to -(maxShift) (scrolled through)
    const scrolled = Math.min(Math.max(-rect.top, 0), this.maxShift);
    this.translateX.set(-scrolled);
  }
}
