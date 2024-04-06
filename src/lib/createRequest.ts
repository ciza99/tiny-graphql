import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { Options } from "./request";

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
}): Request =>
  // TODO: handle `GET` requests too
  new Request(url, {
    method: "POST",
    body: JSON.stringify({
      query: operation,
      ...(variables && { variables }),
    }),
    ...options,
  });
