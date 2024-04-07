import { GraphQLError } from "@/core/lib/error";
import { RequestOptions } from "@/core/request";
import { Observable, observableFactory } from "@/observer/observable";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export type LinkOptions<
  TData = unknown,
  TVariables = unknown
> = RequestOptions & {
  operation: TypedDocumentNode<TData, TVariables> | string;
  variables?: TVariables;
};

export type Link<TData = unknown, TVariables = unknown> = (
  options: LinkOptions<TData, TVariables>,
  next: (
    options: LinkOptions<TData, TVariables>
  ) => Observable<{ data: TData; response: Response }, GraphQLError>
) => Observable<{ data: TData; response: Response }, GraphQLError>;

export const chain = <TData, TVariables>(
  links: Link<TData, TVariables>[],
  opts: LinkOptions<TData, TVariables>
) => {
  return observableFactory((observer) => {
    const execute = (
      index: number = 0,
      options: LinkOptions<TData, TVariables> = opts
    ): Observable<{ data: TData; response: Response }, GraphQLError> => {
      const link = links[index];

      if (!link) {
        throw new Error(
          "No more links in the chain, make sure to include a terminating link"
        );
      }

      return link(options, (nextOptions) => {
        return execute(index + 1, nextOptions);
      });
    };

    const obs = execute();
    return obs.subscribe(observer);
  });
};
