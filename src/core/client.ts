import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeOptions } from "./lib/merge";
import { RequestOptions } from "./request";
import { chain, httpLink, Link } from "@/link";

type ClientOptions = RequestOptions & {
  links?: Link[];
};

export class Client {
  private readonly options?: ClientOptions;
  private readonly url: URL | string;

  constructor(url: URL | string, options?: ClientOptions) {
    this.options = options;
    this.url = url;
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
    const {
      links = [
        httpLink({
          url: this.url,
          fetch: options?.fetch ?? globalThis.fetch,
        }),
      ],
      ...requestOptions
    } = this.options ?? {};

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
