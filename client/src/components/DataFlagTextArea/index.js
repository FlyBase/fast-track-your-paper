import { useField } from 'formik'
import React from 'react'

const DataFlagTextArea = ({ children, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'textarea' })

  return (
    <>
      <textarea
        className="form-control"
        style={meta.touched && meta.error ? { backgroundColor: '#f2dede' } : {}}
        {...field}
        {...props}>
        {children}
      </textarea>
      {meta.touched && meta.error ? (
        <div className="text-danger">
          <b>{meta.error}</b>
        </div>
      ) : null}
    </>
  )
}

export default DataFlagTextArea
