import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export class GraphQLError<
  TData = unknown,
  TVariables = Record<string, unknown>,
  TError = Record<string, unknown>
> extends Error {
  public readonly response: Response;
  public readonly errors: TError[];
  public readonly variables?: TVariables;
  public readonly operation?: TypedDocumentNode<TData, TVariables> | string;

  constructor({
    response,
    errors,
    variables,
    operation,
  }: {
    response: Response;
    errors: TError[];
    variables?: TVariables;
    operation?: TypedDocumentNode<TData, TVariables> | string;
  }) {
    super("GraphQL request failed with errors");
    this.response = response;
    this.errors = errors;
    this.variables = variables;
    this.operation = operation;
  }
}
