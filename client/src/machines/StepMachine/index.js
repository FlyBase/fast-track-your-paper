import { Machine } from 'xstate'
//const { assign } = actions

export const ftypSteps = Machine(
  {
    id: 'ftypsteps',
    initial: 'pub',
    context: {
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
    states: {
      pub: {
        on: {
          NEXT: {
            target: 'author',
            cond: 'hasPublication',
            actions: ['persist'],
          },
        },
      },
      author: {
        on: {
          NEXT: 'flags',
          PREV: 'pub',
        },
      },
      flags: {
        on: {
          NEXT: 'genes',
          PREV: 'author',
        },
      },
      genes: {
        on: {
          NEXT: 'confirm',
          PREV: 'flags',
        },
      },
      confirm: {
        on: {
          PREV: 'genes',
          NEXT: 'submitted',
        },
      },
      submitted: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      hasPublication: (context, event) => {
        return (
          event.hasPub ||
          ((context.publication && context.publication.fbrf) ||
            context.citation)
        )
      },
    },
  }
)
