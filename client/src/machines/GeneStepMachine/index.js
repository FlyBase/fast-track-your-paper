import { actions, Machine, sendParent } from 'xstate'
import { loader } from 'graphql.macro'

const { assign } = actions

// The GraphQL query to search all publication data.
const geneQuery = loader('graphql/geneQuery.gql')
const validateIds = loader('graphql/validateIds.gql')

export const initialContext = {
  term: null,
  geneResults: [],
  totalCount: 0,
  validIds: [],
  updatedIds: [],
  splitIds: [],
  invalidIds: [],
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
            BATCH: 'batch',
            NONE: 'none',
          },
          states: {
            // Initial state.
            idle: {},
            loading: {
              /* Fire off a GraphQL query, save the results, and transition
               * to either the loaded or failed state.  The onDone and onError
               * actions are fired based on the resolution of the promise that
               * is returned by the invokeGeneSearch function.
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
        batch: {
          initial: 'idle',
          on: {
            SEARCH: 'search',
            NONE: 'none',
            VALIDATE: 'batch.loading',
          },
          states: {
            // Initial state.
            idle: {},
            loading: {
              /* Fire off a GraphQL query, save the results, and transition
               * to either the loaded or failed state.  The onDone and onError
               * actions are fired based on the resolution of the promise that
               * is returned by the invokeValidateIds function.
               */
              invoke: {
                id: 'validate-ids',
                src: 'invokeValidateIds',
                onDone: {
                  target: 'loaded',
                  actions: ['setValidatedIds'],
                },
                onError: 'failed',
              },
            },
            loaded: {},
            failed: {},
          },
        },
        none: {
          on: {
            SEARCH: 'search',
            BATCH: 'batch',
          },
        },
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
        setValidatedIds: assign((context, event) => {
          const validIds = []
          const updatedIds = []
          const splitIds = []
          const invalidIds = []
          /**
           * Pull out the nodes of the GraphQL query result.
           * This is an array of objects that has the validation status, the submitted ID,
           * and the updated ID if available.  Validation status can be 'current', 'updated',
           * 'split', or null.  Null values indicate an invalid ID.
           */
          const validationResults = event?.data?.data?.results?.nodes ?? []
          validationResults.forEach((validation) => {
            switch (validation.status) {
              case 'current':
                validIds.push(validation)
                break
              case 'updated':
                updatedIds.push(validation)
                break
              case 'split':
                splitIds.push(validation)
                break
              default:
                invalidIds.push(validation)
            }
          })
          return {
            validIds,
            updatedIds,
            splitIds,
            invalidIds,
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
        invokeValidateIds: (context, event) => {
          const { client, ...rest } = event
          return client.query({
            query: validateIds,
            variables: { ...rest },
          })
        },
      },
    }
  )
}
