import { Machine } from 'xstate'
//const { assign } = actions

export const ftypSteps = Machine({
    id: 'ftypsteps',
    initial: 'pub',
    context: {
      submission: {},
      hasPublication: false,
    },
    states: {
      pub: {
        on: {
          NEXT: {
            target: 'author',
            cond: 'hasPublication',
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
      hasPublication: (context, event) => context.hasPublication
    },
  },
)
