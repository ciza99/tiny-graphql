import { beforeAll, test, expect } from "vitest";
import { createServer } from "http";
import { createSchema, createYoga } from "graphql-yoga";
import { Client } from "client/client";

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
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

test("1 + 1 = 2", async () => {
  const client = new Client();
  const query = `
    query {
      hello
    }
  `;

  const res = await client.request(query);
  const data = await res.json();

  expect(data).toMatchObject({
    data: {
      hello: "Hello World",
    },
  });
});
