import { Machine, sendParent } from 'xstate'

export const initialContext = {}

export const createAuthorStepMachine = () => {
  // State machine for the contact info step.
  return Machine(
    {
      id: 'authorsteps',
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
          type: 'SET_CONTACT',
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
