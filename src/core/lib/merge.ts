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
    return { ...acc, ...opts, headers };
  }, {});
};
