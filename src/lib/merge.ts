import type { ClientOptions } from "@/client/client";

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
  ...hooksArray: ClientOptions["hooks"][]
): ClientOptions["hooks"] => {
  return (
    hooksArray?.reduce<Exclude<Required<ClientOptions["hooks"]>, undefined>>(
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

export const mergeClientOptions = (
  ...options: (ClientOptions | undefined)[]
) => {
  return options.reduce<ClientOptions>((acc, opts) => {
    const headers = mergeHeaders(acc.headers ?? {}, opts?.headers ?? {});
    const hooks = mergeHooks(acc.hooks, opts?.hooks);
    return { ...acc, ...opts, hooks, headers };
  }, {});
};
