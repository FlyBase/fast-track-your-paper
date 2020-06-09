import { Machine, actions, spawn, send } from 'xstate'
import {
  createPubStepMachine,
  initialContext as pubContext,
} from '../PubStepMachine'
import { createAuthorStepMachine } from 'machines/AuthorStepMachine'
import { createGeneStepMachine } from 'machines/GeneStepMachine'
import cloneDeep from 'lodash.clonedeep'
import { loader } from 'graphql.macro'

const { assign } = actions

// The GraphQL query to search all publication data.
const submissionMutation = loader('graphql/submitPaper.gql')

// See the following for full details on how this machine is
// configured.
// * https://xstate.js.org/docs/tutorials/reddit.html
// * https://xstate.js.org/docs/guides/actors.html#actor-api

// Initial structure of the context of the state machine.
const initialContext = {
  // References to the substep actors
  pubMachine: undefined,
  authorMachine: undefined,
  geneMachine: undefined,
  error: null,
  output: null,
  confirmed: false,
  // The FTYP submission object.
  submission: {
    publication: null,
    citation: null,
    contact: {
      name: null,
      email: null,
      isAuthor: false,
    },
    // Data flags
    flags: {},
    // Genes
    genes: [],
  },
}

export const getInitialContext = () => cloneDeep(initialContext)

export const createStepMachine = () => {
  // Main FTYP machine configuration.
  return Machine(
    {
      id: 'ftyp',
      initial: 'initializing',
      // Set initial context
      context: initialContext,
      /*
       * All states of the step machine.
       * The following describes all possible states of the machine
       * and what transitions, actions, conditions, are placed on
       * those states.
       *
       * The main states are two top levels of 'pending' and 'submitted'.
       */
      states: {
        initializing: {
          // Initialize step machine when machine is started.
          entry: ['initStepMachine'],
          on: {
            // Machine initialized, go to pending state.
            '': 'pending',
          },
        },
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
                    actions: ['persist'],
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
                SET_CONTACT: {
                  actions: ['setContact', 'persist'],
                },
                NEXT: { target: 'flags', cond: 'hasContact' },
                PREV: { target: 'pub' },
              },
            },
            // Data flags step
            flags: {
              entry: ['persist'],
              on: {
                SET_FLAGS: {
                  actions: ['setFlags', 'persist'],
                },
                NEXT: { target: 'genes' },
                PREV: { target: 'author' },
              },
            },
            // Genes step
            genes: {
              entry: ['persist'],
              on: {
                SET_GENES: {
                  actions: ['setGenes', 'persist'],
                },
                NEXT: { target: 'confirm' },
                PREV: { target: 'flags' },
              },
            },
            // Confirmation step
            confirm: {
              entry: ['persist'],
              on: {
                PUB: 'pub',
                AUTHOR: 'author',
                FLAGS: 'flags',
                GENES: 'genes',
                NEXT: {
                  actions: ['confirmSubmission', 'persist'],
                  target: '#ftyp.submitted.sending',
                },
                PREV: { target: 'genes' },
              },
            },
          },
        },
        // Submitted step
        submitted: {
          id: 'submitted',
          initial: 'sending',
          states: {
            sending: {
              invoke: {
                id: 'save-submission',
                src: 'invokeSaveToDb',
                onDone: {
                  target: 'success',
                  actions: assign({ output: (context, event) => event.data }),
                },
                onError: {
                  target: 'failure',
                  actions: assign({ error: (context, event) => event.data }),
                },
              },
            },
            success: {
              // When we leave this step we reset the context so the user
              // doesn't resubmit their data again.
              exit: ['resetContext'],
              on: {
                START_OVER: { target: '#ftyp' },
              },
            },
            failure: {
              on: {
                RETRY: { target: '#ftyp.pending.pub' },
              },
            },
          },
        },
      },
    },
    {
      // Function definitions for actions defined in states above.
      actions: {
        initStepMachine: assign((context, event) => {
          return {
            /**
             * This spread only copies values on level deep so anything
             * more complicated than that has to be handled in a different
             * manner.
             */
            ...context,
            flags: cloneDeep(context.flags),
            genes: cloneDeep(context.genes),
            submission: cloneDeep(context.submission),
            /**
             * Spawn new machines with the previous context from each
             * machine.
             */
            pubMachine: spawn(
              createPubStepMachine().withContext(
                context.pubMachine ?? pubContext
              )
            ),
            authorMachine: spawn(
              createAuthorStepMachine().withContext(context.authorMachine ?? {})
            ),
            geneMachine: spawn(
              createGeneStepMachine().withContext(context.geneMachine ?? {})
            ),
          }
        }),
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
        spawnAuthorMachine: assign((context, event) => {
          if (!context.authorMachine) {
            return {
              authorMachine: spawn(
                createAuthorStepMachine(),
                'authorStepMachine'
              ),
            }
          }
        }),
        spawnGeneMachine: assign((context, event) => {
          if (!context.geneMachine) {
            return {
              geneMachine: spawn(createGeneStepMachine(), 'geneStepMachine'),
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
        setGenes: assign((context, event) => {
          const { submission } = context
          // Remove the highlighting info before adding to genes array.
          const genes = (event?.genes ?? []).map((gene) => {
            const { hl, ...rest } = gene
            return { ...rest }
          })
          return {
            submission: {
              ...submission,
              genes,
            },
          }
        }),
        setFlags: assign((context, event) => {
          const { submission } = context
          return {
            submission: {
              ...submission,
              flags: event?.flags ?? {},
            },
          }
        }),
        // Set the submitter contact info.
        setContact: assign((context, event) => {
          const {
            submission,
            submission: { contact },
          } = context
          let {
            contact: { name, email, isAuthor = false },
          } = event
          if (typeof isAuthor !== 'boolean') isAuthor = false

          return {
            submission: {
              ...submission,
              contact: {
                ...contact,
                name,
                email,
                isAuthor,
              },
            },
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
          const {
            submission: {
              contact: { name, email },
            },
          } = context
          return name && email
        },
        isConfirmed: (context) => context.confirmed,
      },
      services: {
        invokeSaveToDb: (context, event) => {
          const { client } = event
          const { submission } = context
          return client.mutate({
            mutation: submissionMutation,
            variables: { submission },
          })
        },
      },
    }
  )
}
