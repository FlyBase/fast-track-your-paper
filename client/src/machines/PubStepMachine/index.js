import { actions, Machine, sendParent } from 'xstate'
import { loader } from 'graphql.macro'

const { assign } = actions

// The GraphQL query to search all publication data.
const pubQuery = loader('graphql/pubQuery.gql')

export const createPubStepMachine = () => {
  return Machine(
    {
      id: 'pubsteps',
      initial: 'idle',
      context: {
        client: null,
        terms: null,
        pubs: [],
        totalPubs: 0,
      },
      on: {
        SUBMIT: {
          actions: ['setSearchTerms'],
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
                src: 'invokePubSearch',
                onDone: {
                  target: 'loaded',
                  actions: ['setPubResults'],
                },
                onError: 'failed',
              },
            },
            loaded: {
              on: {
                SELECT_PUB: {
                  actions: sendParent((context, event) => ({
                    type: 'SET_PUB',
                    pub: event.pub,
                  })),
                },
              },
            },
            failed: {},
          },
        },
      },
    },
    {
      actions: {
        setSearchTerms: assign({ terms: (context, event) => event.terms }),
        setPubResults: assign((context, event) => {
          return {
            totalPubs: event.data.data.pubs.totalCount,
            pubs: event.data.data.pubs.nodes,
          }
        }),
      },
      services: {
        invokePubSearch: (context, event) => {
          const { client, terms } = event
          return client.query({ query: pubQuery, variables: { terms } })
        },
      },
    }
  )
}
