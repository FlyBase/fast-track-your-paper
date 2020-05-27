import React from 'react'

const ConfirmStep = ({ submission = {}, children }) => {
  return (
    <>
      <div>Confirm step</div>
      <pre>{JSON.stringify(submission, null, 2)}</pre>
      {children}
    </>
  )
}

export default ConfirmStep
