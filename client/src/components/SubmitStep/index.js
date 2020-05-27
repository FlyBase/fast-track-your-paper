import React from 'react'

const SubmitStep = ({ submission = {}, result, children }) => {
  return (
    <>
      {/** TODO: Add follow up statements based submission flags and genes. */}
      <h2>Thank you!</h2>
      {children}
    </>
  )
}

export default SubmitStep
