import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type Options = RequestInit & {
  fetch?: typeof globalThis.fetch;
  url?: string;
  json?: unknown;
};

type BeforeRequestHook = (req: Request, options?: Options) => Request;
type AfterResponseHook = (
  req: Request,
  res: Response,
  options?: Options
) => Response;

export type ClientOptions = Options & {
  hooks: {
    beforeRequest?: BeforeRequestHook;
    afterResponse?: AfterResponseHook;
  };
};
export class Client {
  private readonly options?: ClientOptions;

  constructor(options?: ClientOptions) {
    this.options = options;
  }

  public async request<TData = unknown, TVariables = Record<string, unknown>>(
    operation: TypedDocumentNode<TData, TVariables> | string,
    options?: ClientOptions & { variables?: Record<string, unknown> }
  ) {
    // TODO: Implement this method
    return {} as Response;
  }
}
