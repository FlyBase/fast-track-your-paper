import React from 'react'
import { useField } from 'formik'
import IconHelp from 'components/IconHelp'

const DataFlagCheckbox = ({ children, showAllHelp, helpMessage, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'checkbox' })
  return (
    <div className="checkbox">
      <label>
        <input type="checkbox" {...field} {...props} />
        {children}
      </label>
      {helpMessage && <IconHelp initial={showAllHelp} message={helpMessage} />}
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </div>
  )
}

export default DataFlagCheckbox
