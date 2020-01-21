import React, { useRef } from 'react'
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
import StepNavigation, { Prev, Next } from 'components/StepNavigation'

//import { fetchFromLocalStorage, replacer } from 'utils/storage'

// An array to map the step machine state names to user friendly labels.
const steps = [
  { name: 'pub', label: 'Publication' },
  { name: 'author', label: 'Contact' },
  { name: 'flags', label: 'Data' },
  { name: 'genes', label: 'Genes' },
  { name: 'confirm', label: 'Confirmation' },
  { name: 'submitted', label: 'Finished' },
]

const PubStepWrapper = ({ nextClick, ...props }) => (
  <PubStep {...props}>
    <StepNavigation>
      <Next onClick={nextClick} aria-labelledby="authorstep">
        <span id="authorstep"><b>Save</b> Publication step and go to Contact step</span>
      </Next>
    </StepNavigation>
  </PubStep>
)

const AuthorStepWrapper = ({ prevClick, nextClick, ...props }) => (
  <AuthorStep {...props}>
    <StepNavigation>
      <Prev onClick={prevClick} aria-labelledby="pubstep">
        <span id="pubstep">Return to Publication step</span>
      </Prev>
      <Next onClick={nextClick} aria-labelledby="datastep">
        <span id="datastep"><b>Save</b> Contact step and go to Data step</span>
      </Next>
    </StepNavigation>
  </AuthorStep>
)

const FlagsStepWrapper = ({ prevClick, nextClick, ...props }) => (
  <FlagsStep {...props}>
    <StepNavigation>
      <Prev onClick={prevClick}>Return to Author step</Prev>
      <Next onClick={nextClick} type="button">
        <b>Save</b> Data step and go to Genes step
      </Next>
    </StepNavigation>
  </FlagsStep>
)

const GenesStepWrapper = ({ prevClick, nextClick, ...props }) => (
  <GenesStep {...props}>
    <StepNavigation>
      <Prev onClick={prevClick}>Return to Data step</Prev>
      <Next onClick={nextClick} type="button">
        <b>Save</b> Genes step and go to Confirmation step
      </Next>
    </StepNavigation>
  </GenesStep>
)

const ConfirmStepWrapper = ({ prevClick, nextClick, ...props }) => (
  <ConfirmStep {...props}>
    <StepNavigation>
      <Prev onClick={prevClick}>Return to Genes step</Prev>
      <Next onClick={nextClick} type="button">
        Submit your paper
      </Next>
    </StepNavigation>
  </ConfirmStep>
)

const SubmitStepWrapper = ({ nextClick, ...props }) => (
  <SubmitStep {...props}>
    <StepNavigation>
      <Next onClick={nextClick} type="button">
        Submit another paper
      </Next>
    </StepNavigation>
  </SubmitStep>
)

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

  // Reference to the Formik bag object.
  // This lets us trigger a submit from outside the form, which is needed
  // for some of the next/prev steps.
  const formikBagRef = useRef()

  //console.log('Step container', current)
  const {
    pubMachine,
    authorMachine,
    submission: { publication, citation, contact },
  } = current.context
  //console.log('Step container', pubMachine)

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
  let step

  if (current.matches({ pending: 'pub' })) {
    step = (
      <PubStepWrapper
        service={pubMachine}
        selected={publication}
        citation={citation}
        nextClick={() => send('NEXT')}
      />
    )
  } else if (current.matches({ pending: 'author' })) {
    /**
     * The bagRef parameter passes our reference down to the <Formik />
     * component inside the <AuthorStepWrapper />.  Formik then sets
     * it to reference its Formik bag object.
     *
     * That can then be used to trigger a form submit programmatically via
     * formikBagRef.current.submitForm().
     */
    step = (
      <AuthorStepWrapper
        service={authorMachine}
        contact={contact}
        bagRef={formikBagRef}
        prevClick={async () => {
          /**
           * submitForm() returns a promise so we need to await it.
           */
          await formikBagRef.current.submitForm()
          send('PREV')
        }}
        nextClick={async () => {
          await formikBagRef.current.submitForm()
          send('NEXT')
        }}
      />
    )
  } else if (current.matches({ pending: 'flags' })) {
    step = <FlagsStepWrapper />
  } else if (current.matches({ pending: 'genes' })) {
    step = <GenesStepWrapper />
  } else if (current.matches({ pending: 'confirm' })) {
    step = <ConfirmStepWrapper />
  } else if (current.matches({ pending: 'submitted' })) {
    step = <SubmitStepWrapper />
  }

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
        {step}
        <Divider />
        <StepIndicator steps={steps} currentStep={currentStepIdx} />
      </div>
    </div>
  )
}

export default StepContainer
