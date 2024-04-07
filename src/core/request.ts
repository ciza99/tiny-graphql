import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeOptions } from "./lib/merge";
import { createRequest } from "./createRequest";
import { isContentTypeJSON } from "./lib/isContentTypeJSON";
import { GraphQLError } from "./lib/error";

type FetchType = typeof globalThis.fetch;

export type Options = Omit<RequestInit, "body" | "method"> & {
  fetch?: FetchType;
};

export type RequestOptions = Options;

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
  const { fetch = globalThis.fetch, ...fetchOptions } = mergeOptions(
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

  const response = await fetch(initialRequest);

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
