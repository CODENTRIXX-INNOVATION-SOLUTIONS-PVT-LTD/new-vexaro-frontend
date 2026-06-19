import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[appCountUp]',
    standalone: true
})
export class CountUpDirective implements OnInit {
    @Input() countTo: number = 0;
    @Input() countDecimals: number = 0;
    @Input() countSuffix: string = '';
    @Input() countDuration: number = 2000;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        this.animateCountUp();
    }

    private animateCountUp() {
        const element = this.el.nativeElement;
        const startValue = 0;
        const endValue = this.countTo;
        const duration = this.countDuration;
        const decimals = this.countDecimals;
        const startTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;

            const currentValue = startValue + (endValue - startValue) * easeProgress;
            const displayValue = currentValue.toFixed(decimals);

            element.textContent = displayValue + this.countSuffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        // Use Intersection Observer to start animation when element enters viewport
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            animate();
                            observer.unobserve(element);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            observer.observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            animate();
        }
    }
}
