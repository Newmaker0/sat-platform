import { Observable, OperatorFunction, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

export type AsyncState<T, E = unknown> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

export type AsyncStateWithEmpty<T, E = unknown> = AsyncState<T, E> | { status: 'empty' };

export function toAsyncState<T, E = unknown>(): OperatorFunction<T, AsyncState<T, E>> {
  return (source$: Observable<T>) =>
    source$.pipe(
      map((data) => ({ status: 'success', data }) as const),
      startWith({ status: 'loading' } as const),
      catchError((error: E) => of({ status: 'error', error } as const))
    );
}

export function withEmptyState<T, E = unknown>(
  isEmpty: (data: T) => boolean
): OperatorFunction<AsyncState<T, E>, AsyncStateWithEmpty<T, E>> {
  return (state$) =>
    state$.pipe(
      map((state) => {
        if (state.status === 'success' && isEmpty(state.data)) {
          return { status: 'empty' } as const;
        }

        return state;
      })
    );
}
