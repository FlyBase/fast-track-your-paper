import React from 'react'
import PropTypes from 'prop-types'
import { Steps } from 'antd'

import 'antd/dist/antd.css'

const { Step } = Steps

/* See https://ant.design/components/steps/ for full details */
const StepIndicator = ({ steps = [], currentStep = 0, onChange = null }) => {
  return (
    <Steps size="small" current={currentStep} onChange={onChange}>
      {steps.map((s, i) => (
        /* Disable step indicator if it is the last step. */
        <Step key={s.name} title={s.label} status={null} />
      ))}
    </Steps>
  )
}

StepIndicator.propTypes = {
  steps: PropTypes.array.isRequired,
  currentStep: PropTypes.number,
  onChange: PropTypes.func,
}
export default StepIndicator
