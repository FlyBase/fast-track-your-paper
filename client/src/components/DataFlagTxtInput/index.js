import { useField } from 'formik'
import React from 'react'

const DataFlagTxtInput = ({ ...props }) => {
  const [field, meta] = useField({ ...props, type: 'textarea' })

  return (
    <>
      <input className="form-control" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  )
}

export default DataFlagTxtInput
