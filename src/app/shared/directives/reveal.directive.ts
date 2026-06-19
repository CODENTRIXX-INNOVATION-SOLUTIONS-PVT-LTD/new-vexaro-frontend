import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[appReveal]',
    standalone: true
})
export class RevealDirective implements OnInit {
    @Input() revealDelay: number = 0;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        const element = this.el.nativeElement;

        // Set initial opacity to 0
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.8s ease-out, transform 0.8s ease-out`;
        element.style.transitionDelay = `${this.revealDelay * 100}ms`;

        // Use Intersection Observer to trigger animation when element enters viewport
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                            observer.unobserve(element);
                        }
                    });
                },
                { threshold: 0.1 }
            );

            observer.observe(element);
        } else {
            // Fallback for browsers without IntersectionObserver
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    }
}
