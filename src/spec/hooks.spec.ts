import { beforeAll, test, expect } from "vitest";
import { createServer } from "http";
import { createSchema, createYoga, YogaInitialContext } from "graphql-yoga";
import { Client } from "@/client/client";

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

test("before request hook modifies request", async () => {
  const query = `
    query {
      authorized
    }
  `;

  const client = new Client(`http://localhost:${port}/graphql`, {
    hooks: {
      beforeRequest: [
        async (request) => {
          request.headers.set("Authorization", "Bearer token");
          return request;
        },
      ],
    },
  });

  const { data, response } = await client.request(query);

  expect(response.status).toBe(200);
  expect(data).toEqual({ authorized: "Secret" });
});

test("after response hook modifies response", async () => {
  const query = `
    query {
      hello
    }
  `;

  const client = new Client(`http://localhost:${port}/graphql`, {
    hooks: {
      afterResponse: [
        async (_, response) => {
          const body = JSON.stringify({ data: { hello: "Hello People!" } });
          return new Response(body, {
            ...response,
            headers: {
              ...response.headers,
              patched: "true",
            },
          });
        },
      ],
    },
  });

  const { data, response } = await client.request(query);

  expect(response.status).toBe(200);
  expect(response.headers.get("patched")).toBe("true");
  expect(data).toEqual({ hello: "Hello People!" });
});
