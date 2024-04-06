import type { RequestOptions } from "./request";

export const mergeHeaders = (...headersArray: HeadersInit[]) => {
  return headersArray.reduce<Headers>((acc, headers) => {
    const currentHeaders = new Headers(headers);
    currentHeaders.forEach((value, key) => {
      acc.set(key, value);
    });

    return acc;
  }, new Headers());
};

const mergeHooks = (
  ...hooksArray: RequestOptions["hooks"][]
): RequestOptions["hooks"] => {
  return (
    hooksArray?.reduce<Exclude<Required<RequestOptions["hooks"]>, undefined>>(
      (acc, hooks) => {
        const beforeRequest = [
          ...acc.beforeRequest,
          ...(hooks?.beforeRequest ?? []),
        ];
        const afterResponse = [
          ...acc.afterResponse,
          ...(hooks?.afterResponse ?? []),
        ];
        return { beforeRequest, afterResponse };
      },
      { beforeRequest: [], afterResponse: [] }
    ) ?? { beforeRequest: [], afterResponse: [] }
  );
};

export const mergeOptions = (...options: (RequestOptions | undefined)[]) => {
  return options.reduce<RequestOptions>((acc, opts) => {
    const headers = mergeHeaders(acc.headers ?? {}, opts?.headers ?? {});
    const hooks = mergeHooks(acc.hooks, opts?.hooks);
    return { ...acc, ...opts, hooks, headers };
  }, {});
};
