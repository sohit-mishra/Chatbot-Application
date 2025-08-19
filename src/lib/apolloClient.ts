import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";


const HASURA_HTTP_URL = `https://${import.meta.env.VITE_NHOST_SUBDOMAIN}.hasura.${import.meta.env.VITE_NHOST_REGION}.nhost.run/v1/graphql`;
const HASURA_WS_URL = `wss://${import.meta.env.VITE_NHOST_SUBDOMAIN}.hasura.${import.meta.env.VITE_NHOST_REGION}.nhost.run/v1/graphql`;


const token = import.meta.env.VITE_ADMIN_SECRET;
console.log(token)


const httpLink = new HttpLink({
  uri: HASURA_HTTP_URL,
  fetch: async (uri, options) => {
    options!.headers = {
      ...options?.headers,
      "x-hasura-admin-secret": token,
    };
    return fetch(uri, options);
  },
});


const wsLink = new GraphQLWsLink(
  createClient({
    url: HASURA_WS_URL,
    connectionParams: async () => ({
      headers: {
        "content-type": "application/json",
        "x-hasura-admin-secret": token,
      },
    }),
  })
);


const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
