import { useField } from 'formik'
import React from 'react'

import './index.css'

const GeneBatchInput = (props) => {
  const [field, meta] = useField({ ...props, type: 'textarea' })
  const hasError = meta.touched && meta.error

  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <textarea
        className="form-control batch-input"
        {...field}
        {...props}></textarea>
      {hasError ? <div className="text-danger">{meta.error}</div> : null}
    </div>
  )
}

export default GeneBatchInput
