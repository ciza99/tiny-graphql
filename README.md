# Tiny graphql client

> [!CAUTION]
> This is a work in progress and is not ready for production use. The API is not stable and may change a lot.

`tiny-graphql` is a small and simple graphql client. It is designed to be samll and simple to use.

## Installation

npm:

```bash
npm install tiny-graphql
```

yarn:

```bash
yarn add tiny-graphql
```

pnpm:

```bash
pnpm add tiny-graphql
```

## Quick start

Simple query without variables:

```typescript
import { Client, httpLink } from "tiny-graphql";

// create a client with an `httpLink` that points to the graphql endpoint
const client = new Client({
  links: [httpLink({ url: `https://rickandmortyapi.com/graphql` })],
});

const charactersQuery = `
query Query {
  characters() {
    results {
      name
    }
  }
}
`;

// send the query to the server using the client
const { data, response } = client.request({ operation: charactersQuery });
```

You can also send the query without creating a `client`:

```typescript
import { request } from "tiny-graphql";

const charactersQuery = `
query Query {
  characters() {
    results {
      name
    }
  }
}
`;

// send the query to the server using the `request` function
const { data, response } = await request({
  url: `https://rickandmortyapi.com/graphql`,
  operation: charactersQuery,
});
```

Simple query with variables:

```typescript
import { Client, httpLink } from "tiny-graphql";

const client = new Client({
  links: [httpLink({ url: `https://rickandmortyapi.com/graphql` })],
});

const episodesQuery = `
query Query($ids: [Int!]!) {
  episodesByIds(ids: $ids) {
    id
  }
}
`;

const { data, response } = client.request({
  operation: charactersQuery,
  variables: { ids: [1, 2] },
});
```

## Links

Tiny graphql client uses a concept called `links` to handle the request and response. A `link` is a function that takes the current request options and a `next` function that forwards the request to the next `link` in the chain.

Creating a custom `link` that adds a `bearer` token to the request:

```typescript
import { Client, Link, observableFactory } from "tiny-graphql";

const authLink: Link = (options, next) => {
  return observableFactory((observer) => {
    const { headers: currentHeaders, ...rest } = options;

    // modify the headers to add the `bearer` token
    const headers = new Headers(currentHeaders);
    headers.set("Authorization", "Bearer <token>");

    // forward the request to the next link and subscribe to the response
    return next({ headers, ...rest }).subscribe(observer);
  });
};

const client = new Client({
  // provide the `authLink` to the client before the terminating `httpLink`
  links: [authLink, httpLink({ url: `http://localhost:${port}/graphql` })],
});
```

## Usage with next `fetch` polyfill

You can use the `next` prop to change the revalidation time

```typescript
import { Client, httpLink } from "tiny-graphql";

// you can provide the options to the whole client
const client = new Client({
  links: [httpLink({ fetch, url: `https://rickandmortyapi.com/graphql` })],
  // provide `nexts` prop to the client
  next: {
    revalidate: 3,
  },
});

// or you can provide the options to the request, it will override the client options
const { data } = await client.request({
  operation: `<your query>`,
  options: { next: { revalidate: 5 } },
});
```
