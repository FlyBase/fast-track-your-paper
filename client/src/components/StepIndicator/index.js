import React from 'react'
import PropTypes from 'prop-types'
import { Steps } from 'antd'

import 'antd/dist/antd.css'

const { Step } = Steps

/* See https://ant.design/components/steps/ for full details */
const StepIndicator = ({ steps = [], currentStep = 0 }) => {
  return (
    <Steps progressDot size="small" current={currentStep}>
      {steps.map(s => (
        <Step key={s.name} title={s.label} />
      ))}
    </Steps>
  )
}

StepIndicator.propTypes = {
  steps: PropTypes.array.isRequired,
  currentStep: PropTypes.number,
}
export default StepIndicator
