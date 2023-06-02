import React, { useRef, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useMachine } from '@xstate/react'
import { Divider } from 'antd'
import { useApolloClient } from '@apollo/client'
// eslint-disable-next-line
import styled from 'styled-components/macro'

import { getInitialContext, createStepMachine } from 'machines/StepMachine'

import PubStep from 'components/PubStep'
import EmailStep from 'components/EmailStep'
import AuthorStep from 'components/AuthorStep'
import FlagsStep from 'components/FlagsStep'
import GenesStep from 'components/GenesStep'
import ConfirmStep from 'components/ConfirmStep'
import SubmitStep from 'components/SubmitStep'
import SubmitFailed from 'components/SubmitFailed'
import StepIndicator from 'components/StepIndicator'
import StepNavigation, { Prev, Next } from 'components/StepNavigation'

import { fetchFromLocalStorage, storeToLocalStorage } from 'utils/storage'
import { isCurated } from 'machines/StepMachine/guards'

// An array to map the step machine state names to user friendly labels.
const defaultSteps = [
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

const EmailStepWrapper = ({
  prevClick,
  nextClick,
  nextProps = {},
  prevProps = {},
  ...props
}) => (
  <EmailStep {...props}>
    <StepNavigation>
      <Prev onClick={prevClick} aria-labelledby="startover" {...prevProps}>
        <span id="startover">Select another publication</span>
      </Prev>
      <Next onClick={nextClick} aria-labelledby="authorstep" {...nextProps}>
        <span id="authorstep">
          <b>Save</b> Publication step and go to Contact step
        </span>
      </Next>
    </StepNavigation>
  </EmailStep>
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

const GenesStepWrapper = ({
  prevClick,
  nextClick,
  prevProps = {},
  nextProps = {},
  ...props
}) => (
  <GenesStep {...props}>
    <StepNavigation>
      <Prev onClick={prevClick} {...prevProps}>
        Return to Data step
      </Prev>
      <Next onClick={nextClick} type="button" {...nextProps}>
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

/**
 * Insantiaties a new step machine using either the initial state context
 * or a context that has been hydrated from the local stroage data.
 *
 * @returns {*} - The hydrated Xstate state machine.
 */
export const getHydratedMachine = () => {
  const localStorageKey = 'ftyp-state'
  const localStorageState = fetchFromLocalStorage(localStorageKey, () =>
    getInitialContext()
  )
  const persistAction = {
    actions: {
      persist: (context) => {
        storeToLocalStorage(localStorageKey, context)
      },
    },
  }

  let hydratedMachine
  try {
    hydratedMachine = createStepMachine().withConfig(
      persistAction,
      localStorageState
    )
  } catch (error) {
    hydratedMachine = createStepMachine().withConfig(
      persistAction,
      getInitialContext()
    )
  }
  return hydratedMachine
}

function StepContainer() {
  const { fbrf: fbrfUrl, email } = useParams()
  const history = useHistory()
  const client = useApolloClient()
  const [current, send] = useMachine(getHydratedMachine())
  console.log(current);

  /**
   * This useEffect hook sets the FBrf and email from
   * the URL when a user comes into the tool via a path like
   *
   *  /FBrf12345/john.doe@nowhere.com
   *
   *  It only runs when the email, fbrfUrl or send function change
   *  and if the fbrf and email are defined.
   */
  useEffect(() => {
    if (fbrfUrl) {
      send('SET_FBRF_EMAIL', { fbrf: fbrfUrl, email })
    }
  }, [email, fbrfUrl, send])

  // Reference to the Formik bag object.
  // This lets us trigger a submit from outside the form, which is needed
  // for some of the next/prev steps.
  const authorFormikBagRef = useRef()
  const flagsFormikBagRef = useRef()

  const {
    pubMachine,
    authorMachine,
    geneMachine,
    submission: { publication, citation, contact, flags, genes = [] },
    fbrf,
    output,
    error,
  } = current.context

  // Dont' show the flags step when a review is selected.
  const steps = defaultSteps.filter((step) => {
    if (publication?.type?.name === 'review') {
      return step.name !== 'flags'
    }
    return true
  })

  /*
    Get the array index of the current step.
    This is required to show progress in the StepIndicator component.
   */
  const currentStepIdx = steps.findIndex((s) => {
    // Check for nested pending state
    if (current.matches('pending')) {
      if (current.matches('pending.email')) {
        return s.name === 'pub'
      } else {
        return current.matches(`pending.${s.name}`)
      }
    }
    return current.matches(`submitted.${s.name}`)
  })
  let step

  if (current.matches('pending.pub')) {
    step = (
      <PubStepWrapper
        service={pubMachine}
        selectedPub={publication}
        citation={citation}
        nextClick={() => send('NEXT')}
      />
    )
  } else if (current.matches('pending.email')) {
    step = (
      <EmailStepWrapper
        dispatch={send}
        fbrf={fbrfUrl ?? fbrf}
        prevClick={() => {
          send('RESET')
          history.push('/')
        }}
        nextClick={() => send('NEXT')}
        nextProps={{ disabled: isCurated(publication) }}
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
          send('NEXT', { client, form: authorFormikBagRef.current })
        }}
      />
    )
  } else if (current.matches({ pending: 'flags' })) {
    step = (
      <FlagsStepWrapper
        setFlags={(data) => send('SET_FLAGS', data)}
        flags={flags}
        isReview={publication?.type?.name === 'review'}
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
          send('NEXT', { form: flagsFormikBagRef.current })
        }}
      />
    )
  } else if (current.matches({ pending: 'genes' })) {
    step = (
      <GenesStepWrapper
        service={geneMachine}
        genes={genes}
        showAntibodies={publication?.type?.name === 'paper'}
        prevClick={() => send('PREV')}
        nextClick={() => send('NEXT')}
        nextProps={{ disabled: genes.length > 100 }}
      />
    )
  } else if (current.matches({ pending: 'confirm' })) {
    step = (
      <ConfirmStepWrapper
        submission={current.context.submission}
        dispatch={send}
        prevClick={() => send('PREV')}
        nextClick={() => send('NEXT', { client })}
      />
    )
  } else if (current.matches({ submitted: 'success' })) {
    step = (
      <SubmitStepWrapper
        submission={current.context.submission}
        nextClick={() => {
          send('START_OVER')
          history.push('/')
        }}
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
  const helpLink = (
    <a
      className="btn btn-info pull-right"
      style={{ margin: '1rem 0 1rem 0' }}
      href="https://wiki.flybase.org/wiki/FlyBase:Fast-Track_Your_Paper">
      Help
    </a>
  )

  return (
    <div
      css={`
        min-width: 60vw;
        padding: 2em 0;
      `}>
      {helpLink}
      <StepIndicator steps={steps} currentStep={currentStepIdx} />
      <Divider />
      <div
        css={`
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          font-size: 18px;
        `}>
        {step}
        <Divider />
        <StepIndicator steps={steps} currentStep={currentStepIdx} />
      </div>
    </div>
  )
}

export default StepContainer
