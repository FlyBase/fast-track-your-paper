import { useField } from 'formik'
import React from 'react'

const DataFlagTextArea = ({ children, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'textarea' })

  return (
    <>
      <textarea className="form-control" {...field} {...props}></textarea>
      {children}
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  )
}

export default DataFlagTextArea
