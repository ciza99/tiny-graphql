import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeOptions } from "./merge";
import { createRequest } from "./createRequest";
import { isContentTypeJSON } from "./isContentTypeJSON";
import { GraphQLError } from "./error";

type FetchType = typeof globalThis.fetch;

export type Options = Omit<RequestInit, "body" | "method"> & {
  fetch?: FetchType;
};

export type RequestOptions = Options & {
  hooks?: {
    beforeRequest?: BeforeRequestHook[];
    // TODO: implement before retry hook
    afterResponse?: AfterResponseHook[];
  };
};

export type BeforeRequestHook = (
  req: Request,
  options?: Options
) => Promise<Request>;

export type AfterResponseHook = (
  req: Request,
  res: Response,
  options?: RequestOptions
) => Promise<Response>;

export const request = async <
  TData = unknown,
  TVariables = Record<string, unknown>
>({
  url,
  operation,
  variables,
  options,
}: {
  url: URL | string;
  operation: TypedDocumentNode<TData, TVariables> | string;
  variables?: TVariables;
  options?: RequestOptions;
}): Promise<{ data: TData; response: Response }> => {
  const {
    hooks,
    fetch = globalThis.fetch,
    ...fetchOptions
  } = mergeOptions(
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
    options
  );

  const initialRequest = createRequest({
    url,
    operation,
    variables,
    options: fetchOptions,
  });

  const request =
    (await hooks?.beforeRequest?.reduce<Promise<Request>>(
      async (request, beforeRequestHook) => {
        return await beforeRequestHook(await request, options);
      },
      Promise.resolve(initialRequest)
    )) ?? initialRequest;

  const initialResponse = await fetch(request);

  const response =
    (await hooks?.afterResponse?.reduce<Promise<Response>>(
      async (response, afterResponseHook) => {
        return await afterResponseHook(request, await response, options);
      },
      Promise.resolve(initialResponse)
    )) ?? initialResponse;

  if (!response.ok) {
    if (!isContentTypeJSON(response)) {
      throw new GraphQLError({
        response,
        errors: [{ message: response.statusText }],
        operation,
        variables,
      });
    }

    const { errors } = await response.json();
    throw new GraphQLError({
      response,
      errors,
      operation,
      variables,
    });
  }

  const { data, errors } = await response.json();

  if (errors) {
    throw new GraphQLError({
      response,
      errors,
      operation,
      variables,
    });
  }

  return { data, response };
};
