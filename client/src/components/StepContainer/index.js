import React, { useRef } from 'react'
import { useMachine } from '@xstate/react'
import { Divider } from 'antd'
import { useApolloClient } from '@apollo/client'
// eslint-disable-next-line
import styled from 'styled-components/macro'

import { getInitialContext, createStepMachine } from 'machines/StepMachine'

import PubStep from 'components/PubStep'
import AuthorStep from 'components/AuthorStep'
import FlagsStep from 'components/FlagsStep'
import GenesStep from 'components/GenesStep'
import ConfirmStep from 'components/ConfirmStep'
import SubmitStep from 'components/SubmitStep'
import SubmitFailed from 'components/SubmitFailed'
import StepIndicator from 'components/StepIndicator'
import StepNavigation, { Prev, Next } from 'components/StepNavigation'

import { fetchFromLocalStorage, storeToLocalStorage } from 'utils/storage'

// An array to map the step machine state names to user friendly labels.
const steps = [
  { name: 'pub', label: 'Publication' },
  { name: 'author', label: 'Contact' },
  { name: 'flags', label: 'Data' },
  { name: 'genes', label: 'Genes' },
  { name: 'confirm', label: 'Confirmation' },
  { name: 'success', label: 'Finished' },
]

const PubStepWrapper = ({ nextClick, ...props }) => (
  <PubStep {...props}>
    <StepNavigation>
      <Next onClick={nextClick} aria-labelledby="authorstep">
        <span id="authorstep">
          <b>Save</b> Publication step and go to Contact step
        </span>
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
        <span id="datastep">
          <b>Save</b> Contact step and go to Data step
        </span>
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

const localStorageKey = 'ftyp-state'
const localStorageState = fetchFromLocalStorage(
  localStorageKey,
  getInitialContext()
)

let hydratedMachine
try {
  hydratedMachine = createStepMachine().withConfig(
    {
      actions: {
        persist: (context) => {
          storeToLocalStorage(localStorageKey, context)
        },
      },
    },
    localStorageState
  )
} catch (error) {
  hydratedMachine = createStepMachine().withConfig(
    {
      actions: {
        persist: (context) => {
          storeToLocalStorage(localStorageKey, context)
        },
      },
    },
    getInitialContext()
  )
}

function StepContainer() {
  const [current, send] = useMachine(hydratedMachine)
  const client = useApolloClient()

  // Reference to the Formik bag object.
  // This lets us trigger a submit from outside the form, which is needed
  // for some of the next/prev steps.
  const authorFormikBagRef = useRef()
  const flagsFormikBagRef = useRef()

  const {
    pubMachine,
    authorMachine,
    geneMachine,
    submission: { publication, citation, contact, flags, genes },
    output,
    error,
  } = current.context

  /*
    Get the array index of the current step.
    This is required to show progress in the StepIndicator component.
   */
  const currentStepIdx = steps.findIndex((s) => {
    // Check for nested pending state
    if (current.value.pending) {
      return s.name === current.value.pending
    }
    return s.name === current.value.submitted
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
     *
     * see https://github.com/jaredpalmer/formik/issues/1603#issuecomment-575669249
     */
    step = (
      <AuthorStepWrapper
        service={authorMachine}
        contact={contact}
        bagRef={authorFormikBagRef}
        prevClick={async () => {
          /**
           * submitForm() returns a promise so we need to await it.
           */
          await authorFormikBagRef.current.submitForm()
          send('PREV')
        }}
        nextClick={async () => {
          await authorFormikBagRef.current.submitForm()
          send('NEXT')
        }}
      />
    )
  } else if (current.matches({ pending: 'flags' })) {
    step = (
      <FlagsStepWrapper
        setFlags={(data) => send('SET_FLAGS', data)}
        flags={flags}
        bagRef={flagsFormikBagRef}
        prevClick={async () => {
          /**
           * submitForm() returns a promise so we need to await it.
           */
          await flagsFormikBagRef.current.submitForm()
          send('PREV')
        }}
        nextClick={async () => {
          await flagsFormikBagRef.current.submitForm()
          send('NEXT')
        }}
      />
    )
  } else if (current.matches({ pending: 'genes' })) {
    step = (
      <GenesStepWrapper
        service={geneMachine}
        genes={genes}
        prevClick={() => send('PREV')}
        nextClick={() => send('NEXT')}
      />
    )
  } else if (current.matches({ pending: 'confirm' })) {
    step = (
      <ConfirmStepWrapper
        submission={current.context.submission}
        send={send}
        prevClick={() => send('PREV')}
        nextClick={() => send('NEXT', { client })}
      />
    )
  } else if (current.matches({ submitted: 'success' })) {
    step = (
      <SubmitStepWrapper
        submission={current.context.submission}
        nextClick={() => send('START_OVER')}
        result={output}
      />
    )
  } else if (current.matches({ submitted: 'failure' })) {
    step = (
      <SubmitFailed
        submission={current.context.submission}
        onRetry={() => send('RETRY')}
        error={error.message}
      />
    )
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
