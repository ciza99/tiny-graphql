import { Observable, observableFactory } from "./observable";

export type Operator<
  TValueBefore = unknown,
  TErrorBefore = unknown,
  TValueAfter = unknown,
  TErrorAfter = unknown
> = (
  observable: Observable<TValueBefore, TErrorBefore>
) => Observable<TValueAfter, TErrorAfter>;

export const map =
  <TValueBefore, TValueAfter, TError>(
    mapFn: (value: TValueBefore) => TValueAfter
  ): Operator<TValueBefore, TError, TValueAfter, TError> =>
  (sourceObservable) => {
    return observableFactory((observer) => {
      return sourceObservable.subscribe({
        next: (value) => observer.next(mapFn(value)),
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      });
    });
  };

// export const share =
//   <TValue, TError>(): Operator<TValue, TError, TValue, TError> =>
//   (sourceObservable) => {
//     let observers: Array<Partial<Observer<TValue, TError>>> = [];
//
//     return observableFactory((observer) => {
//       observers.push(observer);
//
//       if (observers.length === 1) {
//         sourceObservable.subscribe({
//           next: (value) => {
//             observers.forEach((obs) => obs.next?.(value));
//           },
//           error: (error) => {
//             observers.forEach((obs) => obs.error?.(error));
//           },
//           complete: () => {
//             observers.forEach((obs) => obs.complete?.());
//           },
//         });
//       }
//
//       return () => {
//         observers = observers.filter((obs) => obs !== observer);
//       };
//     });
//   };
