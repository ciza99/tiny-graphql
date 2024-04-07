import { observableFactory } from "@/observer";
import { Link } from "./link";

export type LoggerLink = <TData, TVariables>(options?: {}) => Link<
  TData,
  TVariables
>;

const prettyPrint = (data: unknown) => {
  return JSON.stringify(data, null, 2);
};

const log = (...args: unknown[]) => {
  console.log(
    `LoggerLink [${new Date().toISOString()}]:\n${args.map(prettyPrint)}`
  );
};

export const loggerLink: LoggerLink = () => {
  return (options, next) => {
    return observableFactory((observer) => {
      const { operation, variables } = options;
      log({ operation, variables });
      return next(options).subscribe({
        next: (result) => {
          log({ status: result.response.status, data: result.data });
          observer.next(result);
        },
        error: (error) => {
          log({ error });
          observer.error(error);
        },
        complete: () => {
          observer.complete();
        },
      });
    });
  };
};
