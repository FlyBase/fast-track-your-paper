import React from 'react'
import { useMachine } from '@xstate/react'
import { Divider } from 'antd'
// eslint-disable-next-line
import styled from 'styled-components/macro'

import { ftypSteps } from 'machines/StepMachine'

import PubStep from 'components/PubStep'
import AuthorStep from 'components/AuthorStep'
import FlagsStep from 'components/FlagsStep'
import GenesStep from 'components/GenesStep'
import ConfirmStep from 'components/ConfirmStep'
import SubmitStep from 'components/SubmitStep'
import StepIndicator from 'components/StepIndicator'

import { fetchFromLocalStorage } from 'utils/storage'

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
  const [current, send] = useMachine(ftypSteps, {
    ...fetchFromLocalStorage(localStorageKey),
    actions: {
      persist: (context, event, { action, state }) => {
        localStorage.setItem(localStorageKey, JSON.stringify({ state }))
      },
    },
  })

  /*
  Event handler that sends a GOTO_<target> event to the machine.
  e.g. GOTO_PUB to jump to the pub step.
       GOTO_GENES to jump to the genes step.
       etc...

  This allows for a user

   */
  const handleOnStepClick = stepIdx => send(`GOTO_${steps[stepIdx].name.toLocaleUpperCase()}`, { hasPub: true})
  /*
    Get the array index of the current step.
    This is required to show progress in the StepIndicator component.
   */
  const currentStepIdx = steps.findIndex(s => s.name === current.value)

  return (
    <div>
      <StepIndicator steps={steps} currentStep={currentStepIdx} onChange={handleOnStepClick} />
      <Divider />
      <div
        css={`
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
        `}>
        {current.matches('pub') && <PubStep />}
        {current.matches('author') && <AuthorStep />}
        {current.matches('flags') && <FlagsStep />}
        {current.matches('genes') && <GenesStep />}
        {current.matches('confirm') && <ConfirmStep />}
        {current.matches('submitted') && <SubmitStep />}
        <nav className="navbar">
          <div className="container-fluid">
            {!current.matches('submitted') && (
              <>
                <button
                  type="button"
                  className="btn btn-primary navbar-btn"
                  onClick={() => send('PREV', {hasPub: true })}>
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
        <StepIndicator steps={steps} currentStep={currentStepIdx} onChange={handleOnStepClick} />
      </div>
    </div>
  )
}

export default StepContainer
