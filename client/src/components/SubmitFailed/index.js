import React from 'react'

const SubmitFailed = ({ error, onRetry }) => {
  return (
    <>
      <h2>Submission Failed</h2>
      <div></div>
      <button onClick={onRetry}>Retry</button>
    </>
  )
}

export default SubmitFailed
