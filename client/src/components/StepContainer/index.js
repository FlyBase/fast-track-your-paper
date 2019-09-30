import React from 'react'
import { useMachine } from '@xstate/react'
import { Divider, Steps } from 'antd'
// eslint-disable-next-line
import styled from 'styled-components/macro'

import 'antd/dist/antd.css'

import { ftypSteps } from './stepMachine'

import PubStep from 'components/PubStep'
import AuthorStep from 'components/AuthorStep'
import FlagsStep from 'components/FlagsStep'
import GenesStep from 'components/GenesStep'
import ConfirmStep from 'components/ConfirmStep'
import SubmitStep from 'components/SubmitStep'

const { Step } = Steps

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

function StepContainer() {
  const [current, send] = useMachine(persistedStepsMachine)
  return (
    <div>
      {/* See https://ant.design/components/steps/ for full details */}
      <Steps progressDot size="small" current={0}>
        <Step title="Publication" />
        <Step title="Submitter Info" />
        <Step title="Data" />
        <Step title="Genes" />
        <Step title="Confirm" />
        <Step title="Finished" />
      </Steps>
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
        <nav>
          <button className="btn btn-primary" onClick={() => send('PREV')}>
            Prev
          </button>
          <button
            className="btn btn-primary"
            onClick={() => send('NEXT', { hasPub: true })}>
            Next
          </button>
        </nav>
      </div>
    </div>
  )
}

export default StepContainer
