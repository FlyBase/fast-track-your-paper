import { Machine, actions, spawn, send } from 'xstate'
import {
  createPubStepMachine,
  initialContext as pubContext,
} from '../PubStepMachine'
import { createAuthorStepMachine } from 'machines/AuthorStepMachine'
import { createGeneStepMachine } from 'machines/GeneStepMachine'
import cloneDeep from 'lodash.clonedeep'
import { loader } from 'graphql.macro'

import {
  hasContact,
  isCurated,
  isReview,
  hasPublication,
  isFormValid,
} from './guards'

const { assign } = actions

// The GraphQL query to search all publication data.
const submissionMutation = loader('graphql/submitPaper.gql')
const tmFlagsQuery = loader('graphql/getTmFlags.gql')

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
    // FBrf from URL
    fbrf: null,
  },
}

export const getInitialContext = () => {
  return cloneDeep(initialContext)
}

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
          // Machine initialized, go to pending state.
          always: [
            { target: 'pending.email', cond: 'isFromEmail' },
            { target: 'pending' },
          ],
        },
        pending: {
          id: 'pending',
          initial: 'pub',
          /* Global event handlers for the machine.
           * Handles resetting the machine state.
           */
          on: {
            SET_FBRF_EMAIL: {
              target: '.email',
              actions: ['setEmailFbrf', 'persist'],
            },
            RESET: { target: '.pub', actions: ['resetContext', 'persist'] },
          },
          // Sub states of the top level pending state.
          states: {
            // Handle email links.
            email: {
              entry: ['persist'],
              on: {
                // Event for selecting a publication.
                SET_PUB: {
                  actions: ['resetLocalFlags', 'setPub', 'persist'],
                },
                NEXT: [
                  {
                    target: 'author',
                    actions: ['persist'],
                    cond: 'hasValidPub',
                  },
                  // Fall through to here if guard conditions fail.
                  {
                    entry: [assign({ error: 'Publication already curated' })],
                    actions: ['sendAlreadyCurated'],
                    exit: [assign({ error: null })],
                  },
                ],
              },
            },
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
                    cond: 'hasValidPub',
                  },
                  // Fall through to here if guard conditions fail.
                  {
                    entry: [assign({ error: 'No publication selected.' })],
                    actions: ['sendNoPubError'],
                    exit: [assign({ error: null })],
                  },
                ],
                // Event for selecting a publication.
                SET_PUB: {
                  actions: [
                    'resetContext',
                    'resetLocalFlags',
                    'setPub',
                    'persist',
                  ],
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
                NEXT: [
                  { target: 'genes', cond: 'hasContactAndIsReview' },
                  { target: 'flags', cond: 'hasContact' },
                ],
                PREV: { target: 'pub' },
              },
            },
            // Data flags step
            flags: {
              initial: 'loading',
              entry: ['persist'],
              states: {
                loading: {
                  invoke: {
                    id: 'getTmFlags',
                    src: 'getTmFlags',
                    onDone: {
                      target: 'success',
                      actions: ['setTmFlags'],
                    },
                    onError: {
                      target: 'failure',
                    },
                  },
                },
                success: {},
                failure: {},
              },
              on: {
                SET_FLAGS: {
                  actions: ['setFlags', 'persist'],
                },
                NEXT: { target: 'genes', cond: 'isFlagsValid' },
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
                NEXT: { target: 'confirm', cond: 'isUnderGeneLimit' },
                PREV: [
                  { target: 'author', cond: 'isReview' },
                  { target: 'flags' },
                ],
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
              exit: ['resetContext', 'resetLocalFlags'],
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
            fbrf: null,
          }
        }),
        /**
         * This function removes the local storage for the data flags step
         */
        resetLocalFlags: () => {
          localStorage.removeItem('flag-step')
        },
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
        setTmFlags: assign((context, event) => {
          const submission = context?.submission
          const flags = submission?.flags ?? {}
          const tmFlags = event?.data?.data?.flags?.nodes ?? []
          let newFlags = {}
          tmFlags.forEach((flag) => {
            if (flag.dataType.startsWith('new_al')) {
              newFlags.new_allele = true
            } else if (flag.dataType.startsWith('new_transg')) {
              newFlags.new_transgene = true
            } else if (flag.dataType.startsWith('phys_int')) {
              newFlags.physical_interaction = true
            } else if (flag.dataType.startsWith('disease')) {
              newFlags.human_disease = true
            }
          })
          /* Order is important here.
           * Let existing flags override any text mining flag data.
           * This should only happen when a user goes back to edit the flags step.
           */
          submission.flags = {
            ...newFlags,
            ...flags,
          }
          return {
            submission,
          }
        }),
        setFlags: assign((context, event) => {
          const { submission } = context
          let { flags = {} } = event
          if (!flags?.no_flags) {
            if (!flags?.cell_line) {
              /**
               * Remove any cell line data that was entered if the cell_line flag
               * is unchecked.
               */
              flags.cell_lines = []
              flags.stable_line = false
              flags.commercial_line = false
            }
            if (!flags?.human_disease) {
              /**
               * Remove any human disease text that was entered if the human_disease flag
               * is unchecked.
               */
              flags.human_disease_text = ''
            }
            if (!flags?.dataset) {
              /**
               * Remove any dataset flags that were entered if the dataset flag
               * is unchecked.
               */
              flags.dataset_pheno = false
              flags.dataset_accessions = false
              flags.dataset_accession_numbers = ''
            }
          } else {
            // If no_flags has been checked, remove all other flag data except the optional text.
            flags = {
              no_flags: true,
              none_apply_text: flags?.none_apply_text ?? '',
            }
          }
          return {
            submission: {
              ...submission,
              flags,
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
        setEmailFbrf: assign((context, event) => {
          const { submission } = context
          submission.contact.email = event?.email ? event.email : null
          return {
            fbrf: event.fbrf,
            submission: {
              ...submission,
            },
          }
        }),
        /*
        Lets the pub step machine know that an error occurred.
         */
        sendNoPubError: () =>
          send('NOPUB_ERROR', { to: (context) => context.pubMachine }),
        sendAlreadyCurated: () =>
          send('ALREADY_CURATED', { to: (context) => context.pubMachine }),
      },
      guards: {
        hasValidPub: (context, event) => {
          const { submission } = context
          const hasPub = event?.hasPub ?? hasPublication(submission)
          return hasPub && !isCurated(submission?.publication)
        },
        isReview: (context) => {
          return isReview(context?.submission?.publication)
        },
        isFromEmail: (context) => {
          return context?.fbrf && context?.submission?.contact?.email
        },
        isFlagsValid: (context, event) => {
          return isFormValid(event?.form)
        },
        hasContact: (context, event) => {
          return hasContact(context?.submission?.contact, event?.form)
        },
        hasContactAndIsReview: (context, event) => {
          const { contact, publication } = context?.submission
          const formikBag = event?.form
          return hasContact(contact, formikBag) && isReview(publication)
        },
        isConfirmed: (context) => context.confirmed,
        isUnderGeneLimit: (context) => {
          const genes = context?.submission?.genes ?? []
          return genes.length <= 101
        },
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
        getTmFlags: (context, event) => {
          const { client } = event
          // Get the FBrf out of the selected publication object.
          const fbrf = context?.submission?.publication?.uniquename
          if (client) {
            // Send query to retrieve any text mining flags.
            return client.query({ query: tmFlagsQuery, variables: { fbrf } })
          }
          return {}
        },
      },
    }
  )
}
