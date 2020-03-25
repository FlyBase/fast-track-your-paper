import { actions, Machine, sendParent } from 'xstate'
import { loader } from 'graphql.macro'

const { assign } = actions

// The GraphQL query to search all publication data.
const geneQuery = loader('graphql/geneQuery.gql')

export const initialContext = {
  term: null,
  geneResults: [],
  totalCount: 0,
}

export const createGeneStepMachine = () => {
  // State machine for the pub search / citation step.
  return Machine(
    {
      id: 'genesteps',
      initial: 'search',
      context: initialContext,
      // Global events to watch for.
      on: {
        SET_GENES_STUDIED: {
          actions: ['setGenesStudied'],
        },
      },
      // All states for the gene steps.
      states: {
        /*
         * Search state and substates of idle, loading, loaded, and failed.
         */
        search: {
          initial: 'idle',
          on: {
            /* When a SUBMIT event is fired, set the search terms
             * in the context and transition to the search.loading state.
             */
            SUBMIT: {
              actions: ['setSearchTerm'],
              target: 'search.loading',
            },
            BATCH: {
              target: 'batch',
            },
            NONE: {
              target: 'none',
            },
          },
          states: {
            // Initial state.
            idle: {},
            loading: {
              /* Fire off a GraphQL query, save the results, and transition
               * to either the loaded or failed state.  The onDone and onError
               * actions are fired based on the resolution of the promise that
               * is returned by the invokePubSearch function.
               */
              invoke: {
                id: 'query-genes',
                src: 'invokeGeneSearch',
                onDone: {
                  target: 'loaded',
                  actions: ['setGeneResults'],
                },
                onError: 'failed',
              },
            },
            // State for when results have returned without error.
            loaded: {
              on: {
                CLEAR: {
                  actions: ['resetGeneStep'],
                  target: 'idle',
                },
              },
            },
            failed: {},
          },
        },
        batch: {},
        none: {},
      },
    },
    {
      // Function definitions for actions.
      actions: {
        resetGeneStep: assign({ ...initialContext }),
        setSearchTerm: assign({ term: (context, event) => event.term }),
        setGenesStudied: sendParent((context, event) => ({
          type: 'SET_GENES',
          genes: event?.genes ?? [],
        })),
        // Set search results.
        setGeneResults: assign((context, event) => {
          return {
            geneResults: event?.data?.data?.results?.genes ?? [],
            totalCount: event?.data?.data?.results?.totalCount ?? 0,
          }
        }),
      },
      services: {
        /* Service for querying the GraphQL endpoints.  Returns a promise
         * that is resolved by the Xstate library.
         */
        invokeGeneSearch: (context, event) => {
          const { client, ...rest } = event
          return client.query({
            query: geneQuery,
            variables: { ...rest },
          })
        },
      },
    }
  )
}
