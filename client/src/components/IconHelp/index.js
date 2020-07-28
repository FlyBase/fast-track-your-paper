import React from 'react'
import './index.css'

import { useStateFromProp } from '../../hooks/useStateFromProp'

const IconHelp = ({ initial = true, message = '', btnClasses = '', children = null }) => {
  const [isVisible, setIsVisible] = useStateFromProp(initial)

  const handleOnClick = (e) => {
    setIsVisible(!isVisible)
    e.preventDefault()
  }

  return (
    <>
      <button className={"btn btn-link "+btnClasses} onClick={handleOnClick}>
        <i className="fa fa-question-circle"></i>
      </button>
      {isVisible && (
        <div className="small text-info message">
          <em>
            {message}
            {children}
          </em>
        </div>
      )}
    </>
  )
}

export default IconHelp
