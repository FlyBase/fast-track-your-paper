import { useField } from 'formik'
import React from 'react'

const DataFlagTextArea = ({ children, style = {}, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'textarea' })

  if (meta.touched && meta.error) {
    style.backgroundColor = '#f2dede'
  }

  return (
    <>
      <textarea className="form-control" style={style} {...field} {...props}>
        {children}
      </textarea>
      {
        /*meta.touched &&*/ meta.error ? (
          <div className="text-danger">
            <b>{meta.error}</b>
          </div>
        ) : null
      }
    </>
  )
}

export default DataFlagTextArea
