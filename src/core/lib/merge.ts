import type { RequestOptions } from "../request";

export const mergeHeaders = (...headersArray: HeadersInit[]) => {
  return headersArray.reduce<Headers>((acc, headers) => {
    const currentHeaders = new Headers(headers);
    currentHeaders.forEach((value, key) => {
      acc.set(key, value);
    });

    return acc;
  }, new Headers());
};

export const mergeOptions = (...options: (RequestOptions | undefined)[]) => {
  return options.reduce<RequestOptions>((acc, opts) => {
    const headers = mergeHeaders(acc.headers ?? {}, opts?.headers ?? {});
    return { ...mergeDeep(acc, opts ?? {}), headers };
  }, {});
};

const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return obj !== null && typeof obj === "object";
};

const isArray = Array.isArray;

const isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
  return (
    isObject(obj) &&
    [null, Object.prototype].includes(Object.getPrototypeOf(obj))
  );
};

type AllKeys<T> = T extends any ? keyof T : never;

type IndexValue<T, K extends PropertyKey, D = never> = T extends any
  ? K extends keyof T
    ? T[K]
    : D
  : never;

type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

type TFunction = (...a: unknown[]) => unknown;

type TPrimitives =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | Date
  | TFunction;

type TMerged<T> = [T] extends [Array<any>]
  ? { [K in keyof T]: TMerged<T[K]> }
  : [T] extends [TPrimitives]
  ? T
  : [T] extends [object]
  ? PartialKeys<{ [K in AllKeys<T>]: TMerged<IndexValue<T, K>> }, never>
  : T;

export const mergeDeep = <T extends Record<string, unknown>[]>(
  ...sources: T
): TMerged<T[number]> =>
  sources.reduce((acc, source) => {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = acc[key];
      console.log(targetValue, sourceValue, key);

      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        acc[key] = mergeDeep(targetValue, sourceValue);
        return acc;
      }
      if (isArray(sourceValue) && isArray(targetValue)) {
        acc[key] = [...targetValue, ...sourceValue];
        return acc;
      }

      acc[key] = sourceValue;
    });

    return acc;
  }, {} as any);
