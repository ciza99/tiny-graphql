import type { Options } from "../client/client";

export const mergeHeaders = (...headersArray: HeadersInit[]) => {
  return headersArray.reduce<Headers>((acc, headers) => {
    const currentHeaders = new Headers(headers);
    currentHeaders.forEach((value, key) => {
      acc.set(key, value);
    });

    return acc;
  }, new Headers());
};

export const mergeClientOptions = (...options: (Options | undefined)[]) => {
  return options.reduce<Options>((acc, opts) => {
    const headers = mergeHeaders(acc.headers ?? {}, opts?.headers ?? {});
    return { ...acc, ...opts, headers };
  }, {});
};
