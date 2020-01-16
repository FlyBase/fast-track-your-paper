import { Machine, actions, spawn, send } from 'xstate'
import { createPubStepMachine } from '../PubStepMachine'
import { createContactStepMachine } from '../ContactStepMachine'
import cloneDeep from 'lodash.clonedeep'

const { assign } = actions

// See the following for full details on how this machine is
// configured.
// * https://xstate.js.org/docs/tutorials/reddit.html
// * https://xstate.js.org/docs/guides/actors.html#actor-api

// Initial structure of the context of the state machine.
const initialContext = {
  // References to the substep actors
  pubMachine: undefined,
  contactMachine: undefined,
  error: null,
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
  // Main FTYP machine configuration.
  return Machine(
    {
      id: 'ftyp',
      initial: 'pending',
      // Set initial context
      context: cloneDeep(initialContext),
      // When the page loads, spawn the pub machine and save
      // the machine state to localStorage.
      entry: ['spawnPubMachine','spawnContactMachine', 'persist'],
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
           * Handles resetting the machine state.
           */
          on: {
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
                NEXT: [
                  {
                    target: 'author',
                    actions: ['setStatus', 'persist'],
                    cond: 'hasPublication',
                  },
                  // Fall through to here if guard conditions fail.
                  {
                    entry: [assign({ error: 'No publication selected.' })],
                    actions: ['sendPubError'],
                    exit: [assign({ error: null })],
                  },
                ],
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
                // Event for selecting a publication.
                SET_SUBMITTER: {
                  actions: ['setSubmitter', 'persist'],
                },
                NEXT: { target: 'flags', cond: 'hasContact' },
                PREV: { target: 'pub' },
              },
            },
            // Data flags step
            flags: {
              entry: ['persist'],
              on: {
                NEXT: { target: 'genes' },
                PREV: { target: 'author' },
              },
            },
            // Genes step
            genes: {
              entry: ['persist'],
              on: {
                NEXT: { target: 'confirm' },
                PREV: { target: 'flags' },
              },
            },
            // Confirmation step
            confirm: {
              entry: ['persist'],
              on: {
                NEXT: {
                  target: '#ftyp.submitted',
                },
                PREV: { target: 'genes' },
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
        spawnContactMachine: assign((context, event) => {
          if (!context.contactMachine) {
            return {
              contactMachine: spawn(createContactStepMachine(), 'contactStepMachine'),
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
          return {
            submission: {
              ...submission,
              citation: null,
              publication: event.pub,
            },
          }
        }),
        // Set the submitter contact info.
        setSubmitter: assign((context, event) => {
          const { submission, submission: { submitter } } = context
          let {
            contact: { name, email, isAuthor = false },
          } = event
          if (typeof isAuthor !== 'boolean') isAuthor = false

          return {
            submission: {
              ...submission,
              submitter: {
                ...submitter,
                name,
                email,
                isAuthor,
              }
            }
          }
        }),
        /*
        Lets the pub step machine know that an error occurred.
         */
        sendPubError: send('NOPUB_ERROR', { to: 'pubStepMachine' }),
      },
      guards: {
        // Check that the submission has an associated publication or citation.
        hasPublication: (context, event) => {
          const { submission } = context
          return (
            event.hasPub ||
            (submission.publication && submission.publication.uniquename) ||
            submission.citation
          )
        },
        hasContact: (context, event) => {
          const { submission: { submitter: { name, email }}} = context
          return name && email
        },
        isConfirmed: context => context.confirmed,
      },
    }
  )
}
