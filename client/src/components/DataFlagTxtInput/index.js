import { useField } from 'formik'
import React from 'react'

const DataFlagTxtInput = ({ ...props }) => {
  const [field, meta] = useField({ ...props, type: 'input' })

  return (
    <>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : (
        <input className="form-control" {...field} {...props} />
      )}
    </>
  )
}

export default DataFlagTxtInput
