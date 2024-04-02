import { beforeAll, test, expect } from "vitest";
import { createServer } from "http";
import { createSchema, createYoga } from "graphql-yoga";
import { Client } from "@/client/client";

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => {
          throw new Error("Something went wrong");
        },
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

test("client handles errors correctly", async () => {
  const query = `
    query {
      hello
    }
  `;

  const client = new Client(`http://localhost:${port}/graphql`);
  await expect(() => client.request(query)).rejects.toThrowError();
});
