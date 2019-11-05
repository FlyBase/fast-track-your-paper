import { Machine, actions } from 'xstate'
const { assign } = actions

// See the following for full details on how this machine is
// configured.
// * https://xstate.js.org/docs/tutorials/reddit.html
// * https://xstate.js.org/docs/guides/actors.html#actor-api

// Initial structure of the context of the state machine.
const initialContext = {
  // Reference to the substep actors
  stepMachines: {},
  confirmed: false,
  // The FTYP submission object.
  submission: {
    publication: null,
    citation: null,
    submitter: {
      name: null,
      email: null,
      isAuthor: false,
    },
    flags: {},
    genes: {},
  },
}

// Main FTYP machine configuration.
export const ftypSteps = Machine(
  {
    id: 'ftypsteps',
    initial: 'pub',
    // Set initial context
    context: {...initialContext},
    /*
    All states of the step machine.
    The following describes all possible states of the machine
    and what transitions, actions, conditions, are placed on
    those states.
     */
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
          GOTO_AUTHOR: { target:'author', cond: 'hasPublication' },
          GOTO_FLAGS: { target:'flags', cond: 'hasPublication' },
          GOTO_GENES: { target: 'genes', cond: 'hasPublication' },
          GOTO_CONFIRM: { target: 'confirm', cond: 'hasPublication' },
        },
      },
      // Author state
      author: {
        entry: ['persist'],
        on: {
          // Valid transition targets for author step.
          NEXT: { target: 'flags', cond: 'hasPublication' },
          PREV: { target: 'pub', cond: 'hasPublication' },
          GOTO_PUB: 'pub',
          GOTO_FLAGS: { target:'flags', cond: 'hasPublication' },
          GOTO_GENES: { target: 'genes', cond: 'hasPublication' },
          GOTO_CONFIRM: { target: 'confirm', cond: 'hasPublication' },
        },
      },
      // Data flags step
      flags: {
        entry: ['persist'],
        on: {
          NEXT: { target: 'genes', cond: 'hasPublication' },
          PREV: { target: 'author', cond: 'hasPublication' },
          GOTO_PUB: 'pub',
          GOTO_AUTHOR: { target:'author', cond: 'hasPublication' },
          GOTO_GENES: { target: 'genes', cond: 'hasPublication' },
          GOTO_CONFIRM: { target: 'confirm', cond: 'hasPublication' },
        },
      },
      // Genes step
      genes: {
        entry: ['persist'],
        on: {
          NEXT: { target: 'confirm', cond: 'hasPublication' },
          PREV: { target: 'flags', cond: 'hasPublication' },
          GOTO_PUB: 'pub',
          GOTO_AUTHOR: { target:'author', cond: 'hasPublication' },
          GOTO_FLAGS: { target:'flags', cond: 'hasPublication' },
          GOTO_CONFIRM: { target: 'confirm', cond: 'hasPublication' },
        },
      },
      // Confirmation step
      confirm: {
        entry: ['persist'],
        on: {
          NEXT: {
            actions: 'confirmSubmission',
            target: 'submitted',
            cond: 'hasPublication'
          },
          PREV: { target: 'genes', cond: 'hasPublication' },
          GOTO_PUB: 'pub',
          GOTO_AUTHOR: { target:'author', cond: 'hasPublication' },
          GOTO_FLAGS: { target:'flags', cond: 'hasPublication' },
          GOTO_GENES: { target: 'genes', cond: 'hasPublication' },
        },
      },
      // Submitted step
      submitted: {
        entry:['persist'],
        // When we leave this step we reset the context so the user
        // doesn't resubmit their data again.
        onExit:['resetContext'],
        on: {
          START_OVER: { target: 'pub' },
        },
      },
    },
  },
  {
    actions: {
      // This action resets the application context to its initial state.
      resetContext: assign({...initialContext }),
      confirmSubmission: assign({confirmed: true}),
    },
    guards: {
      // Check that the submission has an associated publication or citation.
      hasPublication: (context, event) => {
        const { submission } = context
        return (
          event.hasPub ||
          ((submission.publication && submission.publication.fbrf) ||
            submission.citation)
        )
      },
      isConfirmed: context => context.confirmed,
    },
  }
)
