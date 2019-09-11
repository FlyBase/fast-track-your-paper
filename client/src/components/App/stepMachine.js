import { Machine, actions } from 'xstate'
const { assign } = actions

export const ftypSteps = Machine({
  id: 'ftypsteps',
  initial: 'pub',
  states: {
    pub: {
      on: { NEXT: 'author'}
    },
    author: {
      on: {
        NEXT: 'flags',
        PREV: 'pub'
      },
    },
    flags: {
      on: {
        NEXT: 'genes',
        PREV: 'author'
      }
    },
    genes: {
      on: {
        NEXT: 'confirm',
        PREV: 'flags'
      }
    },
    confirm: {
      on: {
        PREV: 'genes',
        NEXT: 'submitted'
      }
    },
    submitted: {
      type: 'final'
    }
  },
})
