import { actions, Machine, sendParent } from 'xstate'

const { assign } = actions

const initialContext = {}

export const createContactStepMachine = () => {
  // State machine for the contact info step.
  return Machine(
    {
      id: 'contactsteps',
      initial: 'idle',
      context: initialContext,
      // Global events to watch for.
      on: {},
      // All states
      states: {
        idle: {
          on: {
            SUBMIT: [
              { cond: 'isValidContact', actions: ['submitContact'] },
              { target: 'invalid' },
            ],
          },
        },
        invalid: {},
      },
    },
    {
      // Function definitions for actions.
      actions: {
        submitContact: sendParent((context, event) => ({
          type: 'SET_SUBMITTER',
          contact: event.contact,
        })),
      },
      guards: {
        isValidContact: (context, event) => {
          const { contact } = event
          return (
            contact.hasOwnProperty('name') && contact.hasOwnProperty('email')
          )
        },
      },
    }
  )
}
