import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { FetchType, Options } from "./request";

export const createRequest = <
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
  options?: Options;
}): Parameters<FetchType> =>
  // TODO: handle `GET` requests too
  [
    url,
    {
      method: "POST",
      body: JSON.stringify({
        query: operation,
        ...(variables && { variables }),
      }),
      ...options,
    },
  ];
