import { actions, Machine, sendParent } from 'xstate'
import { loader } from 'graphql.macro'

const { assign } = actions

// The GraphQL query to search all publication data.
const pubQuery = loader('graphql/pubQuery.gql')

const initialContext = {
  terms: null,
  pubs: [],
  totalPubs: 0,
}

export const createPubStepMachine = () => {
  // State machine for the pub search / citation step.
  return Machine(
    {
      id: 'pubsteps',
      initial: 'idle',
      context: initialContext,
      // Global events to watch for.
      on: {
        /* When a SUBMIT event is fired, set the search terms
         * in the context and transition to the search.loading state.
         */
        SUBMIT: {
          actions: ['setSearchTerms'],
          target: 'search.loading',
        },
        /* Transition to the 'citation' state when the CITATION event
         * is fired.
         */
        CITATION: {
          target: 'citation',
        },
        NOPUB_ERROR: {
          target: 'nopub',
        },
      },
      // All states for the pub steps.
      states: {
        // Initial state.
        idle: {},
        nopub: {},
        // State for capturing manually entered citations.
        citation: {
          on: {
            /* Send the manually entered citation to the parent on the
             * 'CITATION.SUBMIT' event.
             */
            'CITATION.SUBMIT': {
              actions: ['resetPubStep', 'resetParent', 'submitCitation'],
              target: 'idle',
            },
            // Allow users to go back to the idle state.
            'GOTO.SEARCH': {
              target: 'idle',
            },
          },
        },
        /*
         * Search state and substates of loading, loaded, and failed.
         */
        search: {
          states: {
            loading: {
              /* Fire off a GraphQL query, save the results, and transition
               * to either the loaded or failed state.  The onDone and onError
               * actions are fired based on the resolution of the promise that
               * is returned by the invokePubSearch function.
               */
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
            // State for when results have returned without error.
            loaded: {
              /* Allow user to select a publication.  Send that selection
               * to the parent machine.
               */
              on: {
                SELECT_PUB: {
                  actions: ['selectPub'],
                },
              },
            },
            failed: {},
          },
        },
      },
    },
    {
      // Function definitions for actions.
      actions: {
        resetParent: sendParent('RESET'),
        // Reset the context of this machine.
        resetPubStep: assign({ ...initialContext }),
        selectPub: sendParent((context, event) => ({
          type: 'SET_PUB',
          pub: event.pub,
        })),
        // Set the search terms typed into the search field.
        submitCitation: sendParent((context, event) => {
          return {
            type: 'SET_CITATION',
            citation: event.citation,
          }
        }),
        setSearchTerms: assign({ terms: (context, event) => event.terms }),
        // Set search results.
        setPubResults: assign((context, event) => {
          return {
            totalPubs: event.data.data.pubs.totalCount,
            pubs: event.data.data.pubs.nodes,
          }
        }),
      },
      services: {
        /* Service for querying the GraphQL endpoints.  Returns a promise
         * that is resolved by the Xstate library.
         */
        invokePubSearch: (context, event) => {
          const { client, terms } = event
          return client.query({ query: pubQuery, variables: { terms } })
        },
      },
    }
  )
}
