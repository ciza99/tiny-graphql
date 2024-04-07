import { observableFactory } from "@/observer";
import { Link } from "./link";
import { request } from "@/core/request";

export type HTTPLink = <TData, TVariables>(options: {
  url: URL | string;
  fetch?: typeof fetch;
}) => Link<TData, TVariables>;

export const httpLink: HTTPLink = ({ url, fetch }) => {
  return ({ operation, variables, signal, ...options }) => {
    return observableFactory((observer) => {
      const controller = new AbortController();

      const abort = () => {
        controller.abort();
      };

      signal?.addEventListener("abort", abort);

      request({
        url,
        options: {
          fetch,
          signal: controller.signal,
          ...options,
        },
        variables,
        operation,
      })
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });

      return () => {
        controller.abort();
      };
    });
  };
};
