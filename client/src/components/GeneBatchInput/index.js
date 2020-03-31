import { useField } from 'formik'
import React from 'react'

const GeneBatchInput = (props) => {
  const [field, meta] = useField({ ...props, type: 'textarea' })
  const hasError = meta.touched && meta.error

  return (
    <div className={`form-group ${hasError ? 'has-error' : ''}`}>
      <textarea className="form-control" {...field} {...props}></textarea>
      {hasError ? <div className="text-danger">{meta.error}</div> : null}
    </div>
  )
}

export default GeneBatchInput
