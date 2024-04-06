import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeOptions } from "@/lib/merge";
import { request, RequestOptions } from "@/lib/request";

export class Client {
  private readonly options?: RequestOptions;
  private readonly url: URL | string;

  constructor(url: URL | string, options?: RequestOptions) {
    this.options = options;
    this.url = url;
  }

  public extend(options?: RequestOptions): Client;
  public extend(url: RequestInfo | URL, options?: RequestOptions): Client;
  public extend(
    urlOrOptions?: RequestInfo | URL | RequestOptions,
    options?: RequestOptions
  ): Client {
    if (typeof urlOrOptions === "string" || urlOrOptions instanceof URL) {
      return new Client(urlOrOptions, mergeOptions(this.options, options));
    }

    return new Client(this.url, mergeOptions(this.options, urlOrOptions));
  }

  public async request<TData = unknown, TVariables = Record<string, unknown>>({
    operation,
    variables,
    options,
  }: {
    operation: TypedDocumentNode<TData, TVariables> | string;
    variables?: TVariables;
    options?: RequestOptions;
  }): Promise<{ data: TData; response: Response }> {
    const mergedOptions = mergeOptions(this.options, options);

    return await request({
      url: this.url,
      operation,
      variables,
      options: mergedOptions,
    });
  }
}
