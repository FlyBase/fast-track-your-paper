import React from 'react'
import { useMachine } from '@xstate/react'
import { Divider } from 'antd'
import isEmpty from 'lodash.isempty'
// eslint-disable-next-line
import styled from 'styled-components/macro'

import { createStepMachine } from 'machines/StepMachine'

import PubStep from 'components/PubStep'
import AuthorStep from 'components/AuthorStep'
import FlagsStep from 'components/FlagsStep'
import GenesStep from 'components/GenesStep'
import ConfirmStep from 'components/ConfirmStep'
import SubmitStep from 'components/SubmitStep'
import StepIndicator from 'components/StepIndicator'

import { fetchFromLocalStorage, replacer } from 'utils/storage'

// An array to map the step machine state names to user friendly labels.
const steps = [
  { name: 'pub', label: 'Publication' },
  { name: 'author', label: 'Submitter Info' },
  { name: 'flags', label: 'Data' },
  { name: 'genes', label: 'Genes' },
  { name: 'confirm', label: 'Confirm' },
  { name: 'submitted', label: 'Finished' },
]

function StepContainer() {
  const localStorageKey = 'ftyp-state'
  // TODO reading state from localStroage is broken for the moment
  const state = {}
  //const state = fetchFromLocalStorage(localStorageKey)

  const machineOpts = {
    actions: {
      persist: (context, event, { action, state }) => {
        localStorage.setItem(localStorageKey, JSON.stringify(state))
      },
    },
  }

  // If we have some state pass it to the machine options
  // so that we rehydrate that state.
  if (!isEmpty(state)) {
    machineOpts.state = state
  }

  //console.log('Machine opts =', machineOpts)
  const [current, send] = useMachine(createStepMachine(), machineOpts)

  //console.log('Step container', current)
  const { pubMachine } = current.context
  //console.log('Step container', pubMachine)

  /*
  Event handler that sends a GOTO_<target> event to the machine.
  e.g. GOTO_PUB to jump to the pub step.
       GOTO_GENES to jump to the genes step.
       etc...

  This allows for a user to jump around to various allowable steps.

   */
  const handleOnStepClick = stepIdx =>
    send(`GOTO_${steps[stepIdx].name.toLocaleUpperCase()}`, { hasPub: true })
  /*
    Get the array index of the current step.
    This is required to show progress in the StepIndicator component.
   */
  const currentStepIdx = steps.findIndex(s => {
    // Check for nested pending state
    if (current.value.pending) {
      return s.name === current.value.pending
    }
    return s.name === current.value
  })

  return (
    <div>
      <StepIndicator
        steps={steps}
        currentStep={currentStepIdx}
        onChange={handleOnStepClick}
      />
      <Divider />
      <div
        css={`
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
        `}>
        {current.matches({ pending: 'pub' }) && (
          <PubStep service={pubMachine} />
        )}
        {current.matches({ pending: 'author' }) && <AuthorStep />}
        {current.matches({ pending: 'flags' }) && <FlagsStep />}
        {current.matches({ pending: 'genes' }) && <GenesStep />}
        {current.matches({ pending: 'confirm' }) && <ConfirmStep />}
        {current.matches('submitted') && <SubmitStep />}
        <nav className="navbar">
          <div className="container-fluid">
            {!current.matches('submitted') && (
              <>
                <button
                  type="button"
                  className="btn btn-primary navbar-btn"
                  onClick={() => send('PREV', { hasPub: true })}>
                  Prev
                </button>
                <button
                  type="button"
                  className="btn btn-primary navbar-btn"
                  onClick={() => send('NEXT', { hasPub: true })}>
                  Next
                </button>
              </>
            )}
            {current.matches('submitted') && (
              <button
                className="btn btn-primary navbar-btn"
                type="button"
                onClick={() => send('START_OVER')}>
                Start Over
              </button>
            )}
          </div>
        </nav>
        <Divider />
        <StepIndicator
          steps={steps}
          currentStep={currentStepIdx}
          onChange={handleOnStepClick}
        />
      </div>
    </div>
  )
}

export default StepContainer
