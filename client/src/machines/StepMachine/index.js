import { Machine, actions, spawn } from 'xstate'
import { createPubStepMachine } from '../PubStepMachine'
import cloneDeep from 'lodash.clonedeep'

const { assign } = actions

// See the following for full details on how this machine is
// configured.
// * https://xstate.js.org/docs/tutorials/reddit.html
// * https://xstate.js.org/docs/guides/actors.html#actor-api

const initialContext = {
  // References to the substep actors
  pubMachine: undefined,
  // The FTYP submission object.
  submission: {
    publication: null,
    citation: null,
    submitter: {
      name: null,
      email: null,
      isAuthor: false,
    },
    confirmed: false,
    // Data flags
    flags: {},
    // Genes
    genes: {},
  },
}

export const createStepMachine = () => {
  // Initial structure of the context of the state machine.

  // Main FTYP machine configuration.
  return Machine(
    {
      id: 'ftyp',
      initial: 'pending',
      // Set initial context
      context: cloneDeep(initialContext),
      // When the page loads, spawn the pub machine and save
      // the machine state to localStorage.
      entry: ['spawnPubMachine', 'persist'],
      /*
       * All states of the step machine.
       * The following describes all possible states of the machine
       * and what transitions, actions, conditions, are placed on
       * those states.
       *
       * The main states are two top levels of 'pending' and 'submitted'.
       */
      states: {
        pending: {
          id: 'pending',
          initial: 'pub',
          /* Global event handlers for the machine.
           * Handles jumping around steps and resetting the machine state.
           */
          on: {
            GOTO_PUB: { target: '.pub' },
            GOTO_AUTHOR: { target: '.author', cond: 'hasPublication' },
            GOTO_FLAGS: { target: '.flags', cond: 'hasPublication' },
            GOTO_GENES: { target: '.genes', cond: 'hasPublication' },
            GOTO_CONFIRM: { target: '.confirm', cond: 'hasPublication' },
            RESET: { target: '.pub', actions: ['resetContext', 'persist'] },
          },
          // Sub states of the top level pending state.
          states: {
            // Pub state
            pub: {
              // Call the 'persist' action to store app state to localstorage
              // or whatever the persist action implements.
              entry: ['persist'],
              on: {
                // Advance to next step if the user has selected a publication.
                // See 'guards' section for the hasPublication function.
                NEXT: {
                  target: 'author',
                  cond: 'hasPublication',
                },
                // Event for selecting a publication.
                SET_PUB: {
                  actions: ['setPub', 'persist'],
                },
                // Event for setting a manually entered citation.
                SET_CITATION: {
                  actions: ['setCitation', 'persist'],
                },
              },
            },
            // Author state
            author: {
              entry: ['persist'],
              on: {
                // Valid transition targets for author step.
                NEXT: { target: 'flags', cond: 'hasPublication' },
                PREV: { target: 'pub', cond: 'hasPublication' },
              },
            },
            // Data flags step
            flags: {
              entry: ['persist'],
              on: {
                NEXT: { target: 'genes', cond: 'hasPublication' },
                PREV: { target: 'author', cond: 'hasPublication' },
              },
            },
            // Genes step
            genes: {
              entry: ['persist'],
              on: {
                NEXT: { target: 'confirm', cond: 'hasPublication' },
                PREV: { target: 'flags', cond: 'hasPublication' },
              },
            },
            // Confirmation step
            confirm: {
              entry: ['persist'],
              on: {
                NEXT: {
                  target: '#ftyp.submitted',
                  cond: 'hasPublication',
                },
                PREV: { target: 'genes', cond: 'hasPublication' },
              },
            },
          },
        },
        // Submitted step
        submitted: {
          entry: ['persist'],
          // When we leave this step we reset the context so the user
          // doesn't resubmit their data again.
          onExit: ['resetContext'],
          on: {
            START_OVER: { target: '#ftyp.pending.pub' },
          },
        },
      },
    },
    {
      // Function definitions for actions defined in states above.
      actions: {
        // This action resets the application context to its initial state.
        resetContext: assign((context, event) => {
          const { pubMachine } = context
          const submission = cloneDeep(initialContext.submission)
          return {
            submission,
            pubMachine,
          }
        }),
        confirmSubmission: assign({ confirmed: true }),
        // Spins up a pub step machine and assigns it to the local context.
        spawnPubMachine: assign((context, event) => {
          if (!context.pubMachine) {
            return {
              pubMachine: spawn(createPubStepMachine(), 'pubStepMachine'),
            }
          }
        }),
        // Set the citation in the submission object.
        setCitation: assign((context, event) => {
          const { submission } = context
          submission.citation = event.citation
          submission.publication = null
          return {
            submission,
          }
        }),
        // Set the publication in the submission object.
        setPub: assign((context, event) => {
          const { submission } = context
          submission.citation = null
          submission.publication = event.pub
          return {
            submission,
          }
        }),
      },
      guards: {
        // Check that the submission has an associated publication or citation.
        hasPublication: (context, event) => {
          const { submission } = context
          return (
            event.hasPub ||
            ((submission.publication && submission.publication.uniquename) ||
              submission.citation)
          )
        },
        isConfirmed: context => context.confirmed,
      },
    }
  )
}
