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

const fetchFromLocalStorage = key => {
  try {
    return JSON.parse(localStorage.getItem(key)) || {}
  } catch (e) {
    return {}
  }
}

const persistedStepsMachine = ftypSteps.withConfig(
  {
    actions: {
      persist: ctx => {
        console.log('Persisting submission to local storage')
        localStorage.setItem('ftyp-state', JSON.stringify(ctx))
      },
    },
  },
  // initial state from localstorage
  {
    ...fetchFromLocalStorage('ftyp-state'),
  }
)

// An array to map the step matchine state names to user friendly labels.
const steps = [
  { name: 'pub', label: 'Publication' },
  { name: 'author', label: 'Submitter Info' },
  { name: 'flags', label: 'Data' },
  { name: 'genes', label: 'Genes' },
  { name: 'confirm', label: 'Confirm' },
  { name: 'submitted', label: 'Finished' },
]

function StepContainer() {
  const [current, send] = useMachine(persistedStepsMachine)
  /*
  Get the array index of the current step.
    This is required to show progress in the StepIndicator component.
   */
  const currentStepIdx = steps.findIndex(s => s.name === current.value)

  return (
    <div>
      <StepIndicator steps={steps} currentStep={currentStepIdx} />
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
            <button
              type="button"
              className="btn btn-primary navbar-btn"
              onClick={() => send('PREV')}>
              Prev
            </button>
            <button
              type="button"
              className="btn btn-primary navbar-btn"
              onClick={() => send('NEXT', { hasPub: true })}>
              Next
            </button>
          </div>
        </nav>
        <Divider />
        <StepIndicator steps={steps} currentStep={currentStepIdx} />
      </div>
    </div>
  )
}

export default StepContainer
