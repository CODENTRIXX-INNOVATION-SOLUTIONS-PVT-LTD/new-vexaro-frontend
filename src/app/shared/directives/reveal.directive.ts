import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appReveal]',
    standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
    @Input() revealDelay: number = 0;

    private observer?: IntersectionObserver;

    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
        const element = this.el.nativeElement as HTMLElement;

        // Mark with data-reveal so CSS children like .chart-bar can key off it
        element.setAttribute('data-reveal', '');

        // Set initial hidden state via inline styles
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.8s ease-out ${this.revealDelay * 100}ms, transform 0.8s ease-out ${this.revealDelay * 100}ms`;

        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // Reveal via inline styles (opacity/translateY)
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';

                            // Also add .is-visible class so CSS children (e.g. .chart-bar)
                            // that rely on [data-reveal].is-visible selectors are triggered
                            element.classList.add('is-visible');

                            this.observer?.unobserve(element);
                        }
                    });
                },
                {
                    threshold: 0,        // fire as soon as ANY pixel enters the viewport
                    rootMargin: '0px'
                }
            );

            this.observer.observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('is-visible');
        }
    }

    ngOnDestroy() {
        this.observer?.disconnect();
    }
}
