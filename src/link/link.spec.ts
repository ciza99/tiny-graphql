import { beforeAll, expect, describe, it } from "vitest";
import { createServer } from "http";
import { createSchema, createYoga, YogaInitialContext } from "graphql-yoga";
import { Client } from "@/core/";
import { observableFactory } from "@/observer";
import { Link, httpLink, loggerLink } from "@/link";

const yoga = createYoga<YogaInitialContext>({
  schema: createSchema({
    typeDefs: `
      type Query {
        authorized: String!
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        authorized: (_, _args, context) => {
          if (!context.request.headers.get("Authorization")) {
            throw new Error("Unauthorized");
          }

          return "Secret";
        },
        hello: () => "Hello World",
      },
    },
  }),
});

let port: number;

beforeAll(async () => {
  const server = createServer(yoga);

  await new Promise<void>((resolve) =>
    server.listen(0, () => {
      const addressInfo = server.address();

      if (!addressInfo || typeof addressInfo === "string") {
        throw new Error("Server address is a string");
      }

      port = addressInfo.port;
      resolve();
    })
  );
});

describe("links", () => {
  it("before request hook modifies request", async () => {
    const query = `
    query {
      authorized
    }
  `;

    const authLink: Link = (options, next) => {
      return observableFactory((observer) => {
        const { headers: currentHeaders, ...rest } = options;

        const headers = new Headers(currentHeaders);
        headers.set("Authorization", "Bearer <token>");
        return next({ headers, ...rest }).subscribe(observer);
      });
    };

    const client = new Client({
      links: [
        loggerLink(),
        authLink,
        httpLink({ url: `http://localhost:${port}/graphql` }),
      ],
    });

    const { data, response } = await client.request({ operation: query });

    expect(response.status).toBe(200);
    expect(data).toEqual({ authorized: "Secret" });
  });

  it("after response hook modifies response", async () => {
    const query = `
    query {
      hello
    }
  `;

    const client = new Client({
      links: [
        (options, next) => {
          return observableFactory((observer) => {
            return next(options).subscribe({
              next: ({ response }) => {
                const body = JSON.stringify({
                  data: { hello: "Hello People!" },
                });
                const patchedResponse = new Response(body, {
                  ...response,
                  headers: {
                    ...response.headers,
                    patched: "true",
                  },
                });
                observer.next({
                  data: { hello: "Hello People!" },
                  response: patchedResponse,
                });
              },
              error: (error) => observer.error(error),
              complete: () => observer.complete(),
            });
          });
        },
        httpLink({ url: `http://localhost:${port}/graphql` }),
      ],
    });

    const { data, response } = await client.request({ operation: query });

    expect(response.status).toBe(200);
    expect(response.headers.get("patched")).toBe("true");
    expect(data).toEqual({ hello: "Hello People!" });
  });
});
