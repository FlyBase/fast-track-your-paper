import React from 'react'

const ConfirmStep = ({ submission = {} }) => {
  return (
    <>
      <div>Confirm step</div>
      <b>Publication:</b> {submission.publication.miniref}
      <pre>{JSON.stringify(submission, null, 2)}</pre>
    </>
  )
}

export default ConfirmStep

