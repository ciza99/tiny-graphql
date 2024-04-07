import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeOptions } from "./lib/merge";
import { RequestOptions } from "./request";
import { chain, Link } from "@/link";

type ClientOptions = RequestOptions & {
  links: Link[];
};

export class Client {
  private readonly options?: ClientOptions;

  constructor(options?: ClientOptions) {
    this.options = options;
  }

  public request<TData = unknown, TVariables = Record<string, unknown>>({
    operation,
    variables,
    options,
  }: {
    operation: TypedDocumentNode<TData, TVariables> | string;
    variables?: TVariables;
    options?: RequestOptions;
  }): Promise<{ data: TData; response: Response }> {
    const { links = [], ...requestOptions } = this.options ?? {};

    const mergedOptions = mergeOptions(requestOptions, options);

    return new Promise<{ data: TData; response: Response }>(
      (resolve, reject) => {
        chain(links, {
          operation: operation as TypedDocumentNode<unknown, unknown>,
          variables,
          ...mergedOptions,
        }).subscribe({
          next: (response) => {
            resolve(response as { data: TData; response: Response });
          },
          error: (error) => {
            reject(error);
          },
          complete: () => {},
        });
      }
    );
  }
}
