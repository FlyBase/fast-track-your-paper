import React from 'react'
import PropTypes from 'prop-types'
import { Steps } from 'antd'

import 'antd/dist/antd.css'

const { Step } = Steps

/* See https://ant.design/components/steps/ for full details */
const StepIndicator = ({ steps = [], currentStep = 0, onChange = () => {} }) => {
  return (
    <Steps progressDot size="small" current={currentStep} onChange={onChange}>
      {steps.map((s, i) => (
        /* Disable step indicator if it is the last step. */
        <Step key={s.name} title={s.label} disabled={i === steps.length - 1}/>
      ))}
    </Steps>
  )
}

StepIndicator.propTypes = {
  steps: PropTypes.array.isRequired,
  currentStep: PropTypes.number,
}
export default StepIndicator
