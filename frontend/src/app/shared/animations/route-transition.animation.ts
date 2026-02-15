import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata
} from '@angular/animations';

function buildRouteTransitionTrigger(
  triggerName: string,
  enterTranslateY: number,
  leaveTranslateY: number
): AnimationTriggerMetadata {
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return trigger(triggerName, [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [style({ position: 'absolute', inset: 0, width: '100%' })], {
        optional: true
      }),
      query(
        ':enter',
        [style({ opacity: 0, transform: `translateY(${enterTranslateY}px) scale(0.995)` })],
        { optional: true }
      ),
      group([
        query(
          ':leave',
          [
            animate(
              `140ms ${easing}`,
              style({ opacity: 0, transform: `translateY(${leaveTranslateY}px) scale(0.995)` })
            )
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [
            animate(
              `220ms 40ms ${easing}`,
              style({ opacity: 1, transform: 'translateY(0) scale(1)' })
            )
          ],
          { optional: true }
        )
      ])
    ])
  ]);
}

export const appRouteTransition = buildRouteTransitionTrigger('appRouteTransition', 14, -8);
export const dashboardRouteTransition = buildRouteTransitionTrigger(
  'dashboardRouteTransition',
  10,
  -6
);
