import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appCountUp]',
    standalone: true
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
    @Input() countTo: number = 0;
    @Input() countDecimals: number = 0;
    @Input() countSuffix: string = '';
    @Input() countDuration: number = 2000;

    private observer?: IntersectionObserver;

    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
        const element = this.el.nativeElement as HTMLElement;

        // Show a placeholder until the count-up fires
        element.textContent = (0).toFixed(this.countDecimals) + this.countSuffix;

        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.animateCountUp(element);
                            this.observer?.unobserve(element);
                        }
                    });
                },
                {
                    threshold: 0,        // fire as soon as the element enters the viewport
                    rootMargin: '0px'
                }
            );

            this.observer.observe(element);
        } else {
            // Fallback: run immediately
            this.animateCountUp(element);
        }
    }

    ngOnDestroy() {
        this.observer?.disconnect();
    }

    private animateCountUp(element: HTMLElement) {
        const endValue = this.countTo;
        const duration = this.countDuration;
        const decimals = this.countDecimals;
        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const rawProgress = Math.min(elapsed / duration, 1);

            // Ease-out-quart
            const eased = 1 - Math.pow(1 - rawProgress, 4);
            const current = endValue * eased;

            element.textContent = current.toFixed(decimals) + this.countSuffix;

            if (rawProgress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }
}
