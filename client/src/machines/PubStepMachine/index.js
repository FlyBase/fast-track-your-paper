import { actions, Machine } from 'xstate'
import { loader } from 'graphql.macro'
import ApolloClient from 'apollo-boost'

const { assign } = actions

// The GraphQL query to search all publication data.
const pubQuery = loader('graphql/pubQuery.gql')

const client = new ApolloClient({
  url: '/graphql',
})

const invokePubSearch = (context, event) => {
  const { terms } = context
  return client.query({ query: pubQuery, variables: { terms } })
}

export const pubStepMachine = Machine({
  id: 'pubsteps',
  initial: 'idle',
  context: {
    terms: null,
    pubs: [],
    selected: null,
    totalPubs: 0,
  },
  on: {
    SUBMIT: {
      actions: assign({
        terms: (context, event) => event.terms,
      }),
      target: 'search.loading',
    },
  },
  states: {
    idle: {},
    search: {
      states: {
        loading: {
          invoke: {
            id: 'query-publications',
            src: invokePubSearch,
            onDone: {
              target: 'loaded',
              actions: assign((context, event) => {
                return {
                  totalPubs: event.data.data.pubs.totalCount,
                  pubs: event.data.data.pubs.nodes,
                }
              }),
            },
            onError: 'failed',
          },
        },
        loaded: {},
        failed: {},
      },
    },
  },
})
