import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { appRouteTransition } from './shared/animations/route-transition.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [appRouteTransition]
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet): string {
    if (!outlet || !outlet.isActivated) {
      return 'root';
    }

    return (
      outlet?.activatedRouteData?.['animation'] ??
      outlet?.activatedRoute?.routeConfig?.path ??
      'root'
    );
  }
}
