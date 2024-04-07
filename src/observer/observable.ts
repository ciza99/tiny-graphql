import { Observer } from "./observer";
import { Operator } from "./operators";

type UnsubscribeFn = () => void;

export type Observable<TValue = unknown, TError = unknown> = {
  subscribe: (observer: Observer<TValue, TError>) => UnsubscribeFn;
  pipe(): Observable<TValue, TError>;
  pipe<TValue1, TError1>(
    op1: Operator<TValue, TError, TValue1, TError1>
  ): Observable<TValue1, TError1>;
  pipe<TValue1, TError1, TValue2, TError2>(
    op1: Operator<TValue, TError, TValue1, TError1>,
    op2: Operator<TValue1, TError1, TValue2, TError2>
  ): Observable<TValue2, TError2>;
  pipe<TValue1, TError1, TValue2, TError2, TValue3, TError3>(
    op1: Operator<TValue, TError, TValue1, TError1>,
    op2: Operator<TValue1, TError1, TValue2, TError2>,
    op3: Operator<TValue2, TError2, TValue3, TError3>
  ): Observable<TValue3, TError3>;
  pipe<TValue1, TError1, TValue2, TError2, TValue3, TError3, TValue4, TError4>(
    op1: Operator<TValue, TError, TValue1, TError1>,
    op2: Operator<TValue1, TError1, TValue2, TError2>,
    op3: Operator<TValue2, TError2, TValue3, TError3>,
    op4: Operator<TValue3, TError3, TValue4, TError4>
  ): Observable<TValue4, TError4>;
  pipe<
    TValue1,
    TError1,
    TValue2,
    TError2,
    TValue3,
    TError3,
    TValue4,
    TError4,
    TValue5,
    TError5
  >(
    op1: Operator<TValue, TError, TValue1, TError1>,
    op2: Operator<TValue1, TError1, TValue2, TError2>,
    op3: Operator<TValue2, TError2, TValue3, TError3>,
    op4: Operator<TValue3, TError3, TValue4, TError4>,
    op5: Operator<TValue4, TError4, TValue5, TError5>
  ): Observable<TValue5, TError5>;
};

export const observableFactory = <TValue, TError>(
  subscribe: (observer: Observer<TValue, TError>) => UnsubscribeFn
): Observable<TValue, TError> => {
  const self: Observable<TValue, TError> = {
    subscribe,
    pipe: (...operations: any[]) => {
      return operations.reduce((acc, operation) => operation(acc), self);
    },
  };

  return self;
};
