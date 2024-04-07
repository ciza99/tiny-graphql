export type Observer<TValue, TError> = {
  next: (value: TValue) => void;
  error: (error: TError) => void;
  complete: () => void;
};

export const observerFactory = <TValue, TError>({
  next,
  error,
  complete,
}: Observer<TValue, TError>): Observer<TValue, TError> => {
  return {
    next: next ?? (() => {}),
    error: error ?? (() => {}),
    complete: complete ?? (() => {}),
  };
};
