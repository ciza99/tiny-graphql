import { beforeAll, test, expect } from "vitest";
import { createServer } from "http";
import { createSchema, createYoga } from "graphql-yoga";
import { Client } from "./client";

type User = {
  id: number;
  name: string;
};

const mockUser = (id: number): User => ({
  id,
  name: "John Doe",
});

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
      type Query {
        hello: String!
        user(id: Int!): User
      }
      type User {
        id: Int!
        name: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello World",
        user: (_, { id }) => mockUser(id),
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

test("query returns correct data", async () => {
  const query = `
    query {
      hello
    }
  `;

  const client = new Client(`http://localhost:${port}/graphql`);
  const { data, response } = await client.request({ operation: query });

  expect(response.status).toBe(200);
  expect(data).toEqual({ hello: "Hello World" });
});

test("query returns correct data with variables", async () => {
  const query = `
    query GetUser($id: Int!){
      user(id: $id) {
        id
        name
      }
    }
  `;

  const id = 7;

  const client = new Client(`http://localhost:${port}/graphql`);
  const { data, response } = await client.request<
    { user: User },
    { id: number }
  >({
    operation: query,
    variables: { id },
  });

  expect(response.status).toBe(200);
  expect(data).toEqual({ user: mockUser(id) });
});
