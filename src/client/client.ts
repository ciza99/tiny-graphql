import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeClientOptions } from "@/lib/merge";

type FetchType = typeof globalThis.fetch;

export type Options = Omit<RequestInit, "body" | "method"> & {
  fetch?: FetchType;
};

type BeforeRequestHook = (req: Request, options?: Options) => Request;
type AfterResponseHook = (
  req: Request,
  res: Response,
  options?: Options
) => Response;

export type ClientOptions = Options & {
  hooks?: {
    beforeRequest?: BeforeRequestHook[];
    afterResponse?: AfterResponseHook[];
  };
};
export class Client {
  private readonly options?: ClientOptions;
  private readonly url: RequestInfo | URL;

  constructor(url: RequestInfo | URL, options?: ClientOptions) {
    this.options = options;
    this.url = url;
  }

  public async request<TData = unknown, TVariables = Record<string, unknown>>(
    operation: TypedDocumentNode<TData, TVariables> | string,
    variables?: TVariables,
    options?: ClientOptions
  ): Promise<{ data: TData; response: Response }> {
    const {
      hooks,
      fetch: fetchProp,
      ...fetchOptions
    } = mergeClientOptions(
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
      this.options,
      options
    );

    const response = await fetch(this.url, {
      method: "POST",
      body: JSON.stringify({
        query: operation,
        ...(variables && { variables }),
      }),
      ...fetchOptions,
    });

    const data = await response.json();

    return { data, response };
  }
}
