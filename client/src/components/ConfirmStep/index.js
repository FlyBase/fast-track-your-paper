import React from 'react'

const ConfirmStep = ({ submission = {} }) => {
  return (
    <>
      <div>Confirm step</div>
      <pre>{JSON.stringify(submission, null, 2)}</pre>
    </>
  )
}

export default ConfirmStep
