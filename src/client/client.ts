import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { mergeClientOptions } from "@/lib/merge";
import { GraphQLError } from "@/lib/error";
import { hasJSONBody } from "@/lib/hasJSONBody";

type FetchType = typeof globalThis.fetch;

export type Options = Omit<RequestInit, "body" | "method"> & {
  fetch?: FetchType;
};

type BeforeRequestHook = (req: Request, options?: Options) => Promise<Request>;
type AfterResponseHook = (
  req: Request,
  res: Response,
  options?: Options
) => Promise<Response>;

export type ClientOptions = Options & {
  hooks?: {
    beforeRequest?: BeforeRequestHook[];
    // TODO: implement before retry hook
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
    const initialRequest: Request = new Request(this.url, {
      method: "POST",
      body: JSON.stringify({
        query: operation,
        ...(variables && { variables }),
      }),
      ...fetchOptions,
    });

    const request =
      (await hooks?.beforeRequest?.reduce<Promise<Request>>(
        async (request, beforeRequestHook) => {
          return await beforeRequestHook(await request, this.options);
        },
        Promise.resolve(initialRequest)
      )) ?? initialRequest;

    const initialResponse = await fetch(request);

    const response =
      (await hooks?.afterResponse?.reduce<Promise<Response>>(
        async (response, afterResponseHook) => {
          return await afterResponseHook(request, await response, this.options);
        },
        Promise.resolve(initialResponse)
      )) ?? initialResponse;

    if (!response.ok) {
      if (!hasJSONBody(response)) {
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
  }
}
