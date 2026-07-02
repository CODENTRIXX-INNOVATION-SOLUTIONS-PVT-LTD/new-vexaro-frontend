import { inject, Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private bo = inject(BreakpointObserver);

  isHandset = toSignal(
    this.bo.observe('(max-width: 767.98px)').pipe(map(s => s.matches)),
    { initialValue: false }
  );

  isTablet = toSignal(
    this.bo.observe('(max-width: 1199.98px)').pipe(map(s => s.matches)),
    { initialValue: false }
  );
}
